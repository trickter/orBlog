import { marked } from 'marked';
import { sanitizeMarkdownUrl } from '@/lib/markdown-url';

interface CompileMarkdownToHtmlOptions {
  preserveLineBreaks?: boolean;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderCodeBlock(code: string, language?: string) {
  const languageClass = language ? ` language-${escapeHtml(language)}` : '';

  return `<pre><code class="hljs${languageClass}">${escapeHtml(code)}</code></pre>`;
}

export function compileMarkdownToHtml(
  content: string,
  options: CompileMarkdownToHtmlOptions = {}
) {
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => renderCodeBlock(text, lang);
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.link = ({ href = '', text, title }) => {
    const safeHref = sanitizeMarkdownUrl(href, 'href');
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

    if (!safeHref) {
      return text;
    }

    return `<a href="${escapeHtml(safeHref)}"${titleAttr}>${text}</a>`;
  };
  renderer.image = ({ href = '', text, title }) => {
    const safeSrc = sanitizeMarkdownUrl(href, 'src');
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

    if (!safeSrc) {
      return escapeHtml(text);
    }

    return `<img src="${escapeHtml(safeSrc)}" alt="${escapeHtml(text)}"${titleAttr}>`;
  };

  return marked.parse(content, {
    async: false,
    breaks: options.preserveLineBreaks ?? false,
    gfm: true,
    renderer,
  }) as string;
}
