import { IDatabaseRow, DatabaseRow } from "./databaseRow";
export interface IDatabaseTable {
  tableName: string;
  lastTimeSynchronizedByUser: Date | null;
  rows: IDatabaseRow[];
}

export class DatabaseTable implements IDatabaseTable {
  rows: IDatabaseRow[];
  constructor(
    public tableName: string,
    public lastTimeSynchronizedByUser: Date | null
  ) {
    this.rows = [];
  }

  parseRawRows(rawRows: Array<Object>) {
    this.rows = rawRows.map((row) => {
      return new DatabaseRow(row);
    });
  }
}
