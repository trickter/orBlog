import type { TableOfContentsItem } from '@/lib/markdown-headings';

interface PostTableOfContentsProps {
  items: TableOfContentsItem[];
  className?: string;
  listClassName?: string;
}

export function PostTableOfContents({
  items,
  className = '',
  listClassName = '',
}: PostTableOfContentsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="文章目录" className={className}>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        目录
      </h3>
      <ol
        className={`min-h-0 space-y-1.5 overflow-y-auto pr-2 text-xs leading-5 ${listClassName}`}
      >
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              paddingLeft: `${Math.max(item.level - 1, 0) * 8}px`,
            }}
          >
            <a
              href={`#${item.id}`}
              className="block break-words text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              title={item.text}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
