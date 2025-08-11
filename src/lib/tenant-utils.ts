import { useCurrentTenant } from '@/context/TenantContext';
import type { Tenant } from '@/lib/tenants';

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

// =========================
// Color utilities for theming
// =========================

function normalizeHex(hex: string): string | null {
  if (!hex) return null;
  let value = hex.trim();
  if (value.startsWith('#')) value = value.slice(1);
  if (value.length === 3) {
    value = value.split('').map((c) => c + c).join('');
  }
  if (value.length !== 6) return null;
  return `#${value.toLowerCase()}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

function rgbToHslComponents(r: number, g: number, b: number): { h: number; s: number; l: number } {
  // Convert RGB [0,255] to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hexToHslVarValue(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s, l } = rgbToHslComponents(rgb.r, rgb.g, rgb.b);
  return `${h} ${s}% ${l}%`;
}

function relativeLuminanceFromRgb(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const cNorm = c / 255;
    return cNorm <= 0.03928 ? cNorm / 12.92 : Math.pow((cNorm + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function chooseForegroundForHex(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '0 0% 100%'; // default to white
  const lum = relativeLuminanceFromRgb(rgb.r, rgb.g, rgb.b);
  // Threshold ~0.5 for contrast; darker backgrounds -> white text, lighter -> near-black
  return lum > 0.5 ? '222.2 84% 4.9%' : '0 0% 100%';
}

export function applyTenantThemeFromTenant(tenant: Tenant): void {
  if (typeof document === 'undefined' || !tenant) return;

  const root = document.documentElement;

  const primary = hexToHslVarValue(tenant.primaryColor);
  const secondary = hexToHslVarValue(tenant.secondaryColor);
  const primaryForeground = chooseForegroundForHex(tenant.primaryColor);
  const secondaryForeground = chooseForegroundForHex(tenant.secondaryColor);

  if (primary) root.style.setProperty('--primary', primary);
  if (primaryForeground) root.style.setProperty('--primary-foreground', primaryForeground);

  if (secondary) root.style.setProperty('--secondary', secondary);
  if (secondaryForeground) root.style.setProperty('--secondary-foreground', secondaryForeground);

  // Align accent and ring to tenant brand
  if (secondary) root.style.setProperty('--accent', secondary);
  if (secondaryForeground) root.style.setProperty('--accent-foreground', secondaryForeground);
  if (primary) root.style.setProperty('--ring', primary);

  // Mark current tenant on <html>
  root.setAttribute('data-tenant', tenant.id);
}
