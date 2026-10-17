import { redirect } from "next/navigation";

/** The product page now lives at the site root. Old /order links keep working. */
export default function OrderPage() {
  redirect("/");
}
