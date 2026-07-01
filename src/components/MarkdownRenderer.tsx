import ReactMarkdown from 'react-markdown';
import { ImageZoom } from '@/components/ImageZoom';
import { createMarkdownRenderConfig } from '@/lib/markdown-rendering';

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
  const renderConfig = createMarkdownRenderConfig({ preserveLineBreaks });

  return (
    <ImageZoom>
      <div
        className={`prose prose-slate max-w-none dark:prose-invert ${className}`}
      >
        <ReactMarkdown {...renderConfig}>{content}</ReactMarkdown>
      </div>
    </ImageZoom>
  );
}
