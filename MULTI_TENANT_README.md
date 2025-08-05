# Multi-Tenant E-commerce System

This document explains how the multi-tenant system has been implemented in the e-commerce application.

## Overview

The application has been transformed from a single-tenant to a multi-tenant system, allowing multiple e-commerce stores to run on the same platform with isolated data and configurations.

## Architecture

### 1. Tenant Configuration (`src/lib/tenants.ts`)

The tenant configuration is centralized in `src/lib/tenants.ts` where each tenant is defined with:

- **Basic Info**: ID, name, domain, logo
- **Branding**: Primary/secondary colors
- **Business Settings**: Currency, contact information
- **Features**: Toggleable features (wishlist, reviews, loyalty, live chat)
- **Shipping**: Shipping fees and thresholds
- **Payment**: Payment method availability

### 2. Tenant Context (`src/context/TenantContext.tsx`)

The `TenantContext` manages the current tenant state throughout the application:

- **Automatic Detection**: Determines tenant from URL params, localStorage, or domain
- **State Management**: Provides current tenant information to all components
- **Switching**: Allows programmatic tenant switching

### 3. Database Schema

The database has been updated to support multi-tenancy:

#### Tables with `tenant_id`:
- `products`
- `orders`
- `discounts`
- `delivery_slots`
- `settings`
- `categories`
- `wishlists`

#### Row Level Security (RLS):
- All tenant-aware tables have RLS enabled
- Policies ensure data isolation between tenants
- Uses `current_setting('app.tenant_id')` for filtering

### 4. API Service (`src/integrations/supabase/api.service.ts`)

A unified API service that handles all database operations with tenant awareness:

- **Automatic Tenant Filtering**: All queries automatically filter by tenant
- **Generic CRUD Operations**: Reusable methods for all tables
- **Type Safety**: Full TypeScript support
- **Error Handling**: Consistent error handling across all operations

## Usage

### 1. Using Tenant Context in Components

```tsx
import { useCurrentTenant } from '@/context/TenantContext';

function MyComponent() {
  const tenant = useCurrentTenant();
  
  return (
    <div>
      <h1>Welcome to {tenant.name}</h1>
      <p>Currency: {tenant.currencySymbol}</p>
    </div>
  );
}
```

### 2. Using API Service in Components

```tsx
import { useProductsService } from '@/integrations/supabase/products.service';

function ProductsList() {
  const productsService = useProductsService();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productsService.getProducts({ limit: 10 });
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. Using API Service Outside React

```tsx
import { createProductsService } from '@/integrations/supabase/products.service';

const productsService = createProductsService('hoodti');
const products = await productsService.getProducts();
```

### 4. Switching Tenants

```tsx
import { useTenant } from '@/context/TenantContext';

function TenantSwitcher() {
  const { setTenantById } = useTenant();
  
  return (
    <button onClick={() => setTenantById('streetwear')}>
      Switch to StreetWear
    </button>
  );
}
```

## Tenant Detection Priority

1. **URL Parameter**: `?tenant=hoodti`
2. **LocalStorage**: `currentTenantId`
3. **Domain**: Automatic detection from hostname
4. **Default**: Falls back to first tenant in configuration

## Database Migrations

### 1. Add Tenant Support
```sql
-- Run: supabase/migrations/20241221_add_tenant_support.sql
-- Adds tenant_id to all relevant tables
-- Creates indexes for performance
-- Sets up RLS policies
```

### 2. Add Tenant Context Function
```sql
-- Run: supabase/migrations/20241221_add_tenant_context_function.sql
-- Creates function to set tenant context for RLS
```

## Demo

Visit `/tenant-demo` to see the multi-tenant system in action:

- Switch between different tenants
- View tenant-specific configurations
- See tenant-isolated product data
- Test tenant switching functionality

## Adding New Tenants

1. **Add to Configuration**:
```tsx
// In src/lib/tenants.ts
export const tenants: Tenant[] = [
  // ... existing tenants
  {
    id: "new-tenant",
    name: "New Store",
    domain: "newstore.com",
    // ... other configuration
  }
];
```

2. **Add Sample Data**:
```sql
-- Insert sample data with the new tenant_id
INSERT INTO products (name, price, tenant_id) 
VALUES ('Sample Product', 99.99, 'new-tenant');
```

## Security Considerations

- **Data Isolation**: RLS policies ensure complete data separation
- **Tenant Context**: All database operations are scoped to current tenant
- **No Cross-Tenant Access**: Impossible to access data from other tenants
- **Audit Trail**: All operations are logged with tenant context

## Performance Optimizations

- **Indexes**: Created on `tenant_id` columns for fast filtering
- **Caching**: Tenant context is cached in localStorage
- **Efficient Queries**: API service optimizes database queries
- **Lazy Loading**: Components load tenant-specific data on demand

## Troubleshooting

### Common Issues:

1. **No Data Showing**: Check if tenant_id is set correctly
2. **Permission Errors**: Verify RLS policies are in place
3. **Wrong Tenant**: Clear localStorage and check URL parameters
4. **Migration Issues**: Ensure all migrations have been applied

### Debug Commands:

```sql
-- Check current tenant context
SELECT current_setting('app.tenant_id');

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Check tenant data
SELECT DISTINCT tenant_id FROM products;
```

## Future Enhancements

- **Tenant-specific themes**: Dynamic CSS based on tenant colors
- **Custom domains**: Subdomain routing for each tenant
- **Tenant analytics**: Isolated analytics per tenant
- **Tenant management UI**: Admin interface for managing tenants
- **API rate limiting**: Per-tenant rate limiting
- **Backup/restore**: Tenant-specific data backup 