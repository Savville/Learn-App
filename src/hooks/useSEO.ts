import { useEffect } from 'react';

const SITE_NAME = 'Opportunities Kenya';
const BASE_URL = 'https://opportunitieskenya.live';
const DEFAULT_IMAGE = `${BASE_URL}/Opportunities%20Kenya%20Logo%202.png`;
const DEFAULT_DESCRIPTION =
  'Discover scholarships, fellowships, internships, grants and more — curated for African students and young professionals.';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO({ title, description, image, url, type = 'website' }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

    // Page title
    document.title = fullTitle;

    // Standard meta
    setMeta('description', desc);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);

    // Open Graph (WhatsApp, Facebook, LinkedIn)
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', desc, 'property');
    setMeta('og:image', img, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:type', type, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);
  }, [title, description, image, url, type]);
}
