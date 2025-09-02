import { useCurrentTenant } from '@/context/TenantContext';
import React, { lazy } from 'react'

const Index = lazy(() => import("@/pages/Index"));

const LandingPage = () => {
    const currentTenant = useCurrentTenant();
    if(currentTenant.id === 'gamezoo') {
        // return <GamingLanding />
        return <React.Fragment />
    }
    return <Index />
}

export default LandingPage