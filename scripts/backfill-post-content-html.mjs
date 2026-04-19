import { PrismaClient } from '@prisma/client';
import { marked } from 'marked';

const prisma = new PrismaClient();

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function hasExplicitProtocol(url) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

function sanitizeMarkdownUrl(url, key) {
  if (
    key === 'src' &&
    (url.startsWith('data:image/') || url.startsWith('blob:'))
  ) {
    return url;
  }

  if (!hasExplicitProtocol(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'mailto:', 'irc:', 'ircs:', 'xmpp:'].includes(
      parsed.protocol
    )
      ? url
      : '';
  } catch {
    return '';
  }
}

function compileMarkdownToHtml(content) {
  const renderer = new marked.Renderer();
  renderer.code = ({ text, lang }) => {
    const languageClass = lang ? ` language-${escapeHtml(lang)}` : '';
    return `<pre><code class="hljs${languageClass}">${escapeHtml(text)}</code></pre>`;
  };
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
    gfm: true,
    renderer,
  });
}

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      OR: [{ contentHtml: null }, { contentHtml: '' }],
    },
    select: {
      id: true,
      title: true,
      content: true,
    },
  });

  for (const post of posts) {
    const contentHtml = compileMarkdownToHtml(post.content);

    await prisma.post.update({
      where: { id: post.id },
      data: { contentHtml },
    });

    console.log(`Backfilled contentHtml for post "${post.title}"`);
  }

  console.log(`Backfill complete. Updated ${posts.length} post(s).`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
