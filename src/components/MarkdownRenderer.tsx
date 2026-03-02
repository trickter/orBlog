import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { defaultUrlTransform } from 'react-markdown';
import { normalizeUploadsPath } from '@/lib/normalize-uploads-path';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  const urlTransform = (url: string, key: string) => {
    const normalizedUrl = key === 'src' ? normalizeUploadsPath(url) : url;

    if (
      key === 'src' &&
      (normalizedUrl.startsWith('data:image/') ||
        normalizedUrl.startsWith('blob:'))
    ) {
      return normalizedUrl;
    }
    return defaultUrlTransform(normalizedUrl);
  };

  return (
    <div
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        urlTransform={urlTransform}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
