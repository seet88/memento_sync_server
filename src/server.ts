import createServer from "./app";
import * as database from "./service/database/databaseManipulator";

const app = createServer();
database.connect();

app.listen("3000", () => {
  console.log("server runs on port 3000");
});
