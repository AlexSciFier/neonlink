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

  deleteItem(id) {
    this.db
      .prepare("DELETE FROM category WHERE id = :categoryId")
      .run({ categoryId: id });
    return true;
  }

  updateItem(id, name, color) {
    const updateQuery = `UPDATE category SET 
        name = coalesce(:name,name), 
        color = coalesce(:color,color)
      WHERE id = :id`;

    return this.db.prepare(updateQuery).run({ id, name, color }).changes > 0;
  }

  updatePositions(idPositionPairArray) {
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
