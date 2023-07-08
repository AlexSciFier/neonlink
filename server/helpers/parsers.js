import { parse } from "node-html-parser";

export function parseBookmarkFile(data) {
  let document = parse(data.toString());
  let urlArrayRaw = document.querySelectorAll("a");

  let urlArray = urlArrayRaw.map((node) => ({
    href: node.getAttribute("href"),
    date: new Date(
      Number.parseInt(node.getAttribute("add_date")) * 1000 || Date.now()
    ),
    name: node.textContent,
    icon: node.getAttribute("icon"),
  }));

  return urlArray;
}

export function parseHtml(html, baseurl) {
  let doc = parse(html);
  let icon = parseIcon(doc, baseurl);
  let { title, desc } = parseTitle(doc);
  return { icon, title, desc };
}

function parseIcon(doc, baseUrl) {
  let icon =
    doc.querySelector('link[rel="icon"]') ||
    doc.querySelector('link[rel="shortcut icon"]');
  if (icon) {
    let path = icon.attributes["href"];
    return new URL(path, baseUrl).toString();
  }
  return new URL("/favicon.ico", baseUrl).toString();
}

function parseTitle(doc) {
  let title = doc.querySelector("title")?.textContent ?? "";
  let desc =
    doc.querySelector("meta[name=description]")?.attributes["content"] ?? "";
  return { title, desc };
}
