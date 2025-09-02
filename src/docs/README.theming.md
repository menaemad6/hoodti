Multi-tenant dynamic color theming

Overview

This project supports dynamic brand colors per tenant without rebuilding. We use Tailwind + shadcn-style CSS variables as the single source of truth, and set those variables from the active tenant at runtime (and before first paint) so the entire UI follows the brand automatically.

How it works

1) Tailwind is mapped to CSS variables
   - See tailwind.config.ts: colors resolve to tokens like `hsl(var(--primary))`, `hsl(var(--background))`, etc.
   - Global tokens live in src/index.css and are neutral by default (no blue tint). Dark mode tokens are also neutral.

2) Tenant colors are defined in code
   - See src/lib/tenants.ts. Each tenant has at least `primaryColor` and `secondaryColor` (hex).

3) Runtime application of tokens
   - src/lib/tenant-utils.ts exposes `applyTenantThemeFromTenant(tenant)`:
     - Converts hex to HSL tokens expected by Tailwind (`--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--ring`).
     - Chooses a readable foreground for contrast.
     - Sets `data-tenant` on <html> for optional scoping.
   - src/context/TenantContext.tsx determines the current tenant (subdomain, query param, or default) and calls `applyTenantThemeFromTenant` whenever the tenant changes.

4) First-paint prevention
   - index.html includes a tiny inline script to detect the tenant and set the critical CSS variables before the app hydrates. This avoids a flash of the default theme.

5) Legacy class compatibility
   - src/styles/brand-overrides.css remaps legacy Tailwind `blue-*` utility classes to the current tenant primary to avoid inconsistent blues without rewriting every file immediately.
   - This is a transitional layer; new code should use tokens such as `bg-primary`, `text-primary-foreground`, `ring-primary`, `bg-muted`, `bg-card`, `border-border`.

What to use in components

- Surfaces and content
  - `bg-background` / `text-foreground`
  - Card/popover: `bg-card text-card-foreground border-border`
  - Muted sections: `bg-muted` (use `/30` or `/40` for subtle fills)
  - Dividers: `border-border`

- Accents and states
  - Primary: `bg-primary text-primary-foreground hover:bg-primary/90 ring-primary`
  - Secondary/accent: `bg-secondary`, `bg-accent` as needed

- Examples
  - Button: `bg-primary text-primary-foreground hover:bg-primary/90`
  - Outline button: `border-border bg-background hover:bg-muted/40`
  - Badges (status): `bg-primary/10 text-primary border-primary/30`
  - Skeletons: `bg-muted/60 dark:bg-muted/40`

Dark mode

- Dark tokens are neutral grays (no blue). The ThemeProvider toggles `dark` on <html>; tokens handle the rest.
- Tenant primary remains the same unless you explicitly adjust it per mode.

Where the code lives

- Tokens: src/index.css
- Tailwind mapping: tailwind.config.ts
- Tenant data: src/lib/tenants.ts
- Apply tokens: src/lib/tenant-utils.ts
- Tenant resolution: src/context/TenantContext.tsx
- First-paint script: index.html
- Transitional overrides: src/styles/brand-overrides.css

Notes

- If adding a new tenant, update src/lib/tenants.ts. Optionally add domain mapping in index.html prepaint script.
- Prefer tokens over hardcoded colors. If you find old `blue-*` classes, replace them or rely on the override stylesheet.
- For chart libraries or non-Tailwind consumers, read `--primary` via `getComputedStyle(document.documentElement).getPropertyValue('--primary')` and convert as needed.

