import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { defaultUrlTransform } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  preserveLineBreaks?: boolean;
}

export function MarkdownRenderer({
  content,
  className = '',
  preserveLineBreaks = false,
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

  const paragraphClass = preserveLineBreaks ? 'whitespace-pre-line' : '';
  const listItemClass = preserveLineBreaks ? 'whitespace-pre-line' : '';

  return (
    <div
      className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        urlTransform={urlTransform}
        components={{
          p: ({ children }) => <p className={paragraphClass}>{children}</p>,
          li: ({ children }) => <li className={listItemClass}>{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
