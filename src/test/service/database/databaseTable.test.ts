import { DatabaseTable } from "../../../service/database/databaseTable";

describe("constructor", () => {
  it("", () => {
    const correctTableName = "correctTableName";
    const lastTimeSynch = null;
    const databaseTable = new DatabaseTable(correctTableName, lastTimeSynch);
    expect(databaseTable.tableName).toEqual(correctTableName);
    expect(databaseTable.lastTimeSynchronizedByUser).toEqual(lastTimeSynch);
  });
});
