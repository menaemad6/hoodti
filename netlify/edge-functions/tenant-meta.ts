// Netlify Edge Function to inject tenant-specific meta for crawlers and link previews
// This ensures OG/Twitter tags are correct when links are shared (bots generally don't run client JS)

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Map hostname to tenant id
  const domainToTenant: Record<string, string> = {
    'hoodti.store': 'hoodti',
    'diamond-covers.netlify.app': 'diamond',
    'ecommerce-v15.netlify.app': 'streetwear',
    'collab.com': 'collab',
    'localhost': 'hoodti',
    '127.0.0.1': 'hoodti',
  };

  // Allow tenant override via query param
  const tenantId = domainToTenant[hostname] || url.searchParams.get('tenant') || 'hoodti';

  const tenantMeta: Record<string, {
    name: string;
    domain: string;
    description: string;
    image: string;
    twitter: string;
  }> = {
    hoodti: {
      name: 'Hoodti',
      domain: 'hoodti.store',
      description: 'Elevate your street game with Hoodti – exclusive streetwear drops, bold urban fashion, and limited collections.',
      image: '/hoodti-logo.jpg',
      twitter: 'https://twitter.com/hoodti'
    },
    diamond: {
      name: 'Diamond',
      domain: 'diamond-covers.netlify.app',
      description: 'Discover exclusive collaborative phone case collections, limited-edition designs, and creative partnerships with top brands and artists.',
      image: '/diamond-logo.jpg',
      twitter: 'https://twitter.com/diamond'
    },
    streetwear: {
      name: 'StreetWear',
      domain: 'ecommerce-v15.netlify.app',
      description: 'Shop authentic streetwear and bold urban fashion. Discover limited drops and everyday essentials.',
      image: '/streetwear-logo.jpg',
      twitter: 'https://twitter.com/streetwear'
    },
    collab: {
      name: 'Collab Collection',
      domain: 'collab.com',
      description: 'Explore collaborative fashion collections, limited releases, and creative capsules.',
      image: '/collab-collection.jpg',
      twitter: 'https://twitter.com/collab'
    }
  };

  const meta = tenantMeta[tenantId] || tenantMeta.hoodti;

  // Fetch the HTML from the origin
  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  const baseUrl = `${url.protocol}//${url.host}`;
  const absoluteImage = meta.image.startsWith('http') ? meta.image : `${baseUrl}${meta.image}`;
  const title = `${meta.name} | Streetwear for Urban Culture`;
  const description = meta.description;
  const twitterHandle = (() => {
    try { const u = new URL(meta.twitter); const h = u.pathname.replace('/', '').trim(); return h ? `@${h}` : ''; } catch { return ''; }
  })();

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Helper to upsert meta tags
  const upsert = (selector: string, tagHtml: string) => {
    const nameMatch = selector.match(/name="([^"]+)"/);
    const propMatch = selector.match(/property="([^"]+)"/);
    const name = nameMatch ? nameMatch[1] : undefined;
    const prop = propMatch ? propMatch[1] : undefined;
    const re = name
      ? new RegExp(`<meta[^>]*name="${escapeRegExp(name)}"[^>]*>`, 'i')
      : new RegExp(`<meta[^>]*property="${escapeRegExp(prop || '')}"[^>]*>`, 'i');
    if (re.test(html)) {
      html = html.replace(re, tagHtml);
    } else {
      html = html.replace(/<head>/i, `<head>\n    ${tagHtml}`);
    }
  };

  upsert('meta name="description"', `<meta name="description" content="${escapeHtml(description)}" />`);
  upsert('meta name="author"', `<meta name="author" content="${escapeHtml(meta.name)}" />`);

  upsert('meta property="og:title"', `<meta property="og:title" content="${escapeHtml(title)}" />`);
  upsert('meta property="og:description"', `<meta property="og:description" content="${escapeHtml(description)}" />`);
  upsert('meta property="og:type"', `<meta property="og:type" content="website" />`);
  upsert('meta property="og:url"', `<meta property="og:url" content="${escapeHtml(url.toString())}" />`);
  upsert('meta property="og:image"', `<meta property="og:image" content="${escapeHtml(absoluteImage)}" />`);
  upsert('meta property="og:site_name"', `<meta property="og:site_name" content="${escapeHtml(meta.name)}" />`);

  upsert('meta name="twitter:card"', `<meta name="twitter:card" content="summary_large_image" />`);
  if (twitterHandle) upsert('meta name="twitter:site"', `<meta name="twitter:site" content="${escapeHtml(twitterHandle)}" />`);
  upsert('meta name="twitter:title"', `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  upsert('meta name="twitter:description"', `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  upsert('meta name="twitter:image"', `<meta name="twitter:image" content="${escapeHtml(absoluteImage)}" />`);

  return new Response(html, {
    headers: {
      'content-type': contentType,
    }
  });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const config = { path: '/*' };


