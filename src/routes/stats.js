const Student = require("../models/Student");
const { sendJson } = require("./http");

async function handleStatsRoute({ method, pathname, res, passingPercentage }) {
  if (method === "GET" && pathname === "/api/alerts/at-risk") {
    const reports = Student.getAtRiskStudents(passingPercentage);
    sendJson(res, 200, {
      passingPercentage,
      count: reports.length,
      students: reports,
    });
    return true;
  }

  return false;
}

module.exports = handleStatsRoute;
