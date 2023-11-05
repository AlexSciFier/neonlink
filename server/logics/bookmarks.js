import axios from "axios";
import { imgUrlToBase64 } from "../helpers/images.js";
import { parseHtml } from "../helpers/parsers.js";
import { appContext } from "../contexts/appContext.js";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows; Windows NT 10.4; Win64; x64) AppleWebKit/535.50 (KHTML, like Gecko) Chrome/48.0.3463.124 Safari/536";

export async function requestHeadFromUrl(url) {
  let res;
  const controller = new AbortController();

  try {
    res = await axios.get(url, {
      responseType: "stream",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml",
        Dnt: "1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": DEFAULT_USER_AGENT,
      },
    });
  } catch (error) {
    console.error(url, error.message);
    res = error.response;
  }

  let contentType = res.headers["content-type"];
  let matches = contentType.match(/charset=\s*"?(.[^\"]+)"?$/i);
  let encoding = matches?.[1] || "utf-8";

  let stream = res.data;

  stream.setEncoding("hex");

  let htmlArray = [];

  stream.on("data", (chunk) => {
    let chunkHTML = new TextDecoder(encoding.toLowerCase()).decode(
      Buffer.from(chunk, "hex")
    );
    const closingHeadTag = "</head>";
    const closingHeadTagIndex =
      chunkHTML.indexOf(closingHeadTag) + closingHeadTag.length;

    if (chunkHTML.includes(closingHeadTag)) {
      chunkHTML = chunkHTML.substring(0, closingHeadTagIndex);
      htmlArray.push(chunkHTML);
      controller.abort();
      return;
    }
    htmlArray.push(chunkHTML);
  });

  return new Promise((resolve, reject) => {
    stream.on("close", () => {
      const htmlOut = htmlArray.join("").trim();
      resolve(htmlOut);
    });
    stream.on("error", (e) => {
      if (e.code !== "ERR_CANCELED") reject(e);
    });
  });
}

export async function batchUpdateLinks() {
  let bookmarks = appContext.stores.bookmarks.getAll();

  console.log("Starting batch update all links");

  bookmarks.forEach(async (bookmark) => {
    let headHtml = requestHeadFromUrl(bookmark.url);
    let urlInfo = await parseHtml(headHtml, bookmark.url);
    let icon = await imgUrlToBase64(urlInfo.icon);
    let updated = appContext.stores.bookmarks.updateItem(
      bookmark.id,
      bookmark.url,
      urlInfo.title || bookmark.title,
      urlInfo.desc || bookmark.desc,
      icon,
      bookmark.categoryId,
      bookmark.tags
    );
    updated
      ? console.log(`${bookmark.url} updated!`)
      : console.error(`${bookmark.url} not updated!`);
  });
  return true;
}
