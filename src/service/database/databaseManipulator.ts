const config = require("../../../configuration/mssql/config.js");
const mssql = require("mssql");
const SQLManager = require("../../../internalLibrary/Controller/SQLManager.js");

//const sqlManager = new SQLManager();

export async function connect() {
  await mssql.connect(config);
}

export async function close() {
  await mssql.close();
}

export async function runStatement(statement: string) {
  try {
    const result = await mssql.query(statement);
    console.log(result);
    return result;
  } catch (err) {
    console.log((err as Error).message);
  }
}

export async function getTableDataFromDB(
  tableName: string,
  additionalColumnsNames: string
) {
  const sqlManager = new SQLManager();
  const stm = sqlManager.getSQLStatementForTableDate(
    tableName,
    additionalColumnsNames
  );
  const result = await runStatement(stm);
  return result.recordset;
}

export async function getDeletedRowsOfTable(tableName: string) {
  const sqlManager = new SQLManager();
  const stm = sqlManager.getDeletedRowsOfTable(tableName);
  const result = await runStatement(stm);
  return result.recordset;
}

export async function getLastSynchroniseUserTableTime(
  tableName: string,
  userName: string
) {
  const sqlManager = new SQLManager();
  let stm = sqlManager.getLastSynchroniseUserTableTimeStm(tableName, userName);
  const result = await runStatement(stm);
  return result.recordset;
}

export async function setTableWithChangedData(
  databaseChanges: any,
  userName: string
) {
  const sqlManager = new SQLManager();
  if (databaseChanges.insert?.length > 0) {
    const multiStm = sqlManager.getInsertStatementFromMementoData(
      databaseChanges.insert,
      databaseChanges.tableSQLName
    );
    await runStatement(multiStm);
  }
  if (databaseChanges.update?.length > 0) {
    const multiStm = sqlManager.getUpdateStatementFromMementoData(
      databaseChanges.update,
      databaseChanges.tableSQLName
    );
    await runStatement(multiStm);
  }
  if (databaseChanges.delete?.length > 0) {
    let multiStm = sqlManager.getDeleteStatementFromMementoData(
      databaseChanges.tableSQLName,
      databaseChanges.delete
    );
    await runStatement(multiStm);

    multiStm = sqlManager.getInsertStatementForDeletedItems(
      databaseChanges.tableSQLName,
      userName,
      databaseChanges.delete
    );

    await runStatement(multiStm);
  }

  await updateSynchroniseTime(databaseChanges.tableSQLName, userName);
}

async function updateSynchroniseTime(tableName: string, userName: string) {
  const sqlManager = new SQLManager();
  const stm = sqlManager.getSynchroniseTimeStatement(tableName, userName);
  await runStatement(stm);
}
