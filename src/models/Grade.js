const crypto = require("crypto");
const { readDB, writeDB } = require("./db");

function createId() {
  return `grd_${crypto.randomUUID()}`;
}

function calculatePercentage(grade) {
  if (!grade.maxScore || Number(grade.maxScore) <= 0) return 0;
  return (Number(grade.score) / Number(grade.maxScore)) * 100;
}

class Grade {
  static list(filters = {}) {
    const db = readDB();
    return db.grades.filter((entry) => {
      if (filters.studentId && entry.studentId !== filters.studentId) return false;
      if (filters.subjectId && entry.subjectId !== filters.subjectId) return false;
      if (filters.term && entry.term !== filters.term) return false;
      return true;
    });
  }

  static findById(gradeId) {
    const db = readDB();
    return db.grades.find((entry) => entry.id === gradeId) || null;
  }

  static create(payload) {
    const db = readDB();
    const studentExists = db.students.some((entry) => entry.id === payload.studentId);
    const subjectExists = db.subjects.some((entry) => entry.id === payload.subjectId);

    if (!studentExists) {
      const error = new Error("studentId does not exist");
      error.statusCode = 400;
      throw error;
    }

    if (!subjectExists) {
      const error = new Error("subjectId does not exist");
      error.statusCode = 400;
      throw error;
    }

    const grade = {
      id: createId(),
      studentId: payload.studentId,
      subjectId: payload.subjectId,
      score: Number(payload.score),
      maxScore: Number(payload.maxScore),
      term: payload.term || "general",
      weight: Number(payload.weight || 1),
      date: payload.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    db.grades.push(grade);
    writeDB(db);
    return {
      ...grade,
      percentage: Number(calculatePercentage(grade).toFixed(2)),
    };
  }

  static update(gradeId, payload) {
    const db = readDB();
    const grade = db.grades.find((entry) => entry.id === gradeId);
    if (!grade) return null;

    grade.score = payload.score !== undefined ? Number(payload.score) : grade.score;
    grade.maxScore = payload.maxScore !== undefined ? Number(payload.maxScore) : grade.maxScore;
    grade.term = payload.term ?? grade.term;
    grade.weight = payload.weight !== undefined ? Number(payload.weight) : grade.weight;
    grade.date = payload.date ?? grade.date;
    grade.updatedAt = new Date().toISOString();

    writeDB(db);
    return {
      ...grade,
      percentage: Number(calculatePercentage(grade).toFixed(2)),
    };
  }

  static delete(gradeId) {
    const db = readDB();
    const previousLength = db.grades.length;
    db.grades = db.grades.filter((entry) => entry.id !== gradeId);
    if (db.grades.length === previousLength) {
      return false;
    }

    writeDB(db);
    return true;
  }
}

module.exports = Grade;
