import DOMPurify from 'isomorphic-dompurify';

/**
 * Whitelist of allowed HTML tags for article bodies.
 * Strictly permits formatting, typography, structure, links, and media,
 * while preventing executable scripts, embeds, forms, and objects.
 */
export const ALLOWED_ARTICLE_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup', 'mark', 'small',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'a',
  'img',
  'figure', 'figcaption',
];

/**
 * Whitelist of safe HTML attributes for article elements.
 * Explicitly excludes inline event handlers (onerror, onload, onclick, etc.).
 */
export const ALLOWED_ARTICLE_ATTRS = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading',
  'class', 'id', 'dir', 'lang',
  'colspan', 'rowspan',
];

/**
 * Sanitizes article HTML content before rendering with dangerouslySetInnerHTML.
 * Ensures stored or retrieved HTML cannot execute JavaScript or trigger XSS.
 */
export function sanitizeArticleHtml(dirtyHtml?: string | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ALLOWED_ARTICLE_TAGS,
    ALLOWED_ATTR: ALLOWED_ARTICLE_ATTRS,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
  });
}

const SAFE_STYLE_PROPS = new Set([
  'text-align',
  'direction',
  'color',
  'background-color',
  'font-size',
  'max-width',
  'height',
  'border-radius',
  'margin',
]);

function filterSafeInlineStyle(styleValue: string): string {
  return styleValue
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .map((decl) => {
      const colonIdx = decl.indexOf(':');
      if (colonIdx <= 0) return '';
      const prop = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).trim();
      if (!SAFE_STYLE_PROPS.has(prop)) return '';
      if (/url\s*\(|expression\s*\(|javascript:|vbscript:/i.test(val)) return '';
      return `${prop}: ${val}`;
    })
    .filter(Boolean)
    .join('; ');
}

/**
 * Sanitizes rich-text service HTML before rendering with dangerouslySetInnerHTML.
 * Preserves safe typography, lists, links, alignment, and media while blocking XSS.
 */
export function sanitizeServiceHtml(dirtyHtml?: string | null): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') {
    return '';
  }

  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ALLOWED_ARTICLE_TAGS,
    ALLOWED_ATTR: [...ALLOWED_ARTICLE_ATTRS, 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
  });

  return clean.replace(/\sstyle="([^"]*)"/gi, (_match, rawStyle: string) => {
    const safeStyle = filterSafeInlineStyle(rawStyle);
    return safeStyle ? ` style="${safeStyle}"` : '';
  });
}

/**
 * Safely serializes data into JSON for embedding inside <script type="application/ld+json">.
 * Replaces angle brackets with unicode escapes to prevent HTML parser breakout (</script> injection).
 */
export function safeJsonLdStringify(data: unknown): string {
  if (data === null || data === undefined) {
    return '';
  }

  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
