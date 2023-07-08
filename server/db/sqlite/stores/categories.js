export default class CategoriesStore {
  constructor(sqliteInstance) {
    this.db = sqliteInstance;
  }

  addItem(name, color) {
    const selectPositionsQuery = `SELECT * FROM categoryPosition ORDER BY position DESC LIMIT 1`;
    let lastPosition =
      this.db.prepare(selectPositionsQuery).get()?.position || 0;

    const insertQuery = `INSERT INTO category (name, color) VALUES(:name,:color)`;
    const categoryId = this.db
      .prepare(insertQuery)
      .run({ name, color }).lastInsertRowid;

    const insertPositionQuery = `INSERT INTO categoryPosition (categoryId, position) VALUES(:categoryId,:position)`;
    this.db
      .prepare(insertPositionQuery)
      .run({ categoryId, position: ++lastPosition });

    return categoryId;
  }

  getAll() {
    const selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
      ORDER BY position ASC`;

    return this.db.prepare(selectQuery).all();
  }

  getItemById(id) {
    const selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
      WHERE 
        categoryId = :id
      ORDER BY position ASC`;
    return this.db.prepare(selectQuery).get(id);
  }

  getItemByName(name) {
    const selectQuery = `SELECT 
        id, name, color, position FROM category 
      INNER JOIN categoryPosition ON categoryPosition.categoryId = category.id
      WHERE 
        name = :name
      ORDER BY position ASC`;

    return this.db.prepare(selectQuery).get({ name });
  }

  deleteItem(id) {
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
