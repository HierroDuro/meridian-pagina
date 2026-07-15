"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

/** How much the side zoom panel magnifies the source image. */
const ZOOM_FACTOR = 2.5;
/** Result panel width as a multiple of the source image box's width. */
const RESULT_WIDTH_RATIO = 1.35;
/** Lens outline size on the source image, in pixels. */
const LENS_SIZE = 96;

interface ZoomState {
  lensLeft: number;
  lensTop: number;
  bgPosX: number;
  bgPosY: number;
  bgW: number;
  bgH: number;
  resultH: number;
}

/**
 * Thumbnail rail + main image with a hover magnifier: moving the mouse over
 * the main image pans a zoomed view in an adjacent panel (classic
 * marketplace-style "lens" zoom).
 *
 * The image is displayed with `object-contain`, so for a non-square photo
 * part of the square source box is empty letterboxing — all the math below
 * is done in terms of the *rendered image content's* pixel box (not the
 * container), otherwise the lens/zoom would drift out of sync with the
 * cursor whenever a product photo isn't perfectly square.
 */
export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isZooming, setIsZooming] = React.useState(false);
  const [zoom, setZoom] = React.useState<ZoomState | null>(null);
  const [naturalSize, setNaturalSize] = React.useState<{ w: number; h: number } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const imgElRef = React.useRef<HTMLImageElement>(null);

  const activeImage = images[activeIndex] ?? images[0] ?? "";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const containerRect = container.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const naturalW = naturalSize?.w ?? containerRect.width;
    const naturalH = naturalSize?.h ?? containerRect.height;

    // Reproduce object-contain's fit math to find the actual rendered image
    // box within the (square) container, and its letterbox offset.
    const containerRatio = containerRect.width / containerRect.height;
    const imageRatio = naturalW / naturalH;
    let renderW: number;
    let renderH: number;
    if (imageRatio > containerRatio) {
      renderW = containerRect.width;
      renderH = containerRect.width / imageRatio;
    } else {
      renderH = containerRect.height;
      renderW = containerRect.height * imageRatio;
    }
    const offsetX = (containerRect.width - renderW) / 2;
    const offsetY = (containerRect.height - renderH) / 2;

    const localX = e.clientX - containerRect.left - offsetX;
    const localY = e.clientY - containerRect.top - offsetY;

    // Cursor is over the letterbox padding, not the actual photo — no zoom.
    if (localX < 0 || localX > renderW || localY < 0 || localY > renderH) {
      setIsZooming(false);
      return;
    }

    const pctX = localX / renderW;
    const pctY = localY / renderH;

    const resultW = wrapperRect.width * RESULT_WIDTH_RATIO;
    const resultH = wrapperRect.height;
    const bgW = renderW * ZOOM_FACTOR;
    const bgH = renderH * ZOOM_FACTOR;

    setIsZooming(true);
    setZoom({
      lensLeft: offsetX + localX - LENS_SIZE / 2,
      lensTop: offsetY + localY - LENS_SIZE / 2,
      bgPosX: -(pctX * bgW - resultW / 2),
      bgPosY: -(pctY * bgH - resultH / 2),
      bgW,
      bgH,
      resultH,
    });
  };

  return (
    <div className="flex gap-4">
      {images.length > 1 && (
        <div className="flex flex-col gap-2.5">
          {images.map((url, index) => (
            <button
              key={url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1} de ${alt}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors",
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      <div ref={wrapperRef} className="relative flex-1">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZooming(false)}
          className="relative aspect-square w-full cursor-crosshair overflow-hidden rounded-xl border border-border bg-white"
        >
          <Image
            ref={imgElRef}
            src={activeImage}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
          {isZooming && zoom && (
            <div
              aria-hidden
              className="pointer-events-none absolute rounded border-2 border-primary/70 bg-primary/10"
              style={{ left: zoom.lensLeft, top: zoom.lensTop, width: LENS_SIZE, height: LENS_SIZE }}
            />
          )}
        </div>

        {isZooming && zoom && activeImage && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-full top-0 z-30 ml-4 hidden w-[135%] overflow-hidden rounded-xl border border-border bg-muted shadow-xl lg:block"
            style={{
              height: zoom.resultH,
              backgroundImage: `url(${activeImage})`,
              backgroundSize: `${zoom.bgW}px ${zoom.bgH}px`,
              backgroundPosition: `${zoom.bgPosX}px ${zoom.bgPosY}px`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </div>
    </div>
  );
}
