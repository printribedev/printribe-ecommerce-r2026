import Link from "next/link";
import { canAccess, requireAdmin, type AdminSection } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV: { section: AdminSection; label: string; href: string | null }[] = [
  { section: "categories", label: "Categories", href: "/admin/categories" },
  { section: "products", label: "Products", href: "/admin/products" },
  { section: "orders", label: "Orders", href: "/admin/orders" },
  { section: "customers", label: "Customers", href: null },
  { section: "coupons", label: "Coupons", href: null },
  { section: "shipping", label: "Shipping & tax", href: null },
  { section: "content", label: "Content", href: null },
  { section: "settings", label: "Settings", href: null },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  const items = NAV.filter((n) => canAccess(profile, n.section));

  return (
    <div className="min-h-screen md:flex">
      <nav className="border-b border-neutral-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:block">
          <Link href="/admin" className="text-lg font-bold">
            Print<span className="text-tribe">ribe</span>
            <span className="ml-2 text-xs font-medium text-neutral-500">admin</span>
          </Link>
        </div>
        <ul className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {items.map((n) => (
            <li key={n.section} className="shrink-0">
              {n.href ? (
                <Link
                  href={n.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-tribe-light"
                >
                  {n.label}
                </Link>
              ) : (
                <span className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-neutral-400">
                  {n.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
