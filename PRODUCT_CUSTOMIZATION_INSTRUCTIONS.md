# Product Customization Feature Implementation Guide

## Overview
This document outlines the implementation of a comprehensive product customization feature that allows users to customize clothing items (hoodies, t-shirts, etc.) with text, images, and colors before adding them to cart.

## Feature Requirements

### Phase 1: UI Implementation
1. **Product Selection Route** (`/customize`)
   - User selects product type from `SIZING_OPTIONS` in `constants.ts`
   - User selects size from available options
   - Display sizing table for selected product type
   - Show product preview (e.g., `blank-hoodie.png`)

2. **Customization Editor**
   - Canvas-based editor using Fabric.js or Konva.js
   - Color picker for product base color
   - Text addition with font selection, size, color, positioning
   - Image upload and positioning
   - Real-time preview of customization

3. **Pricing Display**
   - Text customization: 5 EGP per text element
   - Image customization: 30 EGP per image
   - Prices configurable per tenant in `tenants.ts`

### Phase 2: Database Schema Updates

#### New Tables

1. **Customizations Table**
```sql
CREATE TABLE customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  base_product_type VARCHAR(50) NOT NULL, -- e.g., "Hoodie", "T-shirt"
  base_product_size VARCHAR(10) NOT NULL,
  base_product_color VARCHAR(20) NOT NULL,
  design_data JSONB NOT NULL, -- Stores editor settings, positions, etc.
  preview_image_url TEXT, -- Final flattened design preview
  total_customization_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Update Order Items Table**
```sql
-- Remove product_id requirement, add customization_id
ALTER TABLE order_items 
ADD COLUMN customization_id UUID REFERENCES customizations(id),
ALTER COLUMN product_id DROP NOT NULL;

-- Add constraint to ensure either product_id OR customization_id is present
ALTER TABLE order_items 
ADD CONSTRAINT check_product_or_customization 
CHECK (product_id IS NOT NULL OR customization_id IS NOT NULL);
```

3. **Tenant Customization Settings**
```typescript
// Store in tenants.ts instead of database
// This approach provides faster access and easier configuration management
export interface Tenant {
  // ... other properties
  customization?: {
    textPrice: number;
    imagePrice: number;
    baseProductPrices: {
      [key: string]: number;
    };
    enabled: boolean;
  };
}

// Example configuration in tenants.ts
customization: {
  textPrice: 5.00,
  imagePrice: 30.00,
  baseProductPrices: {
    "Hoodie": 150.00,
    "T-shirt": 80.00,
    "Sweatshirt": 120.00
  },
  enabled: true,
}
```

**Note**: Tenant customization settings are stored locally in `tenants.ts` rather than in the database. This approach provides:
- Faster access to tenant settings
- No database migrations needed for tenant changes
- Easier development and testing
- Version control for tenant configurations

### Phase 3: Storage Bucket Organization

1. **Raw Uploads Bucket** (`customization-uploads`)
   - Store user-uploaded images/logos
   - Temporary storage until order confirmation
   - Cleanup policy for abandoned customizations

2. **Final Designs Bucket** (`customization-designs`)
   - Store completed, flattened design previews
   - Only created after order confirmation
   - Permanent storage for production

### Phase 4: Backend Logic

1. **Customization Service**
   - Create, read, update customizations
   - Calculate pricing based on tenant settings
   - Handle image processing and storage

2. **Order Flow Integration**
   - Add customization to cart
   - Create order item with customization reference
   - Process payment and confirm order
   - Generate final design and store in bucket

## Implementation Steps

### Step 1: Update Tenant Configuration
- Add customization pricing to `tenants.ts` (local configuration)
- Include base product prices per tenant
- **No database changes needed** - all settings stored locally

### Step 2: Create Customization Types
- Define TypeScript interfaces for customization data
- Create service functions for CRUD operations

### Step 3: Build UI Components
- Product selector with sizing information
- Canvas editor with Fabric.js/Konva.js
- Pricing calculator and preview

### Step 4: Database Migration
- Create customizations table
- Update order_items table
- **No tenant table modifications** - customization settings remain local

### Step 5: Backend Services
- Customization service (uses local tenant data)
- Image processing service
- Storage bucket management

### Step 6: Cart Integration
- Modify cart to handle customizations
- Update checkout flow
- Handle order confirmation

## Technical Considerations

### Canvas Library Choice
- **Fabric.js**: Excellent for text manipulation, good React integration
- **Konva.js**: React-specific, great performance, good for complex interactions
- **Recommendation**: Start with Fabric.js for simplicity

### Image Processing
- Client-side: Canvas-based preview generation
- Server-side: Image optimization and storage
- Consider using Sharp.js for Node.js image processing

### Performance
- Lazy load canvas editor
- Debounce canvas updates
- Optimize image uploads with compression

### Security
- Validate uploaded images (type, size, content)
- Sanitize text inputs
- Implement rate limiting for uploads

## File Structure

```
src/
├── pages/
│   └── customize/
│       ├── CustomizeProduct.tsx
│       ├── ProductSelector.tsx
│       ├── SizingTable.tsx
│       └── CustomizationEditor.tsx
├── components/
│   └── customize/
│       ├── ColorPicker.tsx
│       ├── TextEditor.tsx
│       ├── ImageUploader.tsx
│       └── PricingCalculator.tsx
├── services/
│   └── customization.service.ts
├── types/
│   └── customization.types.ts
└── hooks/
    └── useCustomization.ts
```

## Dependencies to Add

```json
{
  "fabric": "^5.3.0",
  "react-fabric": "^1.0.0",
  "react-konva": "^18.2.10",
  "konva": "^9.2.0"
}
```

## Testing Strategy

1. **Unit Tests**
   - Customization service functions
   - Pricing calculations
   - Image processing utilities

2. **Integration Tests**
   - Canvas editor functionality
   - Cart integration
   - Order flow

3. **E2E Tests**
   - Complete customization flow
   - Order placement with customizations

## Deployment Considerations

1. **Environment Variables**
   - Storage bucket configurations
   - Image processing settings
   - Tenant-specific pricing overrides

2. **Monitoring**
   - Canvas performance metrics
   - Image upload success rates
   - Customization completion rates

3. **Backup Strategy**
   - Customization data backup
   - Image storage redundancy
   - Database migration rollback plan

## Future Enhancements

1. **Advanced Features**
   - Template designs
   - Social sharing
   - Design history
   - Collaboration tools

2. **Analytics**
   - Popular customization patterns
   - User behavior tracking
   - Conversion rate optimization

3. **Mobile Optimization**
   - Touch-friendly canvas controls
   - Mobile-specific UI components
   - Progressive Web App features
