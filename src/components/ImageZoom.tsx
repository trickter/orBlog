'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ZoomedImage {
  src: string;
  alt: string;
}

interface ImageZoomProps {
  children: React.ReactNode;
}

function imageFromEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest('img');
}

export function ImageZoom({ children }: ImageZoomProps) {
  const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null);

  useEffect(() => {
    if (!zoomedImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoomedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage]);

  const openZoom = (event: React.MouseEvent<HTMLDivElement>) => {
    const image = imageFromEventTarget(event.target);

    if (!image) {
      return;
    }

    const src = image.currentSrc || image.getAttribute('src') || '';

    if (!src) {
      return;
    }

    event.preventDefault();
    setZoomedImage({
      src,
      alt: image.getAttribute('alt') || '放大的博客图片',
    });
  };

  return (
    <>
      <div className="[&_img]:cursor-zoom-in" onClick={openZoom}>
        {children}
      </div>

      {zoomedImage && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          onClick={() => setZoomedImage(null)}
        >
          <button
            aria-label="关闭图片预览"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-zinc-900 shadow-lg transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
            type="button"
            onClick={() => setZoomedImage(null)}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
          {/* The preview must render the exact Markdown image source, including unconfigured external URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={zoomedImage.alt}
            className="max-h-[92vh] max-w-[96vw] cursor-zoom-out rounded-md object-contain shadow-2xl"
            src={zoomedImage.src}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
