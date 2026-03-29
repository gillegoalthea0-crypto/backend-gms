const Grade = require("../models/Grade");
const { sendJson, parseBody } = require("./http");

async function handleGradesRoute({ method, pathname, requestUrl, req, res }) {
  if (method === "GET" && pathname === "/api/grades") {
    const filters = {
      studentId: requestUrl.searchParams.get("studentId") || undefined,
      subjectId: requestUrl.searchParams.get("subjectId") || undefined,
      term: requestUrl.searchParams.get("term") || undefined,
    };

    sendJson(res, 200, Grade.list(filters));
    return true;
  }

  if (method === "POST" && pathname === "/api/grades") {
    const body = await parseBody(req);
    const { studentId, subjectId, score, maxScore } = body;

    if (!studentId || !subjectId || score === undefined || maxScore === undefined) {
      sendJson(res, 400, {
        message: "studentId, subjectId, score and maxScore are required",
      });
      return true;
    }

    const grade = Grade.create(body);
    sendJson(res, 201, grade);
    return true;
  }

  if (method === "PUT" && /^\/api\/grades\/[^/]+$/.test(pathname)) {
    const gradeId = pathname.split("/")[3];
    const body = await parseBody(req);
    const updated = Grade.update(gradeId, body);

    if (!updated) {
      sendJson(res, 404, { message: "Grade not found" });
      return true;
    }

    sendJson(res, 200, updated);
    return true;
  }

  if (method === "DELETE" && /^\/api\/grades\/[^/]+$/.test(pathname)) {
    const gradeId = pathname.split("/")[3];
    const deleted = Grade.delete(gradeId);

    if (!deleted) {
      sendJson(res, 404, { message: "Grade not found" });
      return true;
    }

    sendJson(res, 200, { message: "Grade deleted" });
    return true;
  }

  return false;
}

module.exports = handleGradesRoute;
