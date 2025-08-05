# Tenant-Based User Management

## Overview

This document describes the multi-tenant user management system implemented in the Hoodti application. The system ensures that users are properly isolated by tenant while maintaining a seamless user experience.

## How It Works

### 1. Tenant Selection

The application automatically determines the current tenant based on:

**Development Environment:**
- Subdomain (e.g., `hoodti.localhost:3000`, `streetwear.localhost:3000`)
- URL parameters (e.g., `?tenant=hoodti`)
- Falls back to default tenant (`hoodti`)

**Production Environment:**
- Domain matching (e.g., `hoodti.com`, `streetwear.com`)
- URL parameters (e.g., `?tenant=hoodti`)
- Falls back to default tenant (`hoodti`)

### 2. User Email Management

To ensure proper user isolation across tenants, the system uses tenant-specific email addresses:

**Email Format:** `original_email+tenant_id@domain.com`

**Examples:**
- Original: `user@gmail.com`
- Hoodti tenant: `user+hoodti@gmail.com`
- Streetwear tenant: `user+streetwear@gmail.com`

### 3. Database Structure

The `profiles` table includes a `tenant_id` column to track which tenant each user belongs to:

```sql
ALTER TABLE public.profiles 
ADD COLUMN tenant_id TEXT DEFAULT 'hoodti';
```

## Implementation Details

### Tenant Context

The `TenantContext` automatically determines the current tenant and provides it throughout the application:

```typescript
const { currentTenant } = useCurrentTenant();
```

### User Registration

When a user signs up:

1. The system creates a tenant-specific email address
2. Stores the original email in user metadata
3. Creates a profile with the correct `tenant_id`
4. Associates the user with the current tenant

### User Authentication

When a user signs in:

1. The system converts the provided email to a tenant-specific email
2. Authenticates using the tenant-specific email
3. Ensures the user belongs to the current tenant

### Profile Creation

Profiles are automatically created with tenant information:

1. Database trigger creates profile with `tenant_id`
2. Application-level profile creation includes tenant context
3. All profile operations respect tenant boundaries

## Benefits

1. **User Isolation**: Users are completely isolated between tenants
2. **Seamless Experience**: Users don't need to know about tenant-specific emails
3. **Data Security**: Each tenant's data is properly segregated
4. **Scalability**: Easy to add new tenants without code changes

## Migration

Existing users will be automatically migrated to the new system:

1. Existing profiles get `tenant_id = 'hoodti'` by default
2. New users are created with proper tenant association
3. No manual intervention required

## Usage Examples

### Development

```bash
# Access Hoodti tenant
http://hoodti.localhost:3000

# Access Streetwear tenant  
http://streetwear.localhost:3000

# Access with URL parameter
http://localhost:3000?tenant=collab
```

### Production

```bash
# Access Hoodti tenant
https://hoodti.com

# Access Streetwear tenant
https://streetwear.com

# Access with URL parameter
https://hoodti.com?tenant=streetwear
```

## Security Considerations

1. **Email Validation**: The system validates email formats and handles edge cases
2. **Tenant Isolation**: Users cannot access data from other tenants
3. **Database Security**: RLS policies ensure proper data isolation
4. **Authentication**: Tenant-specific emails prevent cross-tenant authentication

## Troubleshooting

### Common Issues

1. **User can't sign in**: Check if the email is being converted to tenant-specific format
2. **Wrong tenant**: Verify the URL/subdomain is correct
3. **Profile not found**: Ensure the profile was created with the correct tenant_id

### Debugging

Enable debug logging to see tenant selection and email conversion:

```typescript
console.log('Current tenant:', currentTenant.id);
console.log('Tenant email:', createTenantEmail('user@gmail.com', 'hoodti'));
``` 