import React from "react";
import { fixBgUrl } from "../helpers/url";

export default function Image({ src, alt, width, height, ...props }) {
  if (src.startsWith("/")) {
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
    <img
      src={fixBgUrl(src)}
      alt={alt}
      width={width}
      height={height}
      {...props}
    ></img>
  );
}
