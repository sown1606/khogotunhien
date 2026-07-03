"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const DEFAULT_IMAGE_FALLBACK = "/brand/icon.svg";

type SafeImageProps = Omit<ImageProps, "src"> & {
  alt: string;
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_IMAGE_FALLBACK,
  onError,
  ...props
}: SafeImageProps) {
  const effectiveSrc = src || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const renderedSrc = failedSrc === effectiveSrc ? fallbackSrc : effectiveSrc;

  return (
    <Image
      {...props}
      src={renderedSrc}
      alt={alt}
      onError={(event) => {
        if (effectiveSrc !== fallbackSrc) {
          setFailedSrc(effectiveSrc);
        }
        onError?.(event);
      }}
    />
  );
}
