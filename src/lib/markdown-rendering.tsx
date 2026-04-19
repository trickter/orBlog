import type { Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { sanitizeMarkdownUrl } from '@/lib/markdown-url';

interface MarkdownRenderConfigOptions {
  preserveLineBreaks?: boolean;
}

export function createMarkdownRenderConfig(
  options: MarkdownRenderConfigOptions = {}
) {
  const { preserveLineBreaks = false } = options;

  const urlTransform = (url: string, key: string) => {
    return sanitizeMarkdownUrl(url, key === 'src' ? 'src' : 'href');
  };

  const paragraphClass = preserveLineBreaks ? 'whitespace-pre-line' : '';
  const listItemClass = preserveLineBreaks ? 'whitespace-pre-line' : '';

  const components: Components = {
    p: ({ children }) => <p className={paragraphClass}>{children}</p>,
    li: ({ children }) => <li className={listItemClass}>{children}</li>,
  };

  return {
    components,
    rehypePlugins: [rehypeHighlight],
    remarkPlugins: [remarkGfm],
    urlTransform,
  };
}
