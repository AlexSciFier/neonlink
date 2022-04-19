"use strict";

const { test } = require("tap");
const { build } = require("../helper");

test("get all bookmarks", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/bookmarks/",
  });
  t.equal(res.statusCode, 200);
  t.type(res.json(), Array);
});

test("get bookmarks by id", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/bookmarks/3",
  });
  t.equal(res.statusCode, 200);
  t.same(res.json(), {
    id: 3,
    url: "https://developer.mozilla.org/ru/docs/Web/API/URLSearchParams",
    title: "URLSearchParams - Интерфейсы веб API - MDN Web Docs",
    desc: "23 мар. 2022 г. — ",
  });
});

test("bookmarks find", async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: "/bookmarks/?q=To access the value",
  });
  t.equal(res.statusCode, 200);
  t.same(res.json(), [
    {
      id: 13,
      url: "https://flaviocopes.com/urlsearchparams/",
      title: "How to get query string values in JavaScript with ...",
      desc: "js. To access the value of the query inside the br…alled URLSearchParam, supported by all modern ...",
    },
  ]);
});

// inject callback style:
//
// test('example is loaded', (t) => {
//   t.plan(2)
//   const app = await build(t)
//
//   app.inject({
//     url: '/example'
//   }, (err, res) => {
//     t.error(err)
//     t.equal(res.payload, 'this is an example')
//   })
// })
