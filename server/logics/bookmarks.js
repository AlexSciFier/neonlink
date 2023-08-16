import axios from "axios";
import { imgUrlToBase64 } from "../helpers/images.js";
import { parseHtml } from "../helpers/parsers.js";
import { appContext } from "../contexts/appContext.js";

export async function batchUpdateLinks() {
  let bookmarks = appContext.stores.bookmarks.getAll();

  bookmarks.forEach(async (bookmark) => {
    let response;
    try {
      response = await axios.get(bookmark.url);
    } catch (err) {
      //   console.error(err.message);
      return;
    }
    if (response.status !== 200) return;
    let html = await response.data;
    let urlInfo = await parseHtml(html, bookmark.url);
    let icon = await imgUrlToBase64(urlInfo.icon);
    appContext.stores.bookmarks.updateItem(
      bookmark.id,
      bookmark.url,
      urlInfo.title || bookmark.title,
      urlInfo.desc || bookmark.desc,
      icon,
      bookmark.categoryId,
      bookmark.tags
    );
  });
  return true;
}
