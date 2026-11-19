import { test } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import sensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import Database from "better-sqlite3";
import migrate from "../db/sqlite/migrations/initial.js";
import BookmarksStore from "../db/sqlite/stores/bookmarks.js";
import CategoriesStore from "../db/sqlite/stores/categories.js";
import TagsStore from "../db/sqlite/stores/tags.js";
import { ownerCondition } from "../db/sqlite/stores/ownership.js";
import { assertPublicAddress, outboundOptions } from "../helpers/outbound.js";
import { appContext } from "../contexts/appContext.js";
import bookmarksRoutes from "../routes/api/bookmarks/index.js";
import categoriesRoutes from "../routes/api/categories/index.js";
import utilsRoutes from "../routes/api/utils/index.js";
import tagsRoutes from "../routes/api/tags/index.js";

test("ownership and Fastify routes enforce the user boundary", async (t) => {
  const db = new Database(":memory:");
  await migrate(db);
  const bookmarks = new BookmarksStore(db);
  const categories = new CategoriesStore(db);
  const tags = new TagsStore(db);
  const alice = { userId: 1, authenticated: true, isAdmin: false };
  const bob = { userId: 2, authenticated: true, isAdmin: false };
  const admin = { userId: 3, authenticated: true, isAdmin: true };
  const system = { userId: 0, authDisabled: true, isAdmin: true };
  let current = alice;
  let authenticationEnabled = true;
  appContext.request = { get: () => current };
  appContext.settings = { get: () => authenticationEnabled };
  appContext.stores = { bookmarks, categories, tags };
  appContext.hasAnyUser = appContext.hasAdminUser = true;
  const app = Fastify();
  await app.register(sensible);
  await app.register(bookmarksRoutes, { prefix: "/api/bookmarks" });
  await app.register(categoriesRoutes, { prefix: "/api/categories" });
  await app.register(tagsRoutes, { prefix: "/api/tags" });
  await app.register(utilsRoutes, { prefix: "/api/utils" });
  t.after(async () => {
    await app.close();
    db.close();
  });

  const shared = categories.addItem("Work", "red", 0);
  const own = categories.addItem("Private", "blue", 1);
  const foreign = categories.addItem("Secret", "green", 2);
  const aliceBookmark = bookmarks.addItem(
    "https://a.test",
    "a",
    "",
    "",
    own,
    [],
    alice
  );
  const bobBookmark = bookmarks.addItem(
    "https://b.test",
    "b",
    "",
    "",
    foreign,
    [],
    bob
  );
  const sharedBookmark = bookmarks.addItem(
    "https://s.test",
    "s",
    "",
    "",
    shared,
    [],
    system
  );
  const foreignTag = tags.addItem("secret-tag", 2);

  assert.throws(() => ownerCondition(), /scope/);
  assert.throws(() => ownerCondition({ userId: 0 }), /scope/);
  assert.equal(bookmarks.isModifiable(bobBookmark, alice), false);
  assert.equal(bookmarks.isModifiable(sharedBookmark, alice), false);
  assert.equal(bookmarks.isModifiable(sharedBookmark, admin), true);
  assert.equal(bookmarks.isModifiable(bobBookmark, admin), false);
  assert.equal(bookmarks.isModifiable(bobBookmark, system), true);

  let response = await app.inject({
    method: "PUT",
    url: `/api/bookmarks/${bobBookmark}`,
    payload: { url: "https://changed.test" },
  });
  assert.equal(response.statusCode, 404);
  response = await app.inject({
    method: "DELETE",
    url: `/api/categories/${foreign}`,
  });
  assert.equal(response.statusCode, 404);
  response = await app.inject({
    method: "PUT",
    url: `/api/bookmarks/${aliceBookmark}`,
    payload: { url: "https://a.test", categoryId: foreign },
  });
  assert.equal(response.statusCode, 404);
  assert.equal(bookmarks.getItemById(1, aliceBookmark).categoryId, own);
  response = await app.inject({
    method: "PUT",
    url: `/api/bookmarks/${aliceBookmark}`,
    payload: { url: "https://a.test", tags: ["secret-tag"] },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(
    db
      .prepare("SELECT count(*) AS n FROM bookmarksTags WHERE tagId = ?")
      .get(foreignTag).n,
    0
  );
  response = await app.inject({
    method: "PUT",
    url: "/api/tags/" + foreignTag,
    payload: { name: "changed" },
  });
  assert.equal(response.statusCode, 404);

  response = await app.inject({
    method: "POST",
    url: "/api/categories",
    payload: { name: "Work", color: "blue" },
  });
  assert.equal(response.statusCode, 201);
  const newId = response.json();
  response = await app.inject({
    method: "POST",
    url: "/api/categories",
    payload: { name: "Work", color: "green" },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json(), newId);
  assert.equal(
    db
      .prepare(
        "SELECT count(*) AS n FROM category WHERE name = 'Work' AND userId = 1"
      )
      .get().n,
    1
  );

  response = await app.inject({
    method: "PUT",
    url: "/api/categories/changePositions",
    payload: [
      { id: own, position: 20 },
      { id: foreign, position: 20 },
    ],
  });
  assert.equal(response.statusCode, 404);
  assert.notEqual(
    db
      .prepare("SELECT position FROM categoryPosition WHERE categoryId = ?")
      .get(own).position,
    20
  );
  response = await app.inject({
    method: "PUT",
    url: "/api/bookmarks/changePositions",
    payload: {
      categoryId: own,
      items: [
        { id: aliceBookmark, position: 10 },
        { id: bobBookmark, position: 10 },
      ],
    },
  });
  assert.equal(response.statusCode, 404);
  assert.equal(
    db.prepare("SELECT count(*) AS n FROM bookmarkPosition").get().n,
    0
  );
  response = await app.inject({
    method: "PUT",
    url: "/api/bookmarks/changePositions",
    payload: {},
  });
  assert.equal(response.statusCode, 400);
  response = await app.inject({
    method: "PUT",
    url: "/api/bookmarks/changePositions",
    payload: { categoryId: own, items: [{ id: aliceBookmark, position: 7 }] },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(
    db
      .prepare("SELECT position FROM bookmarkPosition WHERE bookmarkId = ?")
      .get(aliceBookmark).position,
    7
  );
  response = await app.inject({
    method: "PUT",
    url: "/api/categories/changePositions",
    payload: Array.from({ length: 501 }, () => ({ id: own, position: 0 })),
  });
  assert.equal(response.statusCode, 400);
  response = await app.inject({
    method: "DELETE",
    url: "/api/bookmarks/not-a-number",
  });
  assert.equal(response.statusCode, 400);

  current = admin;
  response = await app.inject({
    method: "PUT",
    url: `/api/categories/${shared}`,
    payload: { name: "Shared", color: "red" },
  });
  assert.equal(response.statusCode, 200);
  response = await app.inject({
    method: "PUT",
    url: `/api/categories/${foreign}`,
    payload: { name: "Changed", color: "red" },
  });
  assert.equal(response.statusCode, 404);
  current = alice;

  response = await app.inject({ method: "GET", url: "/api/bookmarks/export" });
  assert.match(response.body, /https:\/\/a\.test/);
  assert.doesNotMatch(response.body, /https:\/\/b\.test/);
  current = { userId: 0, authenticated: false };
  response = await app.inject({
    method: "POST",
    url: "/api/utils/updatelinks",
  });
  assert.equal(response.statusCode, 401);
  response = await app.inject({ method: "GET", url: "/api/utils/updatelinks" });
  assert.equal(response.statusCode, 404);
  authenticationEnabled = false;
  current = system;
  response = await app.inject({
    method: "DELETE",
    url: `/api/bookmarks/${bobBookmark}`,
  });
  assert.equal(response.statusCode, 200);
});

test("static plugin boots with the installed Fastify", async (t) => {
  const app = Fastify();
  await app.register(fastifyStatic, {
    root: new URL(".", import.meta.url).pathname,
  });
  t.after(() => app.close());
  const response = await app.inject({ url: "/ownership.test.js" });
  assert.equal(response.statusCode, 200);
});

test("outbound requests reject local literal destinations and redirects", () => {
  for (const url of [
    "http://127.0.0.1/",
    "http://169.254.169.254/",
    "http://[::1]/",
    "file:///etc/passwd",
  ]) {
    assert.throws(() => outboundOptions(url));
  }
  const options = outboundOptions("https://example.com/");
  assert.throws(() =>
    options.beforeRedirect({ protocol: "http:", hostname: "10.0.0.1" })
  );
  assert.doesNotThrow(() => assertPublicAddress("142.251.156.4"));
  assert.doesNotThrow(() => assertPublicAddress("2001:4860:482c:400::"));
  assert.throws(() => assertPublicAddress("::ffff:7f00:1"), /not public/);
  assert.doesNotThrow(() => assertPublicAddress("::ffff:8efb:9c04"));
});
