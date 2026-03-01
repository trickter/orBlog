"use client";

import { useMemo, useState } from "react";
import { createPost } from "@/lib/actions";
import { ZipUpload } from "@/components/ZipUpload";
import { ZipImage, ZipImportResult } from "@/lib/zip-import";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { imageLookupKeys, rewriteMarkdownImageLinks } from "@/lib/markdown-image-links";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface NewPostFormProps {
  categories: Category[];
  session: string | null;
}

export function NewPostForm({ categories, session }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(true);
  const [zipImages, setZipImages] = useState<ZipImage[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleExtract = (result: ZipImportResult) => {
    setTitle(result.title);
    setContent(result.content);
    setZipImages(result.images);
    setImageCount(result.images.length);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("categoryId", categoryId);
      formData.append("published", published ? "on" : "");
      formData.append("zipImages", JSON.stringify(zipImages));

      await createPost(formData as unknown as FormData, session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setIsSubmitting(false);
    }
  };

  const clearZipImport = () => {
    setZipImages([]);
    setImageCount(0);
  };

  const previewContent = useMemo(() => {
    if (!content || zipImages.length === 0) {
      return content;
    }

    const imageDataUrlByKey = new Map<string, string>();

    for (const image of zipImages) {
      const mimeType = image.mimeType || "image/png";
      const dataUrl = `data:${mimeType};base64,${image.data}`;

      for (const key of imageLookupKeys(image.name)) {
        if (!imageDataUrlByKey.has(key)) {
          imageDataUrlByKey.set(key, dataUrl);
        }
      }
    }

    return rewriteMarkdownImageLinks(content, (markdownUrl) => {
      for (const key of imageLookupKeys(markdownUrl)) {
        const candidate = imageDataUrlByKey.get(key);
        if (candidate) {
          return candidate;
        }
      }
      return null;
    });
  }, [content, zipImages]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        New Post
      </h1>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h2 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Import from ZIP (Optional)
        </h2>
        <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
          Upload a ZIP file containing your markdown post and images folder
        </p>
        <ZipUpload onExtract={handleExtract} />
        {imageCount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
            <span>
              {imageCount} image{imageCount !== 1 ? "s" : ""} ready to import
            </span>
            <button
              type="button"
              onClick={clearZipImport}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Category
          </label>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Content (Markdown)
          </label>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
            placeholder="Write your post in Markdown..."
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mr-2"
            />
            Published
          </label>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Preview
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                {title || "Untitled"}
              </h1>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <MarkdownRenderer content={previewContent || "*No content*"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
