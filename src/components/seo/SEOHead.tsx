import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  const fullTitle = title.includes('Hoodti') ? title : `${title} | Hoodti`;
  const fullUrl = canonical || url;
  const fullImage = image.startsWith('http') ? image : `https://hoodti.com${image}`;
  
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
      <meta property="og:site_name" content="Hoodti" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Hoodti" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@Hoodti" />
      
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
            "name": title.replace(' | Hoodti', ''),
            "description": description,
            "image": fullImage,
            "url": fullUrl,
            "brand": {
              "@type": "Brand",
              "name": "Hoodti"
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
          "name": "Hoodti",
          "url": "https://hoodti.com",
          "logo": "https://hoodti.com/hoodti-logo.jpg",
          "description": "Streetwear for Urban Culture",
          "sameAs": [
            "https://twitter.com/Hoodti",
            "https://instagram.com/hoodti",
            "https://facebook.com/hoodti"
          ]
        })}
      </script>
      
      {/* Website Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Hoodti",
          "url": "https://hoodti.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://hoodti.com/shop?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead; 