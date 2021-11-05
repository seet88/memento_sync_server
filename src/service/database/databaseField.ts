import { isEmptyObject, isNotEmpty } from "../../utils/memento";

export type databaseField = string | number | null | Date;

export interface IDatabaseField {
  value: databaseField;
  type?: string;
  size?: number | null;
  name?: string;
  isEmpty(): boolean;
}

export class DatabaseField {
  constructor(
    public value: databaseField,
    public type?: string,
    public size?: number | null,
    public name?: string
  ) {}

  isEmpty(): boolean {
    return !isNotEmpty(this.value);
  }
}
