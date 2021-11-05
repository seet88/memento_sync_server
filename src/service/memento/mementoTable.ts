import { IMementoRow, MementoRow } from "./mementoRow";

export interface IMementoTable {
  tableName: string;
  tableNameAsInGS?: string;
  rows: Array<IMementoRow>;
  setUniqueNameAsInDatabaseInAllRows(uniqueNameKyes: string[] | null): void;
}

export class MementoTable implements IMementoTable {
  tableName;
  rows;
  tableNameAsInGS;
  constructor(obj: any) {
    this.tableName = obj.tableName;
    this.tableNameAsInGS = this.setTableNameAsInGS(this.tableName);
    this.rows = this.getParseRows(obj.entries);
  }

  getParseRows(rows: Array<object>): Array<IMementoRow> {
    return rows.map((row) => new MementoRow(row));
  }

  setTableNameAsInGS(name: string): string {
    //if (name === "Opis produktow PROD") return "sor_nawozy_nasiona";
    if (name === "FV_ALL") return "Sheet1";
    if (name === "pola PROD") return "pola";
    return name;
  }

  setUniqueNameAsInDatabaseInAllRows(uniqueNameKyes: string[] | null) {
    if (uniqueNameKyes)
      this.rows.map((row) => row.setUniqueNameAsInDatabase(uniqueNameKyes));
  }
}
