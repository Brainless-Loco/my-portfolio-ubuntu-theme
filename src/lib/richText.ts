const allowedTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3',
  'HR', 'I', 'IMG', 'LI', 'OL', 'P', 'PRE', 'S', 'SPAN', 'STRONG', 'U', 'UL',
]);
const imageDataUrlPattern = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z\d+/]+={0,2}$/i;
const maxImageDataUrlLength = 450_000;

export function sanitizeRichText(value: string): string {
  if (typeof DOMParser === 'undefined') return '';

  const document = new DOMParser().parseFromString(value, 'text/html');
  const cleanNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeAttribute(node.textContent ?? '');
    }

    if (!(node instanceof Element)) return '';
    const children = Array.from(node.childNodes).map(cleanNode).join('');
    if (node.tagName === 'IFRAME') {
      const src = toYouTubeEmbedUrl(node.getAttribute('src') ?? '');
      if (!src) return '';
      return `<iframe src="${escapeAttribute(src)}" title="YouTube video" class="rich-text-youtube" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }
    if (!allowedTags.has(node.tagName)) return children;

    const element = node as HTMLElement;
    if (node.tagName === 'IMG') {
      const src = safeImageSource(node.getAttribute('src') ?? '');
      if (!src) return '';
      const alt = escapeAttribute(node.getAttribute('alt') ?? '');
      const widthValue = Number.parseInt(node.getAttribute('width') ?? element.style.width, 10);
      const width = Number.isFinite(widthValue) && widthValue >= 40 && widthValue <= 2000 ? widthValue : null;
      const align = safeImageAlignment(node.getAttribute('data-align') ?? element.style.textAlign);
      const alignmentStyle = align === 'center'
        ? 'margin-left:auto;margin-right:auto'
        : align === 'left' ? 'margin-right:auto' : 'margin-left:auto';
      return `<img src="${escapeAttribute(src)}" alt="${alt}"${width ? ` width="${width}"` : ''} data-align="${align}" style="display:block;max-width:100%;height:auto;${alignmentStyle}" />`;
    }

    if (node.tagName === 'A') {
      const href = safeUrl(node.getAttribute('href') ?? '', true);
      if (!href) return children;
      return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }

    const style: string[] = [];
    if (['DIV', 'H1', 'H2', 'H3', 'P'].includes(node.tagName)) {
      const align = safeAlignment(element.style.textAlign);
      if (align !== 'left') style.push(`text-align:${align}`);
    }
    if (node.tagName === 'SPAN') {
      const color = safeColor(element.style.color);
      const fontSize = safeFontSize(element.style.fontSize);
      if (color) style.push(`color:${color}`);
      if (fontSize) style.push(`font-size:${fontSize}`);
    }
    const attributes = style.length ? ` style="${escapeAttribute(style.join(';'))}"` : '';
    const tagName = node.tagName.toLowerCase();
    return node.tagName === 'BR' || node.tagName === 'HR'
      ? `<${tagName} />`
      : `<${tagName}${attributes}>${children}</${tagName}>`;
  };

  return Array.from(document.body.childNodes).map(cleanNode).join('');
}

export function toYouTubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId: string | null = null;
    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] ?? null;
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else {
        videoId = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;
      }
    }

    if (!videoId || !/^[\w-]{11}$/.test(videoId)) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function safeImageSource(value: string): string | null {
  const source = value.trim();
  if (source.length > maxImageDataUrlLength) return null;
  if (imageDataUrlPattern.test(source)) return source;
  return safeUrl(source, false);
}

function safeAlignment(value: string): 'left' | 'center' | 'right' | 'justify' {
  return value === 'center' || value === 'right' || value === 'justify' ? value : 'left';
}

function safeImageAlignment(value: string): 'left' | 'center' | 'right' {
  return value === 'center' || value === 'right' ? value : 'left';
}

function safeColor(value: string): string | null {
  const color = value.trim();
  return /^#[\da-f]{3,8}$/i.test(color) || /^rgba?\([\d.%\s,]+\)$/i.test(color) ? color : null;
}

function safeFontSize(value: string): string | null {
  const match = /^(\d{1,2})px$/.exec(value.trim());
  if (!match) return null;
  const size = Number(match[1]);
  return size >= 8 && size <= 96 ? `${size}px` : null;
}

function safeUrl(value: string, allowMailto: boolean): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:' || (allowMailto && url.protocol === 'mailto:')) {
      return url.href;
    }
  } catch {
    return null;
  }
  return null;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
