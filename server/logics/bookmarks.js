import axios from "axios";
import { imgUrlToBase64 } from "../helpers/images.js";
import { stores } from "../db/stores.js"

export async function batchUpdateLinks() {
  let bookmarks = stores.bookmarks.getAll();

  bookmarks.bookmarks.forEach(async (bookmark) => {
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
    stores.bookmarks.updateBookmarkById(
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