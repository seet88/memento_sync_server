const config = require("../../configuration/mssql/config.js");
const mssql = require("mssql");

async function connect() {
  await mssql.connect(config);
}

async function close() {
  await mssql.close();
}

async function runStatement(statement) {
  try {
    const result = await mssql.query(statement);
    console.log(result);
    return result;
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
  connect,
  close,
  runStatement,
};
