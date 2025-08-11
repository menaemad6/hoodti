import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCurrentTenant } from '@/context/TenantContext';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  canonical?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Hoodti | Streetwear for Urban Culture',
  description = 'Elevate your street game with Hoodti – your plug for exclusive streetwear drops, bold urban fashion, and limited collections.',
  keywords = 'streetwear, urban fashion, hype clothing, sneakers, street style, exclusive drops, Hoodti, streetwear ecommerce, urban culture, fashion, clothing, hoodies, t-shirts, streetwear brand',
  image = '/hoodti-logo.jpg',
  url = 'https://hoodti.com',
  type = 'website',
  author = 'Hoodti',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonical,
}) => {
  const tenant = useCurrentTenant();
  const brandName = tenant?.name || 'Hoodti';
  const domain = tenant?.domain || 'hoodti.com';
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  const siteLogo = (tenant?.logo || '/hoodti-logo.jpg').startsWith('http')
    ? (tenant?.logo || '/hoodti-logo.jpg')
    : `${baseUrl}${tenant?.logo || '/hoodti-logo.jpg'}`;
  const siteDescription = tenant?.description || 'Streetwear for Urban Culture';

  const providedTitle = title || brandName;
  const hasBrand = providedTitle.includes(brandName);
  const fullTitle = hasBrand ? providedTitle : `${providedTitle} | ${brandName}`;
  const fullUrl = canonical || url || baseUrl;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {fullUrl && <link rel="canonical" href={fullUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={deriveTwitterHandle(tenant?.socialMedia?.twitter)} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content={deriveTwitterHandle(tenant?.socialMedia?.twitter)} />
      
      {/* Additional Open Graph Tags for Articles/Products */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.length > 0 && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Structured Data for E-commerce */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": title.replace(` | ${brandName}`, ''),
            "description": description,
            "image": fullImage,
            "url": fullUrl,
            "brand": {
              "@type": "Brand",
              "name": brandName
            },
            "offers": {
              "@type": "Offer",
              "url": fullUrl,
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      )}
      
      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": brandName,
          "url": baseUrl,
          "logo": siteLogo,
          "description": siteDescription,
          "sameAs": buildSameAs(tenant)
        })}
      </script>
      
      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": brandName,
          "url": baseUrl,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${baseUrl}/shop?search={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

function deriveTwitterHandle(twitterUrl?: string): string | undefined {
  if (!twitterUrl) return undefined;
  try {
    const url = new URL(twitterUrl);
    const handle = url.pathname.replace('/', '').trim();
    return handle ? `@${handle}` : undefined;
  } catch {
    return undefined;
  }
}

function buildSameAs(tenant?: { socialMedia?: Record<string, string | undefined> }): string[] {
  if (!tenant?.socialMedia) return [];
  return Object.values(tenant.socialMedia).filter(Boolean) as string[];
}

export default SEOHead; 