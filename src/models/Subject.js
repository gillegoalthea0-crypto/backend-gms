const crypto = require("crypto");
const { readDB, writeDB } = require("./db");

function createId() {
  return `sub_${crypto.randomUUID()}`;
}

class Subject {
  static getAll() {
    return readDB().subjects;
  }

  static findById(subjectId) {
    const db = readDB();
    return db.subjects.find((entry) => entry.id === subjectId) || null;
  }

  static create(payload) {
    const db = readDB();
    const subject = {
      id: createId(),
      name: payload.name,
      teacher: payload.teacher || null,
      createdAt: new Date().toISOString(),
    };

    db.subjects.push(subject);
    writeDB(db);
    return subject;
  }
}

module.exports = Subject;
