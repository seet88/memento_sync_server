import request from "supertest";
import createServer from "../app";

const app = createServer();

describe("Server checks", function () {
  it("serv is created without error", function (done) {
    request(app).get("/").expect(200, done);
  });
});

describe(" Wrong path", () => {
  it("should return status 404 when invalid route path", async () => {
    const response = await request(app).post("/SomeRandomWrongPath").send();
    expect(response.statusCode).toBe(404);
  });

  it("should return json with error message when error", async () => {
    const response = await request(app).post("/SomeRandomWrongPath").send();
    expect(response.body).toEqual(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});

describe("POST /api/memento", () => {
  // it("should response with 200 status code if correct userName", async () => {
  //   const body = { userName: "alex" };
  //   const response = await request(app).post("/api/memento").send(body);
  //   expect(response.statusCode).toBe(200);
  // });

  it("should response with 400 status code if no userName or empty", async () => {
    const bodyData = [{ userName: "" }, {}];
    for (const body of bodyData) {
      const response = await request(app).post("/api/memento").send(body);
      expect(response.statusCode).toBe(401);
    }
  });
  //jest.setTimeout(30000);
  // it("should specify json content content type header", async () => {
  //   const body = { userName: "alex" };
  //   const response = await request(app).post("/api/memento").send(body);
  //   expect(response.header["content-type"]).toEqual(
  //     expect.stringContaining("json")
  //   );
  // });
});
