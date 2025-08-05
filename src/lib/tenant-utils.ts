import { useCurrentTenant } from '@/context/TenantContext';

/**
 * Get the current tenant ID from the context
 */
export function getCurrentTenantId(): string {
  // This will be called from components that have access to the tenant context
  // For server-side or utility functions, we'll need to pass tenant ID explicitly
  return 'hoodti'; // Default fallback
}

/**
 * Create a tenant-specific email for user management
 * This is an alternative approach to the +tenant_id modification
 */
export function createTenantEmail(email: string, tenantId: string): string {
  if (!email || !tenantId) return email;
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  // Add tenant_id as a suffix to the local part
  return `${localPart}+${tenantId}@${domain}`;
}

/**
 * Extract original email from tenant-specific email
 */
export function extractOriginalEmail(tenantEmail: string): string {
  if (!tenantEmail) return tenantEmail;
  
  const [localPart, domain] = tenantEmail.split('@');
  if (!domain) return tenantEmail;
  
  // Remove the +tenant_id suffix
  const originalLocalPart = localPart.split('+')[0];
  return `${originalLocalPart}@${domain}`;
}

/**
 * Extract tenant ID from tenant-specific email
 */
export function extractTenantIdFromEmail(tenantEmail: string): string | null {
  if (!tenantEmail) return null;
  
  const [localPart] = tenantEmail.split('@');
  if (!localPart) return null;
  
  const parts = localPart.split('+');
  if (parts.length < 2) return null;
  
  return parts[1];
}

/**
 * Check if an email is tenant-specific
 */
export function isTenantSpecificEmail(email: string): boolean {
  if (!email) return false;
  
  const [localPart] = email.split('@');
  if (!localPart) return false;
  
  return localPart.includes('+');
} 