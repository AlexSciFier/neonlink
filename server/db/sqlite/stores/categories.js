import { ownerCondition } from "./ownership.js";
import { visibleCondition } from "./ownership.js";

export default class CategoriesStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(name, color, userId) {
    const selectPositionsQuery = `SELECT * FROM categoryPosition ORDER BY position DESC LIMIT 1`;
    let lastPosition =
      this.db.prepare(selectPositionsQuery).get()?.position || 0;

    const insertQuery = `INSERT INTO category (name, color, userId) VALUES(:name,:color,:userId)`;
    const categoryId = this.db
      .prepare(insertQuery)
      .run({ name, color, userId }).lastInsertRowid;

    const insertPositionQuery = `INSERT INTO categoryPosition (categoryId, position) VALUES(:categoryId,:position)`;
    this.db
      .prepare(insertPositionQuery)
      .run({ categoryId, position: ++lastPosition });

    return categoryId;
  }

  getAll(userId) {
    let selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id`;
    let selectParams = {};
    if (userId) {
      selectQuery += ` WHERE (userId IN (:userId, 0) OR userId IS NULL) `;
      selectParams.userId = userId;
    }
    selectQuery += ` ORDER BY position ASC`;

    return this.db.prepare(selectQuery).all(selectParams);
  }

  getItemById(id) {
    const selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
      WHERE 
        categoryId = :id
      ORDER BY position ASC`;
    return this.db.prepare(selectQuery).get({ id });
  }

  getItemByName(name, userId) {
    let selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
 
      `;
    let selectParams = { name };
    let conditions = [];
    conditions.push("name = :name");
    if (userId) {
      conditions.push("(userId IN (:userId, 0) OR userId IS NULL)");
      selectParams.userId = userId;
    }

    if (conditions.length > 0)
      selectQuery += ` WHERE ${conditions.join(" AND ")} `;

    selectQuery += `ORDER BY position ASC`;
    return this.db.prepare(selectQuery).get(selectParams);
  }

  getModifiableByName(name, scope) {
    const owner = ownerCondition(scope);
    return this.db
      .prepare(
        `SELECT id FROM category WHERE name = :name AND ${owner.sql}
      ORDER BY CASE WHEN userId = :preferredUser THEN 0 ELSE 1 END, id LIMIT 1`
      )
      .get({ name, preferredUser: scope.userId, ...owner.params });
  }

  isVisible(id, scope) {
    if (id == null || id === 0) return true;
    const owner = visibleCondition(scope);
    return !!this.db
      .prepare(`SELECT 1 FROM category WHERE id = :id AND ${owner.sql}`)
      .get({ id, ...owner.params });
  }

  isModifiable(id, scope) {
    const owner = ownerCondition(scope);
    return !!this.db
      .prepare(`SELECT 1 FROM category WHERE id = :id AND ${owner.sql}`)
      .get({ id, ...owner.params });
  }

  deleteItem(id, scope) {
    if (!this.isModifiable(id, scope)) return false;
    const statements = [
      "DELETE FROM category WHERE id = :categoryId",
      "DELETE FROM categoryPosition WHERE categoryId = :categoryId",
    ].map((sql) => this.db.prepare(sql));

    const deleteTransaction = this.db.transaction((data) => {
      for (const stmt of statements) {
        stmt.run(data);
      }
    });

    deleteTransaction({ categoryId: id });

    return true;
  }

  updateItem(id, name, color, scope) {
    const owner = ownerCondition(scope);
    const updateQuery = `UPDATE category SET 
        name = coalesce(:name,name), 
        color = coalesce(:color,color)
      WHERE id = :id AND ${owner.sql}`;

    return (
      this.db.prepare(updateQuery).run({ id, name, color, ...owner.params })
        .changes > 0
    );
  }

  updatePositions(idPositionPairArray, scope) {
    const owner = ownerCondition(scope);
    if (!idPositionPairArray.length) return true;
    const ids = [...new Set(idPositionPairArray.map((item) => item.id))];
    const placeholders = ids.map((_, i) => `:id${i}`).join(",");
    const params = Object.fromEntries(ids.map((id, i) => [`id${i}`, id]));
    const count = this.db
      .prepare(
        `SELECT COUNT(*) AS count FROM category WHERE id IN (${placeholders}) AND ${owner.sql}`
      )
      .get({ ...params, ...owner.params }).count;
    if (count !== ids.length) return false;
    const insertQuery = `UPDATE categoryPosition SET position = coalesce(:position,position) WHERE categoryId = :id`;
    const insert = this.db.prepare(insertQuery);

    const insertMany = this.db.transaction((items) => {
      for (const item of items)
        insert.run({ id: item.id, position: item.position });
    });

    insertMany(idPositionPairArray);
    return true;
  }
}
