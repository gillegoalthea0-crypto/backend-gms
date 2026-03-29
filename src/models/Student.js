const crypto = require("crypto");
const { readDB, writeDB } = require("./db");

function createId() {
  return `stu_${crypto.randomUUID()}`;
}

function calculateGradePercentage(grade) {
  if (!grade.maxScore || Number(grade.maxScore) <= 0) return 0;
  return (Number(grade.score) / Number(grade.maxScore)) * 100;
}

class Student {
  static getAll() {
    return readDB().students;
  }

  static findById(studentId) {
    const db = readDB();
    return db.students.find((entry) => entry.id === studentId) || null;
  }

  static create(payload) {
    const db = readDB();
    const student = {
      id: createId(),
      name: payload.name,
      email: payload.email,
      gradeLevel: payload.gradeLevel || null,
      createdAt: new Date().toISOString(),
    };

    db.students.push(student);
    writeDB(db);
    return student;
  }

  static update(studentId, payload) {
    const db = readDB();
    const student = db.students.find((entry) => entry.id === studentId);
    if (!student) return null;

    student.name = payload.name ?? student.name;
    student.email = payload.email ?? student.email;
    student.gradeLevel = payload.gradeLevel ?? student.gradeLevel;
    student.updatedAt = new Date().toISOString();

    writeDB(db);
    return student;
  }

  static delete(studentId) {
    const db = readDB();
    const previousLength = db.students.length;
    db.students = db.students.filter((entry) => entry.id !== studentId);

    if (db.students.length === previousLength) {
      return false;
    }

    db.grades = db.grades.filter((entry) => entry.studentId !== studentId);
    writeDB(db);
    return true;
  }

  static getReport(studentId, passingPercentage = 60) {
    const db = readDB();
    const student = db.students.find((entry) => entry.id === studentId);
    if (!student) return null;

    const grades = db.grades.filter((entry) => entry.studentId === studentId);
    const subjectsMap = new Map(db.subjects.map((subject) => [subject.id, subject]));

    const bySubject = {};
    let weightedScoreSum = 0;
    let weightTotal = 0;

    for (const grade of grades) {
      const percentage = calculateGradePercentage(grade);
      const weight = Number(grade.weight || 1);

      if (!bySubject[grade.subjectId]) {
        bySubject[grade.subjectId] = {
          subjectId: grade.subjectId,
          subjectName: subjectsMap.get(grade.subjectId)?.name || "Unknown",
          entries: 0,
          weightedSum: 0,
          weightSum: 0,
        };
      }

      bySubject[grade.subjectId].entries += 1;
      bySubject[grade.subjectId].weightedSum += percentage * weight;
      bySubject[grade.subjectId].weightSum += weight;

      weightedScoreSum += percentage * weight;
      weightTotal += weight;
    }

    const subjects = Object.values(bySubject).map((subjectSummary) => ({
      subjectId: subjectSummary.subjectId,
      subjectName: subjectSummary.subjectName,
      entries: subjectSummary.entries,
      averagePercentage:
        subjectSummary.weightSum > 0
          ? Number((subjectSummary.weightedSum / subjectSummary.weightSum).toFixed(2))
          : 0,
    }));

    const overallAverage = weightTotal > 0 ? Number((weightedScoreSum / weightTotal).toFixed(2)) : 0;

    return {
      student,
      totalGrades: grades.length,
      passingPercentage,
      overallAverage,
      status: overallAverage >= passingPercentage ? "PASSING" : "AT_RISK",
      subjects,
    };
  }

  static getAtRiskStudents(passingPercentage = 60) {
    const db = readDB();
    return db.students
      .map((student) => Student.getReport(student.id, passingPercentage))
      .filter(Boolean)
      .filter((report) => report.status === "AT_RISK");
  }
}

module.exports = Student;
