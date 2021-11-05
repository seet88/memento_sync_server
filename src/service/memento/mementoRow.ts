import { IMementoField, MementoField } from "./mementoField";
import { prepareFieldNameKey } from "../../utils/memento";

export interface IMementoRow {
  creationTime: string;
  author: string;
  memento_id: string;
  lastModifiedTime: string;
  uniqueName: string;
  fields: IMementoFields;
  uniqueNameAsInDatabase: string | undefined;
  setUniqueNameAsInDatabase(uniqueNameKyes: string[]): void;
  getParsedLastModifiedTime(): Date;
}

export interface IMementoRowResponse {
  memento_id?: string;
  fields?: IMementoFields[] | null;
  uniqueName?: string;
}

interface IMementoFields {
  [key: string]: IMementoField;
}

export class MementoRow {
  creationTime;
  author;
  lastModifiedTime;
  uniqueName;
  memento_id;
  fields;
  uniqueNameAsInDatabase: string | undefined;
  constructor(obj: any) {
    this.creationTime = obj.creationTime;
    this.author = obj.Author;
    this.lastModifiedTime = obj.lastModifiedTime;
    this.uniqueName = obj.uniqueName;
    this.memento_id = obj.MEMENTO_ID;
    this.fields = this.parseRawFields(obj);
  }

  parseRawFields(columns: any): IMementoFields {
    let columnsObj: IMementoFields = {};
    for (const colKey in columns) {
      if (this.checkIfValueIsObject(columns[colKey])) {
        let key = prepareFieldNameKey(columns[colKey].name);
        columnsObj[key] = new MementoField(
          columns[colKey].name,
          columns[colKey].type,
          columns[colKey].value
        );
      }
    }
    return columnsObj;
  }

  checkIfValueIsObject(value: any) {
    return typeof value === "object" && value !== null ? true : false;
  }

  getValuesForColumnList(columnList: string[]): string {
    let val = "";
    for (const key of columnList) {
      if (val.length > 0) val += " ";
      val += this.fields[prepareFieldNameKey(key)].value;
    }
    return val;
  }

  setUniqueNameAsInDatabase(uniqueNameKyes: string[]) {
    this.uniqueNameAsInDatabase = this.getValuesForColumnList(uniqueNameKyes);
  }

  getParsedLastModifiedTime() {
    return new Date(this.lastModifiedTime);
  }
}
