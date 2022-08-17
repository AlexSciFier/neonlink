const axios = require("axios").default;

const db = require("../../../db/connect");
const { imgUrlToBase64 } = require("../../../utils/imgUrlToBase64");
const { parseHtml } = require("./parsePage");

function batchUpdateLinks() {
  let bookmarks = db.getAllBookmarks(0, 999999);

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
    db.updateBookmarkById(
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
module.exports = { batchUpdateLinks };
