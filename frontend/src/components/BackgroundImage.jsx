import React from "react";
import { fixBgUrl } from "../helpers/url";

export default function BackgroundImage({
  children,
  src,
  className,
  width,
  height,
}) {
  if (src && src.startsWith("/")) {
    let filename = src.split("/").pop();
    src = `/api/image/${filename}`;
    if (width || height) {
      let params = new URLSearchParams();
      params.append("w", width);
      params.append("h", height);
      src += "?" + params.toString();
    }
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: src && `url(${fixBgUrl(src)})`,
      }}
    >
      {children}
    </div>
  );
}
