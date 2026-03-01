import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { defaultUrlTransform } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  const urlTransform = (url: string, key: string) => {
    if (
      key === 'src' &&
      (url.startsWith('data:image/') || url.startsWith('blob:'))
    ) {
      return url;
    }
    return defaultUrlTransform(url);
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
