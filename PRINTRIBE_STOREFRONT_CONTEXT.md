# Printribe Storefront — Project Context

Public ecommerce site for Printribe (custom print & apparel, India). Printful-style: browse, upload artwork, customise on a 2D mockup, pay, track. Separate project from the internal CRM at `U:\printribe-crm\` (Next.js + Supabase + Prisma, hosted on Vercel).

**Status (2026-10-17):** Phase 1 (foundation) code written; `npm run build` passes. Not yet connected to a real Supabase/R2 project — fill `.env.local` from `.env.example`, then `npx prisma db push`. Project folder: `U:\printribe-ecommerce\`.

**Hosting (2026-10-17):** GitHub `printribedev/printribe-ecommerce-r2026` (branch `main`, auto-deploys). Vercel `printribe-kannada-rajyotsava.vercel.app`. Supabase project `fjitzkwflwyflhgzrmer` (separate from CRM `awdbxuiotsifsijbkmmq`); tables created via `prisma db push`. Admin = `theprintribe@gmail.com` (via `ADMIN_EMAILS`); sign-in works, `/admin` loads. `/api/health` shows which settings the live site sees (no values) and DB reachability. `.env.local` is gitignored; Prisma doesn't read it, so load `DATABASE_URL`/`DIRECT_URL` into the shell before `prisma db push`. Use pooler URLs: `DATABASE_URL` = transaction pooler :6543 + `?pgbouncer=true`, `DIRECT_URL` = session pooler :5432. **Remaining:** Cloudflare R2 (6 env vars + CORS on both buckets), Supabase redirect URLs, add the same vars to Vercel.

**Phase 1 delivered:** Next 14 + Tailwind 3 (Tribe Red tokens, Inter), Prisma 6 schema (`prisma/schema.prisma`, all money in paise), Supabase auth (email link + Google, `/login`, `/auth/callback`), middleware guarding `/admin` and `/account`, roles in `Profile` (CUSTOMER / STAFF with `permissions[]` / ADMIN; first admins via `ADMIN_EMAILS`), `src/lib/auth.ts` guards, R2 helpers + `/api/uploads/presign` (catalogue = staff only → public bucket; artwork = anyone → private bucket, type/size checked). Defaults chosen: team-ready admin roles, per-state `ShippingRate`, checkout preview is final approval.

**Phase 2 delivered (build passes, NOT yet run against a real DB/R2):** `/admin` shell with permission-filtered nav; `/admin/categories` (CRUD, parent, image, sort, visibility); `/admin/products` list/new/edit with details+pricing (base price, GST, HSN, MOQ), bulk-price tiers, print areas (mm size + fee), size×colour variant generator with per-variant price change/stock, product photos, and a drag-the-rectangle mockup editor (per colour × print area, rect stored as 0–1 fractions, locked to real print aspect). Server actions in `src/app/admin/*/actions.ts` call `requireAdmin(section)` and `revalidateTag("catalogue")`. Price maths in `src/lib/pricing.ts`. Schema change: `Mockup` is now per colour (`productId + colorName + printAreaId`), not per variant. **R2 public bucket needs CORS allowing PUT from the site origin for uploads to work.**

**Quick order page (stop-gap, built after phase 2):** `/order` is ONE hard-coded product (`src/lib/quick-product.ts` — edit price/sizes/colours there). Customer picks colour/size/qty (live price, recomputed server-side), enters delivery details → creates an `Order` (PENDING_PAYMENT, guest or signed-in) → `/order/[token]` shows the UPI QR (`public/upi-qr.png`, copied from the CRM) and a payment-screenshot upload (private R2 bucket, `Order.paymentProofKey`). Staff verify in `/admin/orders` (screenshot via signed URL) → "Confirm payment received" → move through stages by hand. Prices are GST-inclusive; tax split is not stored yet. Replaced later by `/products/[slug]` + Razorpay; manual UPI flow can stay as a fallback. **Private R2 bucket also needs a CORS rule (PUT from the site origin) for customer uploads.**

**Known gaps to close later:** rate-limit the artwork presign route (guests can call it); SVG artwork must never be inlined in the DOM; Google OAuth needs enabling in Supabase.

## Stack
Next.js 14+ (App Router, TS), Supabase (Auth + Postgres), Prisma, Tailwind, Razorpay, Resend (`noreply@printribe.in`), Cloudflare R2, Vercel. Konva (`react-konva`) for the customiser. Domain: TBD (Resend can't send from printribe.in until DNS is verified — use Resend test sender in dev).

Brand: Tribe Red `#EE3C30`, white/off-white, Inter.

## Principles
1. **Nothing static.** All content lives in the DB and is edited in `/admin`: products, categories, variants, images, mockups, print areas, prices, homepage banners/sections, nav/footer, size charts, policy pages, shipping rates, GST rates, coupons, email text, site settings. Pages are cached and refreshed via `revalidateTag` when admin saves.
2. **Pricing is set at product level** (admin): base price, optional per-variant adjustment, optional per-placement fee, optional quantity tiers, GST rate + HSN. Server recalculates every total at checkout; never trust the browser.
3. **Storefront and CRM have separate DBs**, joined by one signed API call. No shared tables.
4. Prices stored as integer paise. Designs stored as layer JSON + original file (not just a screenshot).
5. Admin panel lives inside the storefront app (`/admin`, role-gated), not in the CRM.

## Architecture
```
Customer ─► Storefront (Vercel) ◄─ Admin (/admin, staff roles)
              │ reads all from DB
   Supabase (Auth+Postgres)   R2 (public catalogue + private artwork)
              │
 Razorpay webhook ─► paid order ─► outbox ─► signed POST ─► CRM /api/intake/web-orders
              ▲                                                   │
              └──── CRM stage change ─► signed webhook ───────────┘
```
- Razorpay: order created server-side; verified by signature on return AND webhook (`payment.captured` is source of truth). Emails sent from the webhook, idempotent.
- Outbox table + retry job (Vercel Cron, or Inngest/QStash) so CRM downtime never loses an order.
- Uploads: presigned R2 URLs direct from browser; validate type/size; sanitise SVG. Private bucket for artwork, signed URLs only.

## CRM findings (read from `U:\printribe-crm`, 2026-10-17)
- `middleware.ts` redirects everything to `/login` without a Supabase user → new `/api/intake/*` must be excluded and protected by an HMAC secret header.
- `Order.id` is a caller-supplied string (`PT/…`, contains `/` → `encodeURIComponent` in fetches). Intake endpoint must generate the next number itself.
- `Order` has one `product` text field (JSON lines), one `qty`, `saleValue`, `gst`. One web order → one CRM order; cart lines in the JSON, artwork links in an `OrderNote`.
- Match `Client` by email/phone; if none, create with `segment: B2C`.
- New orders start at stage `design` with a full `OrderTimeline` (stages: design, sampling, production, qc, dispatch, delivered, delivered_pending) — fits the Kanban unchanged.
- CRM already uses R2 (`R2_*`) and Resend (`RESEND_API_KEY`); same Cloudflare account can be reused with storefront-specific buckets.
- **CRM changes required (only these):** (1) `POST /api/intake/web-orders`; (2) `source` + `externalRef` (Razorpay payment ID, unique) columns on `Order`; (3) signed status-webhook call on stage change. Schema change ⇒ run `npx prisma db push` against production, and `npm run build` before any push.

## Features (Printful reference)
- Products have **placements** (front/back/sleeve/pocket), each with print rectangle (mm → DPI check), mockup per colour, optional placement fee.
- Design maker: upload, drag/scale/rotate, text, live mockup, low-res warning, saved designs ("My designs"), reorder.
- Live price as qty/size/placements change.
- Order page with timeline: Received → In design → In production → QC → Shipped → Delivered (mirrors CRM stages).

## Customer accounts (Shopify-style)
Supabase Auth (email OTP / Google, optional password). Account: order history + status timeline, invoice download (CRM generates GST invoices), saved addresses, saved designs, one-click reorder. Guest checkout allowed; magic link to track; guest orders attach to account on signup with same email.

## Admin sections
Products, Categories, Mockups & print areas, Orders (read-only + support notes), Customers, Coupons, Shipping & tax, Content (banners, pages, menus), Settings.

## Data model (storefront DB)
Category, Product, ProductVariant, PrintArea, PriceTier, Design, Cart, CartItem, Order, OrderItem (price + design snapshot), Payment, OutboxEvent, Customer, Address, Coupon, ShippingRate, ContentBlock/Page/Menu, SiteSetting, AdminUser/Role.

## India specifics
GST: CGST+SGST same-state, IGST otherwise; HSN per product. Shipping: pincode/state-based, Shiprocket later. COD: skip for v1. Returns: custom goods non-returnable — say so clearly. DPDP Act privacy policy + consent.

## Build phases
1. Foundation: repo, Prisma schema, Supabase Auth, roles, R2, brand tokens
2. Admin v1: categories, products, variants, pricing, mockups/print areas, image upload
3. Storefront catalogue from DB with revalidation
4. Customiser (Konva) driven by admin print areas
5. Cart, checkout, Razorpay (test mode)
6. CRM intake endpoint, outbox, status webhook
7. Customer accounts, order history, emails
8. Admin content mgmt (banners, menus, pages, coupons, shipping); launch hardening (rate limits, Sentry, domain/DNS, live keys)

## Risks
Customiser scope creep (keep v1 minimal); mockup assets are content work; artwork file safety; domain DNS needed before launch email.

## Open decisions (recommended defaults in bold)
1. Admin users: **team-ready roles, mirroring CRM `UserPermission`** vs. single admin.
2. Shipping: **per-state rates, configurable in admin** (flat / free-over-threshold also supported).
3. Approval: **checkout live preview is final** vs. mockup approval after payment.
4. GST registration / GST invoices from day one: unconfirmed.
5. Who prints (in-house vs outsourced): unconfirmed — affects print-file formats.
