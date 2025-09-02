# Blank Product Images for Customization

This document explains what blank product images need to be added to the `public/assets/` folder for the product customization feature to work properly.

## Required Images

The following PNG images should be added to `public/assets/`:

### 1. **blank-hoodie.png**
- **Product**: Hoodie
- **Description**: White/transparent hoodie template
- **Size**: Recommended 400x500px or similar aspect ratio
- **Format**: PNG with transparent background preferred

### 2. **blank-sweatshirt.png**
- **Product**: Sweatshirt
- **Description**: White/transparent sweatshirt template
- **Size**: Recommended 400x500px or similar aspect ratio
- **Format**: PNG with transparent background preferred

### 3. **blank-tshirt.png**
- **Product**: Regular T-shirt, Boxy T-shirt, Slim-Fit T-shirt
- **Description**: White/transparent t-shirt template
- **Size**: Recommended 400x500px or similar aspect ratio
- **Format**: PNG with transparent background preferred

### 4. **blank-oversized-tshirt.png**
- **Product**: Oversized T-shirt
- **Description**: White/transparent oversized t-shirt template
- **Size**: Recommended 400x500px or similar aspect ratio
- **Format**: PNG with transparent background preferred

### 5. **blank-polo.png**
- **Product**: Polo Shirt, Polo Baskota
- **Description**: White/transparent polo shirt template
- **Size**: Recommended 400x500px or similar aspect ratio
- **Format**: PNG with transparent background preferred

## Image Requirements

### Technical Specifications
- **Format**: PNG (preferred) or JPG
- **Background**: Transparent or white background
- **Resolution**: Minimum 400x500px, higher resolution recommended
- **Style**: Clean, simple outlines without text or branding
- **Color**: White/transparent base that can be colored dynamically

### Design Guidelines
- **Simple Outlines**: Clean, clear product silhouettes
- **No Text**: Avoid any text or branding on the template
- **Consistent Style**: All images should have similar visual weight and style
- **Proper Proportions**: Maintain realistic product proportions
- **Neutral Base**: White or transparent base that works with color filters

## How It Works

1. **User Selection**: When a user selects a product type, the corresponding blank image is loaded
2. **Dynamic Coloring**: CSS filters are applied to change the product color based on user selection
3. **Customization Overlay**: Text and images are overlaid on top of the colored product image
4. **Real-time Preview**: Users see their customizations in real-time on the colored product

## Color Filter System

The system uses CSS filters to dynamically change product colors:
- **Predefined Colors**: Common colors have optimized filter values
- **Fallback System**: Unknown colors use hue rotation calculations
- **Performance**: Filters are applied in real-time for instant feedback

## File Structure

```
public/
└── assets/
    ├── blank-hoodie.png
    ├── blank-sweatshirt.png
    ├── blank-tshirt.png
    ├── blank-oversized-tshirt.png
    └── blank-polo.png
```

## Testing

After adding the images:
1. Navigate to `/customize`
2. Select different product types
3. Verify that the correct blank image appears
4. Test color changes to ensure they work properly
5. Verify that text and image overlays work correctly

## Troubleshooting

### Image Not Loading
- Check file paths in `src/lib/constants.ts`
- Verify image files exist in `public/assets/`
- Check browser console for 404 errors

### Colors Not Changing
- Verify CSS filters are being applied
- Check that color values are valid hex codes
- Test with predefined colors first

### Performance Issues
- Optimize image sizes (recommend under 100KB each)
- Use PNG format for better quality/size ratio
- Consider WebP format for modern browsers

## Future Enhancements

- **Multiple Angles**: Add side, back, and detail views
- **Product Variants**: Different styles within the same product type
- **Seasonal Versions**: Summer/winter versions of products
- **Brand Variations**: Different brand-specific templates
