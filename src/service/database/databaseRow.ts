import { DMLMode } from "../dataCompare/dataComparerTable";
import { IDatabaseField, DatabaseField } from "./databaseField";

export interface IDatabaseRow {
  uniqueName?: string;
  SysStartTime?: Date;
  lastMementoEditTime?: Date | null;
  memento_id?: string;
  fields: IDatabaseFields;
  isInMemento?: boolean;
  ref: number;
  getLastMementoEditTime(): Date;
}

export interface IDatabaseRowResponse {
  fields?: Array<IDatabaseField | {}>;
  ref?: number;
  uniqueName?: string;
  mode?: DMLMode;
}

interface IDatabaseFields {
  [key: string]: IDatabaseField;
}

export class DatabaseRow implements IDatabaseRow {
  fields;
  SysStartTime;
  uniqueName;
  lastMementoEditTime;
  memento_id;
  ref;
  isInMemento: boolean;

  constructor(fields: any) {
    this.SysStartTime = fields.SysStartTime;
    this.uniqueName = fields.uniqueName;
    this.lastMementoEditTime = fields.lastMementoEditTime;
    this.memento_id = fields.MEMENTO_ID;
    this.ref = fields[this.getRefKeyFromFields(fields)];
    this.fields = this.parseAndAddFields(fields);
    this.isInMemento = false;
  }

  getRefKeyFromFields(fields: any) {
    const refKey = "ref";
    return (
      Object.keys(fields)?.find(
        (key) => String(key)?.toLowerCase() === refKey?.toLowerCase()
      ) || ""
    );
  }

  parseAndAddFields(fields: any) {
    const newFields: any = {};
    for (const fieldKey in fields) {
      if (this.checkIfCustomField(fieldKey))
        newFields[fieldKey] = new DatabaseField(fields[fieldKey]);
    }
    return newFields;
  }

  checkIfCustomField(fieldName: string) {
    switch (fieldName) {
      case "MEMENTO_ID":
        return false;
      case "lastMementoEditTime":
        return false;
      case "SysStartTime":
        return false;
      case "uniqueName":
        return false;
      default:
        return true;
    }
  }

  getLastMementoEditTime() {
    return this.lastMementoEditTime
      ? this.lastMementoEditTime
      : this.SysStartTime;
  }
}
