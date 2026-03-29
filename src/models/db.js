const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "db.json");

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ students: [], subjects: [], grades: [] }, null, 2),
      "utf-8"
    );
  }
}

function readDB() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  dbPath,
  ensureDatabase,
  readDB,
  writeDB,
};
