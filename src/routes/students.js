const Student = require("../models/Student");
const { sendJson, parseBody } = require("./http");

async function handleStudentsRoute({ method, pathname, req, res, passingPercentage }) {
  if (method === "GET" && pathname === "/api/students") {
    sendJson(res, 200, Student.getAll());
    return true;
  }

  if (method === "POST" && pathname === "/api/students") {
    const body = await parseBody(req);
    if (!body.name || !body.email) {
      sendJson(res, 400, { message: "name and email are required" });
      return true;
    }

    const student = Student.create(body);
    sendJson(res, 201, student);
    return true;
  }

  if (method === "GET" && /^\/api\/students\/[^/]+$/.test(pathname)) {
    const studentId = pathname.split("/")[3];
    const student = Student.findById(studentId);
    if (!student) {
      sendJson(res, 404, { message: "Student not found" });
      return true;
    }
    sendJson(res, 200, student);
    return true;
  }

  if (method === "PUT" && /^\/api\/students\/[^/]+$/.test(pathname)) {
    const studentId = pathname.split("/")[3];
    const body = await parseBody(req);
    const updated = Student.update(studentId, body);

    if (!updated) {
      sendJson(res, 404, { message: "Student not found" });
      return true;
    }

    sendJson(res, 200, updated);
    return true;
  }

  if (method === "DELETE" && /^\/api\/students\/[^/]+$/.test(pathname)) {
    const studentId = pathname.split("/")[3];
    const deleted = Student.delete(studentId);

    if (!deleted) {
      sendJson(res, 404, { message: "Student not found" });
      return true;
    }

    sendJson(res, 200, { message: "Student and related grades deleted" });
    return true;
  }

  if (method === "GET" && /^\/api\/students\/[^/]+\/report$/.test(pathname)) {
    const studentId = pathname.split("/")[3];
    const report = Student.getReport(studentId, passingPercentage);

    if (!report) {
      sendJson(res, 404, { message: "Student not found" });
      return true;
    }

    sendJson(res, 200, report);
    return true;
  }

  return false;
}

module.exports = handleStudentsRoute;
