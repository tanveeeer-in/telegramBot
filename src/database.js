const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "../data/database.sqlite"),
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the database.");
  }
);

db.serialize(() => {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            file_id TEXT NOT NULL,
            file_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `,
    (err) => {
      if (err) {
        console.error("Error creating files table:", err);
      } else {
        console.log("Files table ready.");
      }
    }
  );
});

module.exports = db;
