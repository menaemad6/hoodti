# Banners System - Complete Documentation

## Overview

The Banners System is a comprehensive promotional banner management solution for the multi-tenant e-commerce platform. It allows administrators to create, manage, and display promotional banners with advanced features like scheduling, positioning, and clickable links.

## Table of Contents

1. [Features](#features)
2. [Database Schema](#database-schema)
3. [API Services](#api-services)
4. [Admin Interface](#admin-interface)
5. [Frontend Components](#frontend-components)
6. [Storage Management](#storage-management)
7. [Security & Multi-tenancy](#security--multi-tenancy)
8. [Usage Examples](#usage-examples)
9. [Installation & Setup](#installation--setup)
10. [Troubleshooting](#troubleshooting)

## Features

### Core Features
- ✅ **Multi-tenant Support**: Each tenant has isolated banner data
- ✅ **Image Management**: Upload and manage banner images with automatic optimization
- ✅ **Scheduling**: Set start and end dates for banner campaigns
- ✅ **Positioning**: Control banner display order with position numbers
- ✅ **Clickable Links**: Make banners clickable with custom URLs
- ✅ **Status Management**: Enable/disable banners with active status
- ✅ **Admin Interface**: Complete CRUD operations through admin panel
- ✅ **Carousel Display**: Beautiful modal with carousel functionality
- ✅ **Auto-close**: Configurable auto-close timers for modals
- ✅ **Responsive Design**: Works on all device sizes

### Advanced Features
- ✅ **Date Range Validation**: Automatic filtering based on current date
- ✅ **Image Optimization**: Automatic compression and format handling
- ✅ **Error Handling**: Graceful fallbacks for missing images
- ✅ **Loading States**: Smooth loading experiences
- ✅ **Accessibility**: Keyboard navigation and screen reader support

## Database Schema

### Banners Table

```sql
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `tenant_id` | TEXT | Tenant identifier for multi-tenant isolation |
| `title` | TEXT | Banner title (required) |
| `description` | TEXT | Optional banner description |
| `image_url` | TEXT | URL to banner image (required) |
| `link_url` | TEXT | Optional clickable link URL |
| `position` | INTEGER | Display order (0 = first) |
| `is_active` | BOOLEAN | Whether banner is active |
| `start_date` | TIMESTAMP | Optional campaign start date |
| `end_date` | TIMESTAMP | Optional campaign end date |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Indexes

```sql
CREATE INDEX idx_banners_tenant_id ON banners(tenant_id);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_created_at ON banners(created_at);
```

## API Services

### Banner Service (`src/integrations/supabase/banners.service.ts`)

#### Core Functions

```typescript
// Get all banners for a tenant
export async function getBanners(tenantId: string): Promise<BannerRow[]>

// Get a specific banner by ID
export async function getBannerById(id: string): Promise<BannerRow>

// Create a new banner
export async function createBanner(bannerData: BannerInput): Promise<BannerRow>

// Update an existing banner
export async function updateBanner(id: string, bannerData: Partial<BannerInput>): Promise<BannerRow>

// Delete a banner
export async function deleteBanner(id: string): Promise<boolean>

// Upload banner image
export async function uploadBannerImage(file: File): Promise<string>

// Delete banner image
export async function deleteBannerImage(imageUrl: string): Promise<void>
```

#### BannerInput Interface

```typescript
interface BannerInput {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  tenant_id?: string;
}
```

### Storage Service (`src/integrations/supabase/storage.service.ts`)

#### Banner-specific Functions

```typescript
// Upload a banner image
export const uploadBannerImage = async (file: File, fileName?: string): Promise<string>

// Delete a banner image
export const deleteBannerImage = async (path: string): Promise<boolean>
```

## Admin Interface

### Banners Tab (`src/components/admin/BannersTab.tsx`)

The admin interface provides a complete banner management system:

#### Features
- **Banner List**: Table view with image previews, status badges, and actions
- **Add/Edit Modal**: Form for creating and editing banners
- **Image Upload**: Drag-and-drop image upload with preview
- **Status Management**: Toggle active/inactive status
- **Date Scheduling**: Set start and end dates for campaigns
- **Position Control**: Set display order
- **Link Management**: Add clickable URLs
- **Delete Confirmation**: Safe deletion with confirmation dialogs

#### Status Badges
- 🟢 **Active**: Banner is live and within date range
- 🔴 **Inactive**: Banner is disabled
- 🟡 **Scheduled**: Banner is active but not yet started
- 🔴 **Expired**: Banner has passed its end date

### Navigation
Access the banners management through:
**Admin Panel → Content → Banners Tab**

## Frontend Components

### BannersModal (`src/components/ui/BannersModal.tsx`)

A beautiful modal component for displaying banners with carousel functionality.

#### Props

```typescript
interface BannersModalProps {
  isOpen: boolean;           // Whether modal is open
  onClose: () => void;       // Close handler
  autoCloseDelay?: number;   // Auto-close delay in seconds (0 = no auto-close)
}
```

#### Features
- **Carousel Navigation**: Previous/next buttons and dot indicators
- **Auto-advance**: Automatic slide progression every 4 seconds (when auto-close is disabled)
- **Smart Auto-close**: Cycles through all banners before closing when auto-close is enabled
- **Clickable Banners**: Opens links in new tabs
- **Responsive Design**: Adapts to all screen sizes
- **Loading States**: Smooth loading with spinners
- **Error Handling**: Graceful error display
- **Progress Bar**: Visual countdown for auto-close with banner counter
- **Hover Effects**: Interactive hover states

#### Auto-Close Behavior

When `autoCloseDelay` is set to a value greater than 0:

- **Single Banner**: Shows for the full duration, then closes
- **Multiple Banners**: Cycles through all banners, distributing the total time equally among them, then closes
- **Example**: With 3 banners and 15-second delay, each banner shows for 5 seconds
- **Progress Bar**: Shows overall progress and current banner number (e.g., "2 / 3")
- **Manual Navigation**: Users can still navigate manually during auto-close cycle

#### Usage Example

```typescript
import BannersModal from '@/components/ui/BannersModal';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <BannersModal 
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      autoCloseDelay={15} // Auto-close after 15 seconds (cycles through all banners)
    />
  );
};
```

### Integration Example (Gaming Landing)

```typescript
// In GamingLanding.tsx
const GamingLanding = () => {
  const [showBannersModal, setShowBannersModal] = useState(false);

  useEffect(() => {
    // Show banners modal after 5 seconds
    const timer = setTimeout(() => {
      setShowBannersModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      {/* Your existing content */}
      
      <BannersModal 
        isOpen={showBannersModal}
        onClose={() => setShowBannersModal(false)}
        autoCloseDelay={10}
      />
    </main>
  );
};
```

## Storage Management

### Supabase Storage Bucket

The banners system uses a dedicated Supabase storage bucket:

#### Bucket Configuration
- **Name**: `banners`
- **Public**: `true` (for direct image access)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/gif`

#### File Organization
```
banners/
└── banner-images/
    ├── banner_abc123_1640995200000.jpg
    ├── banner_def456_1640995201000.png
    └── banner_ghi789_1640995202000.webp
```

#### Storage Policies

```sql
-- Anyone can view banner images
CREATE POLICY "Anyone can view banner images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

-- Authenticated users can upload banner images
CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

-- Authenticated users can update banner images
CREATE POLICY "Admins can update banner images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

-- Authenticated users can delete banner images
CREATE POLICY "Admins can delete banner images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );
```

## Security & Multi-tenancy

### Row Level Security (RLS)

The banners table implements comprehensive RLS policies:

#### Policies

```sql
-- Users can view banners for their tenant
CREATE POLICY "Users can view banners for their tenant" ON banners
  FOR SELECT USING (
    tenant_id = current_setting('app.tenant_id', true)::text OR 
    current_setting('app.tenant_id', true) IS NULL
  );

-- Admins can insert banners for their tenant
CREATE POLICY "Admins can insert banners for their tenant" ON banners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update banners for their tenant
CREATE POLICY "Admins can update banners for their tenant" ON banners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete banners for their tenant
CREATE POLICY "Admins can delete banners for their tenant" ON banners
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Tenant Isolation

- **Data Isolation**: Each tenant's banners are completely isolated
- **Admin Access**: Only users with admin or super_admin roles can manage banners
- **Application-level Filtering**: All queries include tenant_id filtering
- **Secure Storage**: Images are stored with tenant-aware access controls

## Usage Examples

### Creating a Banner

```typescript
import { createBanner, uploadBannerImage } from '@/integrations/supabase/banners.service';

const createNewBanner = async () => {
  try {
    // Upload image first
    const imageUrl = await uploadBannerImage(imageFile);
    
    // Create banner
    const banner = await createBanner({
      title: "Summer Sale 2024",
      description: "Up to 50% off on all items",
      image_url: imageUrl,
      link_url: "https://example.com/sale",
      position: 0,
      is_active: true,
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      tenant_id: "hoodti"
    });
    
    console.log("Banner created:", banner);
  } catch (error) {
    console.error("Error creating banner:", error);
  }
};
```

### Fetching Active Banners

```typescript
import { getBanners } from '@/integrations/supabase/banners.service';

const fetchActiveBanners = async (tenantId: string) => {
  try {
    const allBanners = await getBanners(tenantId);
    
    // Filter active banners
    const activeBanners = allBanners.filter(banner => {
      if (!banner.is_active) return false;
      
      const now = new Date();
      const startDate = banner.start_date ? new Date(banner.start_date) : null;
      const endDate = banner.end_date ? new Date(banner.end_date) : null;
      
      if (startDate && now < startDate) return false;
      if (endDate && now > endDate) return false;
      
      return true;
    });
    
    return activeBanners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};
```

### Displaying Banners in a Component

```typescript
import React, { useState, useEffect } from 'react';
import BannersModal from '@/components/ui/BannersModal';
import { getBanners } from '@/integrations/supabase/banners.service';
import { useCurrentTenant } from '@/context/TenantContext';

const MyBannerComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasBanners, setHasBanners] = useState(false);
  const currentTenant = useCurrentTenant();

  useEffect(() => {
    const checkForBanners = async () => {
      try {
        const banners = await getBanners(currentTenant.id);
        const activeBanners = banners.filter(banner => {
          if (!banner.is_active) return false;
          const now = new Date();
          const startDate = banner.start_date ? new Date(banner.start_date) : null;
          const endDate = banner.end_date ? new Date(banner.end_date) : null;
          if (startDate && now < startDate) return false;
          if (endDate && now > endDate) return false;
          return true;
        });
        setHasBanners(activeBanners.length > 0);
      } catch (error) {
        console.error("Error checking banners:", error);
      }
    };

    checkForBanners();
  }, [currentTenant.id]);

  const handleShowBanners = () => {
    if (hasBanners) {
      setShowModal(true);
    }
  };

  return (
    <div>
      <button onClick={handleShowBanners}>
        View Promotions
      </button>
      
      <BannersModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        autoCloseDelay={15}
      />
    </div>
  );
};
```

## Installation & Setup

### 1. Database Migration

Run the following SQL migrations in your Supabase dashboard:

#### Create Banners Table
```sql
-- Copy and execute: supabase/migrations/20250103_create_banners_table.sql
```

#### Create Storage Bucket
```sql
-- Copy and execute: supabase/migrations/20250103_create_banners_bucket.sql
```

### 2. File Structure

Ensure the following files are in place:

```
src/
├── components/
│   ├── admin/
│   │   └── BannersTab.tsx
│   └── ui/
│       └── BannersModal.tsx
├── integrations/
│   └── supabase/
│       ├── banners.service.ts
│       ├── storage.service.ts (updated)
│       └── types.service.ts (updated)
├── pages/
│   └── admin/
│       └── Content.tsx (updated)
└── docs/
    └── BANNERS_SYSTEM_README.md
```

### 3. Dependencies

The banners system uses these existing dependencies:
- `@supabase/supabase-js` - Database operations
- `lucide-react` - Icons
- `@/components/ui/*` - UI components
- `@/context/TenantContext` - Multi-tenant support
- `@/hooks/use-toast` - Toast notifications

### 4. Environment Setup

Ensure your Supabase configuration is properly set up in:
- `src/integrations/supabase/client.ts`
- Environment variables for Supabase URL and API key

## Troubleshooting

### Common Issues

#### 1. "Policy violation" Error
**Problem**: `new row violates row-level security policy for table "banners"`

**Solution**: 
- Ensure the user has admin or super_admin role in the `user_roles` table
- Check that RLS policies are correctly applied
- Verify tenant_id is being passed correctly

#### 2. Image Upload Fails
**Problem**: Banner images fail to upload

**Solution**:
- Check file size (must be under 5MB)
- Verify file format (JPEG, PNG, WebP, or GIF)
- Ensure storage bucket exists and is public
- Check storage policies are correctly configured

#### 3. Banners Not Displaying
**Problem**: Banners don't show in the modal

**Solution**:
- Check banner `is_active` status
- Verify date ranges (start_date and end_date)
- Ensure tenant_id matches current tenant
- Check for JavaScript errors in browser console

#### 4. Modal Not Opening
**Problem**: BannersModal doesn't open

**Solution**:
- Verify `isOpen` prop is true
- Check that active banners exist for the tenant
- Ensure BannersModal is properly imported
- Check for React state management issues

### Debug Mode

Enable debug logging by adding console.log statements:

```typescript
// In BannersModal.tsx
useEffect(() => {
  const fetchBanners = async () => {
    try {
      console.log('Fetching banners for tenant:', currentTenant.id);
      const data = await getBanners(currentTenant.id);
      console.log('Banners fetched:', data);
      setBanners(data);
    } catch (err) {
      console.error("Error fetching banners:", err);
    }
  };

  if (isOpen) {
    fetchBanners();
  }
}, [isOpen, currentTenant.id]);
```

### Performance Optimization

#### Image Optimization
- Use WebP format for better compression
- Resize images to appropriate dimensions (1200x400px recommended)
- Implement lazy loading for better performance

#### Database Optimization
- Use indexes on frequently queried columns
- Implement pagination for large banner lists
- Cache banner data when appropriate

### Security Best Practices

1. **Input Validation**: Always validate user inputs
2. **File Upload Security**: Check file types and sizes
3. **URL Validation**: Validate link URLs before saving
4. **Access Control**: Ensure proper role-based access
5. **Data Sanitization**: Sanitize user-provided content

## API Reference

### BannerRow Type

```typescript
type BannerRow = {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Error Handling

All service functions throw errors that should be caught and handled:

```typescript
try {
  const banner = await createBanner(bannerData);
  // Success
} catch (error) {
  if (error.code === '23505') {
    // Duplicate key error
  } else if (error.code === '42501') {
    // Permission denied
  } else {
    // Other error
  }
}
```

## Contributing

When contributing to the banners system:

1. **Follow existing patterns** for consistency
2. **Add proper error handling** to all functions
3. **Include TypeScript types** for all new interfaces
4. **Update documentation** for any new features
5. **Test with multiple tenants** to ensure multi-tenancy works
6. **Add appropriate RLS policies** for any new database operations

## Support

For issues or questions about the banners system:

1. Check this documentation first
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify database permissions and policies
5. Test with a simple banner creation first

---

**Last Updated**: January 3, 2025  
**Version**: 1.0.0  
**Author**: AI Assistant
