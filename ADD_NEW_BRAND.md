### Add a new brand (tenant)

Use this checklist to onboard a new brand to the multi-tenant storefront. Update all referenced files where noted.

- Basic info you need
  - id: short URL-safe key (e.g., newbrand)
  - name: display name (e.g., New Brand)
  - domain: primary domain or Netlify domain (e.g., newbrand.com)
  - logo path: in `public/` (e.g., `/newbrand-logo.jpg`)
  - colors: primary and secondary hex colors
  - optional SEO and social links

### 1) App tenant registry

- Edit `src/lib/tenants.ts` → add a new object to `tenants[]` with full configuration
  - Required: `id`, `name`, `domain`, `logo`, `primaryColor`, `secondaryColor`, `description`, `currency`, `currencySymbol`, `defaultLanguage`, `contactEmail`, `contactPhone`, `address`
  - Optional but recommended: `seoDescription`, `seoKeywords`, `socialMedia` (twitter/instagram/facebook/youtube), and feature/shipping/payment config

Example:

```ts
// src/lib/tenants.ts
export const tenants: Tenant[] = [
  // ...existing tenants
  {
    id: "newbrand",
    name: "New Brand",
    domain: "newbrand.com",
    logo: "/newbrand-logo.jpg",
    primaryColor: "#112233",
    secondaryColor: "#f7f7f7",
    description: "Your brief brand description.",
    seoDescription: "SEO-friendly brand pitch.",
    seoKeywords: "brand, keywords, here",
    currency: "EGP",
    currencySymbol: "E£",
    defaultLanguage: "en",
    contactEmail: "hello@newbrand.com",
    contactPhone: "+201111111111",
    address: "City, Country",
    socialMedia: { twitter: "https://twitter.com/newbrand" },
    features: { wishlist: true, reviews: true, loyalty: false, liveChat: false },
    shipping: { freeShippingThreshold: 500, defaultShippingFee: 30, expressShippingFee: 50 },
    payment: { cashOnDelivery: true, onlinePayment: false, bankTransfer: false },
  },
];
```

Notes
- Brand name in the UI is read from the current tenant via `TenantContext`; the constant `BRAND_NAME` in `src/lib/constants.ts` already resolves dynamically at runtime.
- CSS theme colors are applied via `applyTenantThemeFromTenant` on tenant change.

### 2) Public assets

- Add logo image to `public/` (e.g., `public/newbrand-logo.jpg`).
- If you use any OG image files, also place them in `public/`.

### 3) Pre-boot theming and meta (index.html)

- Edit `index.html` script mappings to include the new brand:
  - `domainToTenant` → add `"newbrand.com": "newbrand"`
  - `tenantColors` → add your colors
  - `tenantLogos` → add your logo path
  - `tenantMeta` → add name, domain, description, keywords, twitter URL

These mappings power:
- Early CSS variable setup (no FOUC)
- Favicon and basic meta updates for browsers after load

### 4) Server-side meta for link previews (Netlify Edge)

- Edit `netlify/edge-functions/tenant-meta.ts`:
  - `domainToTenant` → add `"newbrand.com": "newbrand"`
  - `tenantMeta` → add an entry with `name`, `domain`, `description`, `image` (logo or OG image), and `twitter`

This ensures Open Graph and Twitter meta are correct for social unfurls (bots generally don’t run client JS).

### 5) DNS/hosting

- Point the brand’s domain (`newbrand.com`) to your Netlify site (or use a custom subdomain per brand).
- Verify the domain resolves to the deployed site.

### 6) Database setup (Supabase)

- For each new tenant id, ensure tenant-scoped settings exist:
  - Shipping fee, tax rate, government shipping mappings if used
  - Discounts and delivery slots if applicable
- Insert sample products/categories with `tenant_id = 'newbrand'`.

SQL examples

```sql
-- Settings (shipping fee)
insert into settings (tenant_id, key, value)
values ('newbrand', 'shipping_fee', '30')
on conflict (tenant_id, key) do update set value = excluded.value;

-- Settings (tax rate)
insert into settings (tenant_id, key, value)
values ('newbrand', 'tax_rate', '0.08')
on conflict (tenant_id, key) do update set value = excluded.value;

-- Example product
insert into products (id, name, price, tenant_id)
values (gen_random_uuid(), 'Sample Tee', 299, 'newbrand');
```

### 7) Where tenant logic lives (reference)

- `src/lib/tenants.ts`: Canonical tenant definitions and helpers
- `src/context/TenantContext.tsx`: Detects tenant (domain/subdomain/?tenant) and applies theme
- `src/lib/constants.ts`: `BRAND_NAME` resolves from active tenant at runtime
- `index.html`: Pre-boot CSS theme and client-side meta/icon updates; add your domain and brand entry in mappings
- `netlify/edge-functions/tenant-meta.ts`: Injects OG/Twitter/meta for crawlers; add your domain and brand entry
- Supabase services (e.g., `src/integrations/supabase/*.service.ts`): Methods accept/use current tenant id; no code changes required when adding a tenant
- SEO (`src/components/seo/SEOHead.tsx`): Reads `useCurrentTenant()`; no changes needed
- Emails (`src/integrations/email.service.ts` + checkout flow): Brand name is provided via `BRAND_NAME` which is dynamic

### 8) Test checklist

- Local
  - `http://localhost:5173/?tenant=newbrand` renders with new colors/logo/name
  - Product lists show only `tenant_id = 'newbrand'` data
- Production
  - `https://newbrand.com` detects the tenant and renders theme
  - Use Facebook Sharing Debugger and Twitter Card Validator to re-scrape and confirm OG/Twitter tags show the new brand name, description, and image
- Emails
  - Place a test order; ensure email brand name and totals are correct

### 9) Common pitfalls

- Forgot to add the domain to both `index.html` and the edge function → wrong meta in previews
- Logo path not present in `public/` → broken favicon/OG image
- Missing settings rows (shipping/tax) for the new tenant → unexpected checkout totals
- Seed data uses a different `tenant_id` → blank storefront

### 10) Optional improvements

- Unify tenant mappings to avoid duplication (load from `/tenants.ts` at build time for `index.html` and edge)
- Add automated seed scripts per tenant
- Add an Admin UI to manage tenant records and settings


