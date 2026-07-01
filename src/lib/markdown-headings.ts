import { marked } from 'marked';

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface MarkedTokenWithText {
  text?: string;
  tokens?: unknown[];
}

function plainTextFromTokens(tokens: unknown[] = []): string {
  return tokens
    .map((token) => {
      if (!token || typeof token !== 'object') {
        return '';
      }

      const markedToken = token as MarkedTokenWithText;
      if (markedToken.tokens) {
        return plainTextFromTokens(markedToken.tokens);
      }

      return markedToken.text ?? '';
    })
    .join('');
}

export function getHeadingText(token: MarkedTokenWithText) {
  return plainTextFromTokens(token.tokens).trim() || (token.text ?? '').trim();
}

function slugifyHeadingText(text: string) {
  const slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'section';
}

export function createHeadingIdGenerator() {
  const seenIds = new Map<string, number>();

  return (text: string) => {
    const baseId = slugifyHeadingText(text);
    const count = seenIds.get(baseId) ?? 0;
    seenIds.set(baseId, count + 1);

    return count === 0 ? baseId : `${baseId}-${count + 1}`;
  };
}

export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const createId = createHeadingIdGenerator();

  return marked
    .lexer(content)
    .filter((token) => token.type === 'heading')
    .map((token) => {
      const heading = token as MarkedTokenWithText & { depth: number };
      const text = getHeadingText(heading);

      return {
        id: createId(text),
        text,
        level: heading.depth,
      };
    })
    .filter((item) => item.text.length > 0);
}
