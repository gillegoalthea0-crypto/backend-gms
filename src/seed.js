const { writeDB, ensureDatabase } = require("./models/db");

function seed() {
  ensureDatabase();

  const now = new Date().toISOString();
  const today = new Date().toISOString().split("T")[0];

  const students = [
    {
      id: "stu_seed_ana",
      name: "Ana Perez",
      email: "ana@example.com",
      gradeLevel: "10",
      createdAt: now,
    },
    {
      id: "stu_seed_mario",
      name: "Mario Soto",
      email: "mario@example.com",
      gradeLevel: "11",
      createdAt: now,
    },
  ];

  const subjects = [
    {
      id: "sub_seed_math",
      name: "Mathematics",
      teacher: "Mr. Diaz",
      createdAt: now,
    },
    {
      id: "sub_seed_science",
      name: "Science",
      teacher: "Ms. Rojas",
      createdAt: now,
    },
  ];

  const grades = [
    {
      id: "grd_seed_1",
      studentId: "stu_seed_ana",
      subjectId: "sub_seed_math",
      score: 78,
      maxScore: 100,
      term: "Q1",
      weight: 1,
      date: today,
      createdAt: now,
    },
    {
      id: "grd_seed_2",
      studentId: "stu_seed_ana",
      subjectId: "sub_seed_science",
      score: 61,
      maxScore: 100,
      term: "Q1",
      weight: 1,
      date: today,
      createdAt: now,
    },
    {
      id: "grd_seed_3",
      studentId: "stu_seed_mario",
      subjectId: "sub_seed_math",
      score: 55,
      maxScore: 100,
      term: "Q1",
      weight: 1,
      date: today,
      createdAt: now,
    },
  ];

  writeDB({ students, subjects, grades });
  console.log("Database seeded successfully.");
}

seed();
