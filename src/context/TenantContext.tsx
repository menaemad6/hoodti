import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, getTenantById, getTenantByDomain, getDefaultTenant } from '@/lib/tenants';

interface TenantContextType {
  currentTenant: Tenant;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(getDefaultTenant());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine the initial tenant based on URL or subdomain
    const determineInitialTenant = () => {
      const hostname = window.location.hostname;
      const isDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1');
      
      let tenant: Tenant | undefined;
      
      if (isDevelopment) {
        // In development, check for subdomain first
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
          tenant = getTenantById(subdomain);
        }
        
        // If no subdomain tenant found, check URL params
        if (!tenant) {
          const urlParams = new URLSearchParams(window.location.search);
          const tenantParam = urlParams.get('tenant');
          if (tenantParam) {
            tenant = getTenantById(tenantParam);
          }
        }
      } else {
        // In production, check domain first
        tenant = getTenantByDomain(hostname);
        
        // If no domain match, check URL params
        if (!tenant) {
          const urlParams = new URLSearchParams(window.location.search);
          const tenantParam = urlParams.get('tenant');
          if (tenantParam) {
            tenant = getTenantById(tenantParam);
          }
        }
      }
      
      // Fallback to default tenant
      if (!tenant) {
        tenant = getDefaultTenant();
      }
      
      setCurrentTenant(tenant);
      setIsLoading(false);
    };

    determineInitialTenant();
  }, []);

  const value: TenantContextType = {
    currentTenant,
    isLoading,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useCurrentTenant(): Tenant {
  const { currentTenant } = useTenant();
  return currentTenant;
} 