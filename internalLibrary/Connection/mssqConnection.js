const sql = require("mssql");
const config = require("../../configuration/mssql/config.js");

class MSSQLManager {
  runQuery(queryStatement) {
    return new Promise((resolve, reject) => {
      sql
        .connect(config)
        .then((pool) => {
          // Query
          //console.log(queryStatement);
          return pool.request().query(queryStatement);
        })
        .then((result) => {
          //console.log(result);
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });

      sql.on("error", (err) => {
        reject(err);
      });
    });
  }

  async close() {
    await sql.close();
  }

  async connect() {
    await sql.connect(config);
  }

  async runStatement(statement) {
    const result = await sql.query(statement);
    console.log(result);
    return result;
  }

  /**
   * check if string is not empty
   * @param {string} string
   * @returns {boolean}
   */
  isNotEmpty(string) {
    if (!string) return false;
    if (string == "") return false;
    if (string === false) return false;
    if (string === null) return false;
    if (string == undefined) return false;
    string = string + " "; // check for a bunch of whitespace
    if ("" == string.replace(/^\s\s*/, "").replace(/\s\s*$/, "")) return false;
    return true;
  }
}
module.exports = MSSQLManager;
