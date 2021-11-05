import { prepareFieldNameKey, isNotEmpty, isNumeric } from "../utils/memento";

export interface ISpreadsheetTemplate {
  keyID: string;
  mssqlTableName: string;
  sheetName: string;
  spreadSheetNumber: number;
  columns?: Array<ISheetColumn>;
  getSQLColumnsNamesForUniqueName(): string;
  getColumnsNamesForUniqueName(): string[] | null;
}

export interface ISheetColumn {
  ref: number;
  sheetFieldName: string;
  mssqlFieldName: string;
  typeField: string;
  mssqlFieldLength: number;
  mssqlUniqueField: boolean;
  sheetName: string;
  keyId: string;
  active: boolean;
  mssqlTableName: string;
  sheetID: string;
  mementoFieldKey: string;
}

export class SpreadsheetTemplate implements ISpreadsheetTemplate {
  keyID: string;
  mssqlTableName: string;
  sheetName: string;
  spreadSheetNumber: number;
  columns: Array<ISheetColumn>;

  constructor(templateRawData: Object, templateSpreadsheetInfoRaw: any) {
    this.keyID = templateSpreadsheetInfoRaw.keyID;
    this.mssqlTableName = templateSpreadsheetInfoRaw.mssqlTableName;
    this.sheetName = templateSpreadsheetInfoRaw.sheetName;
    this.spreadSheetNumber = templateSpreadsheetInfoRaw.spreadSheetNumber;
    this.columns = this.mapSheetColumnsFromRawData(templateRawData);
  }

  mapSheetColumnsFromRawData(rawData: any): Array<ISheetColumn> {
    const { values } = rawData;

    return values.map((column: Array<String>) => {
      return {
        ref: this.getElementDataFromArrayAndParse(column, 0, "number"),
        sheetFieldName: this.getElementDataFromArrayAndParse(
          column,
          1,
          "string"
        ),
        mementoFieldKey: prepareFieldNameKey(
          this.getElementDataFromArrayAndParse(column, 1, "string")
        ),
        mssqlFieldName: this.getElementDataFromArrayAndParse(
          column,
          2,
          "string"
        ),
        typeField: this.getElementDataFromArrayAndParse(column, 3, "string"),
        mssqlFieldLength: this.getElementDataFromArrayAndParse(
          column,
          4,
          "number"
        ),
        mssqlUniqueField: this.getElementDataFromArrayAndParse(
          column,
          5,
          "boolean"
        ),
        sheetName: this.getElementDataFromArrayAndParse(column, 6, "string"),
        keyId: this.getElementDataFromArrayAndParse(column, 7, "string"),
        active: this.getElementDataFromArrayAndParse(column, 8, "boolean"),
        mssqlTableName: this.getElementDataFromArrayAndParse(
          column,
          9,
          "string"
        ),
        sheetID: this.getElementDataFromArrayAndParse(column, 10, "string"),
      };
    });
  }

  getElementDataFromArrayAndParse(
    rawArray: Array<any>,
    index: number,
    parseToType: string
  ): string | number | boolean | null {
    if (parseToType === "number")
      return String(rawArray[index]).toLocaleLowerCase() === "max"
        ? 99999999
        : this.parseToNumeric(rawArray[index]);
    if (parseToType === "boolean") return this.parseToBoolean(rawArray[index]);
    return String(rawArray[index]);
  }

  getColumnsNamesForUniqueName(): string[] | null {
    const uniqueNames = this.columns?.map((column) =>
      column.mssqlUniqueField ? column.mssqlFieldName : ""
    );
    return uniqueNames?.filter((name) => name);
  }

  getSQLColumnsNamesForUniqueName(): string {
    return ` trim(CONCAT_WS(' ', ${this.getColumnsNamesForUniqueName()?.join(
      ","
    )} , '' )) as uniqueName `;
  }

  parseToBoolean(value: any): boolean {
    if (value === "tak") return true;
    return false;
  }

  parseToNumeric(value: any): number | null {
    if (isNotEmpty(value)) {
      if (isNumeric(value)) return Number(value);
      value = String(value).replace(",", ".");
      if (isNumeric(value)) return Number(value);
    } else return null;
    return null;
  }
}
