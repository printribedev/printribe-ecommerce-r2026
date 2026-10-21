import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { STOREFRONT_OPEN } from "@/lib/site";

/** Pages that need a signed-in user. Role checks happen in the pages (src/lib/auth.ts). */
const PROTECTED = ["/admin", "/account"];

export async function middleware(request: NextRequest) {
  // If Supabase falls back to the Site URL after an email sign-in, the sign-in code arrives on "/".
  // Hand it to the callback route so the person still gets signed in.
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Storefront sunset: the product page and delivery form show the "closed" page instead.
  // Admin, login and existing order links (/order/<token>) are not touched.
  const path = request.nextUrl.pathname;
  if (!STOREFRONT_OPEN && (path === "/" || path === "/order" || path === "/order/details")) {
    const url = request.nextUrl.clone();
    url.pathname = "/closed";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
