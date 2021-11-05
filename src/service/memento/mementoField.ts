import {
  isEmptyObject,
  isNotEmpty,
  prepareValueToNumeric,
  prepareValueToDatetime,
  prepareValueToDate,
} from "../../utils/memento";
import { databaseField } from "../database/databaseField";

export type mementoFieldValue = string | number | Array<string> | null | Date;

export interface IMementoField {
  name: string;
  type: string;
  value: mementoFieldValue;
  isEmpty(): boolean;
  prepareValueToDatabase(fieldType: string): databaseField;
}

export class MementoField implements IMementoField {
  constructor(
    public name: string,
    public type: string,
    public value: mementoFieldValue
  ) {}

  isEmpty(): boolean {
    if (!isEmptyObject(this.value)) return !isNotEmpty(this.value);
    else return true;
  }

  prepareValueToDatabase(fieldType: string): databaseField {
    if (!this.value) return null;
    switch (fieldType) {
      case "float":
        return prepareValueToNumeric(this.value) || null;
      case "int":
        return prepareValueToNumeric(this.value) || null;
      case "bigint":
        return prepareValueToNumeric(this.value) || null;
      case "date":
        return prepareValueToDate(this.value) || null;
      case "datetime":
        return prepareValueToDatetime(this.value) || null;
      default:
        return String(this.value);
    }
  }
}
