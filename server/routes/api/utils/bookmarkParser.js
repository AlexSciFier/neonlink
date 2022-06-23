const { parse } = require("node-html-parser");
const { parseHtml } = require("./parsePage");

/**
 *
 * @param {Buffer} data
 */
function parseBookmarkFile(data) {
  let document = parse(data.toString());
  let urlArrayRaw = document.querySelectorAll("a");

  let urlArray = urlArrayRaw.map(async (node) => ({
    href: node.getAttribute("href"),
    date: new Date(Number.parseInt(node.getAttribute("add_date")) * 1000),
    name: node.textContent,
    icon: node.getAttribute("icon"),
  }));

  return urlArray;
}

module.exports = { parseBookmarkFile };
