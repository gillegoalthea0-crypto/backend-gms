const Subject = require("../models/Subject");
const { sendJson, parseBody } = require("./http");

async function handleSubjectsRoute({ method, pathname, req, res }) {
  if (method === "GET" && pathname === "/api/subjects") {
    sendJson(res, 200, Subject.getAll());
    return true;
  }

  if (method === "POST" && pathname === "/api/subjects") {
    const body = await parseBody(req);
    if (!body.name) {
      sendJson(res, 400, { message: "name is required" });
      return true;
    }

    const subject = Subject.create(body);
    sendJson(res, 201, subject);
    return true;
  }

  return false;
}

module.exports = handleSubjectsRoute;
