import { useEffect } from 'react';

export interface DocumentMetaOptions {
  /** Page title; the brand name will be appended unless `appendBrand` is false. */
  title: string;
  description?: string;
  /** Absolute or path-relative canonical URL. Defaults to `window.location.href`. */
  canonical?: string;
  /** og:image / twitter:image absolute URL. */
  image?: string;
  /** og:type. Defaults to "website"; use "product" on PDPs. */
  type?: string;
  /** Append the brand name to <title>. Defaults to true. */
  appendBrand?: boolean;
  /** "noindex,nofollow" for pages that shouldn't be crawled (e.g. cart, admin). */
  robots?: string;
  /** Optional JSON-LD object(s). Will be JSON.stringified into a <script type="application/ld+json">. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BRAND = 'Vision Techno';
const META_FLAG = 'data-vt-meta';

/**
 * Sets <title>, common meta tags, canonical link, and an optional JSON-LD
 * payload on the current page. Tags managed by this hook are tagged with
 * `data-vt-meta` so they can be cleanly replaced on each navigation.
 */
export function useDocumentMeta(opts: DocumentMetaOptions): void {
  useEffect(() => {
    const previousTitle = document.title;

    const title = opts.appendBrand === false ? opts.title : `${opts.title} | ${BRAND}`;
    document.title = title;

    // Remove anything we managed last time so stale tags don't accumulate.
    document.head.querySelectorAll(`[${META_FLAG}]`).forEach((el) => el.remove());

    const setMeta = (selector: string, attrs: Record<string, string>) => {
      const el = document.createElement(selector);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute(META_FLAG, '1');
      document.head.appendChild(el);
    };

    if (opts.description) {
      setMeta('meta', { name: 'description', content: opts.description });
      setMeta('meta', { property: 'og:description', content: opts.description });
      setMeta('meta', { name: 'twitter:description', content: opts.description });
    }

    setMeta('meta', { property: 'og:title', content: title });
    setMeta('meta', { property: 'og:type', content: opts.type ?? 'website' });
    setMeta('meta', { property: 'og:site_name', content: BRAND });
    setMeta('meta', { name: 'twitter:title', content: title });
    setMeta('meta', { name: 'twitter:card', content: opts.image ? 'summary_large_image' : 'summary' });

    const canonical = opts.canonical ?? window.location.href;
    setMeta('link', { rel: 'canonical', href: canonical });
    setMeta('meta', { property: 'og:url', content: canonical });

    if (opts.image) {
      setMeta('meta', { property: 'og:image', content: opts.image });
      setMeta('meta', { name: 'twitter:image', content: opts.image });
    }

    if (opts.robots) {
      setMeta('meta', { name: 'robots', content: opts.robots });
    }

    if (opts.jsonLd) {
      const blocks = Array.isArray(opts.jsonLd) ? opts.jsonLd : [opts.jsonLd];
      blocks.forEach((block) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute(META_FLAG, '1');
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.title = previousTitle;
      document.head.querySelectorAll(`[${META_FLAG}]`).forEach((el) => el.remove());
    };
    // We intentionally rerun whenever any meta input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    opts.title,
    opts.description,
    opts.canonical,
    opts.image,
    opts.type,
    opts.appendBrand,
    opts.robots,
    JSON.stringify(opts.jsonLd ?? null),
  ]);
}
