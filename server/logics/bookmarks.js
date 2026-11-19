import axios from "axios";
import { imgUrlToBase64 } from "../helpers/images.js";
import { parseHtml } from "../helpers/parsers.js";
import { appContext } from "../contexts/appContext.js";
import { outboundOptions } from "../helpers/outbound.js";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows; Windows NT 10.4; Win64; x64) AppleWebKit/535.50 (KHTML, like Gecko) Chrome/48.0.3463.124 Safari/536";

export async function requestHeadFromUrl(url) {
  let res;
  const controller = new AbortController();

  let endpointUrl = new URL(url);
  if (endpointUrl.protocol !== "http:" && endpointUrl.protocol !== "https:") {
    return new Promise((resolve, reject) => {
      reject(new Error(`Unsupported protocol ${endpointUrl.protocol}`));
    });
  }

  try {
    res = await axios.get(url, {
      ...outboundOptions(url),
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
    console.error(`Get Head tag from ${url}`, error.message);
    res = error.response;
  }

  let contentType = res?.headers["content-type"];
  let matches = contentType?.match(/charset=\s*"?(.[^\"]+)"?$/i);
  let encoding = matches?.[1] || "utf-8";

  if (!res?.data) throw new Error("Unable to fetch URL");
  let stream = res.data;

  stream.setEncoding("hex");

  let htmlArray = [];
  let received = 0;

  stream.on("data", (chunk) => {
    received += chunk.length / 2;
    if (received > 5 * 1024 * 1024) {
      stream.destroy(new Error("Response too large"));
      return;
    }
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

export async function batchUpdateLinks(scope) {
  let bookmarks = appContext.stores.bookmarks.getAll(scope.userId);

  console.log("Starting batch update all links");

  for (const bookmark of bookmarks) {
    if (!appContext.stores.bookmarks.isModifiable(bookmark.id, scope)) continue;
    try {
      let headHtml = await requestHeadFromUrl(bookmark.url);
      let urlInfo = parseHtml(headHtml, bookmark.url);
      let icon = await imgUrlToBase64(urlInfo.icon);
      let updated = appContext.stores.bookmarks.updateItem(
        bookmark.id,
        bookmark.url,
        urlInfo.title || bookmark.title,
        urlInfo.desc || bookmark.desc,
        icon,
        bookmark.categoryId,
        bookmark.tags,
        scope
      );
      updated
        ? console.log(`${bookmark.url} updated!`)
        : console.error(`${bookmark.url} not updated!`);
    } catch (err) {
      console.error(`${bookmark.url} - ${err.message}`);
    }
  }
  return true;
}
