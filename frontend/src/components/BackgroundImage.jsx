import React, { useEffect, useState } from "react";
import { fixBgUrl } from "../helpers/url";
import { getOrCacheBgImage } from "../helpers/backgroundService";

export default function BackgroundImage({
  children,
  src,
  className,
  width,
  height,
}) {
  const [resolvedSrc, setResolvedSrc] = useState(null);

  useEffect(() => {
    if (!src) {
      setResolvedSrc(null);
      return;
    }

    if (!src.startsWith("/")) {
      setResolvedSrc(fixBgUrl(src));
      return;
    }

    let filename = src.split("/").pop();
    let apiUrl = `/api/image/${filename}`;
    if (width || height) {
      let params = new URLSearchParams();
      if (width) params.append("w", width);
      if (height) params.append("h", height);
      apiUrl += "?" + params.toString();
    }
    apiUrl = fixBgUrl(apiUrl);

    let cancelled = false;
    let createdBlobUrl = null;

    getOrCacheBgImage(apiUrl).then((url) => {
      if (cancelled) {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        return;
      }
      if (url.startsWith("blob:")) createdBlobUrl = url;
      setResolvedSrc(url);
    });

    return () => {
      cancelled = true;
      if (createdBlobUrl) URL.revokeObjectURL(createdBlobUrl);
    };
  }, [src, width, height]);

  return (
    <div
      className={className}
      style={{
        backgroundImage: resolvedSrc ? `url(${resolvedSrc})` : undefined,
      }}
    >
      {children}
    </div>
  );
}
