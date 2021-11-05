import { DatabaseField, IDatabaseField } from "../database/databaseField";
import { IMementoField, MementoField } from "../memento/mementoField";
import { ISheetColumn } from "../spreadsheetsTemplate";
import { DMLMode } from "./dataComparerTable";

export interface IMementoDbDiff {
  memento: IMementoField | {};
  database: IDatabaseField | {};
  isEmpty: boolean;
}

export interface IFieldComparer {
  database: IDatabaseField;
  memento: IMementoField;
  templateField: ISheetColumn;
  mode: DMLMode;
  isDbValueNewerThenMemento: boolean;
}

export class DataComparerField {
  getValuesDiff(fieldForCompare: IFieldComparer) {
    const diff: IMementoDbDiff = {
      memento: {},
      database: {},
      isEmpty: true,
    };
    const {
      database,
      memento,
      templateField,
      mode,
      isDbValueNewerThenMemento,
    } = fieldForCompare;
    if (
      (mode === DMLMode.insert ||
        this.checkIfValueIsChanged(fieldForCompare)) &&
      this.checkIfFieldTypeIsSupported(templateField)
    ) {
      diff.isEmpty = false;
      if (mode === DMLMode.insert || isDbValueNewerThenMemento) {
        const mementoNewField = new MementoField(
          templateField.sheetFieldName,
          memento.type,
          database.value
        );
        diff.memento = mementoNewField;
      } else {
        const dbNewValue =
          memento.prepareValueToDatabase(templateField.typeField) || null;
        const dbNewField = new DatabaseField(
          dbNewValue,
          templateField.typeField,
          templateField.mssqlFieldLength,
          templateField.mssqlFieldName
        );
        diff.database = dbNewField;
      }
    }
    return diff;
  }

  checkIfValueIsChanged(field: IFieldComparer) {
    if (this.checkIfBothValueIsEmpty(field.database, field.memento))
      return false;
    if (this.checkIfOneValueIsEmptyAndSecendNot(field.database, field.memento))
      return true;
    if (field.memento.value?.constructor === Array)
      return this.checkIfArrayIsDiff(field.database, field.memento.value);
    return this.checkIfPrimitiveValuesIsDiff(field);
  }

  checkIfBothValueIsEmpty(
    dbValue: IDatabaseField,
    mementoValue: IMementoField
  ) {
    return dbValue.isEmpty() && mementoValue.isEmpty();
  }

  checkIfOneValueIsEmptyAndSecendNot(
    dbValue: IDatabaseField,
    mementoValue: IMementoField
  ) {
    if (dbValue.isEmpty() && !mementoValue.isEmpty()) return true;
    if (!dbValue.isEmpty() && mementoValue.isEmpty()) return true;
    return false;
  }

  checkIfArrayIsDiff(dbValue: IDatabaseField, mementoValues: string[]) {
    for (const mValue of mementoValues) {
      if (!String(dbValue.value)?.includes(mValue.trim())) return true;
    }
    for (const dValue of String(dbValue.value)?.split(",")) {
      if (!String(mementoValues.includes(dValue.trim()))) return true;
    }
    return false;
  }
  checkIfPrimitiveValuesIsDiff(field: IFieldComparer) {
    const mementoParsedValue = field.memento.prepareValueToDatabase(
      field.templateField.typeField
    );
    if (field.templateField.typeField === "date") {
      if (
        mementoParsedValue instanceof Date &&
        field.database.value instanceof Date
      )
        return this.checkIfDateDiffIsGreaterThan(
          mementoParsedValue,
          field.database.value,
          200
        );
      return true;
    }
    if (field.templateField.typeField === "datetime") {
      if (
        mementoParsedValue instanceof Date &&
        field.database.value instanceof Date
      )
        return this.checkIfDateDiffIsGreaterThan(
          mementoParsedValue,
          field.database.value,
          1
        );
      return true;
    }
    return mementoParsedValue !== field.database.value;
  }

  checkIfFieldTypeIsSupported(dbColumnType: Pick<ISheetColumn, "typeField">) {
    switch (dbColumnType.typeField) {
      case "date":
        return true;
      case "datetime":
        return true;
      default:
        return true;
    }
  }

  checkIfDateDiffIsGreaterThan(
    value1: Date,
    value2: Date,
    diffInMinutes: number
  ) {
    const value1Newer = new Date(value1.getTime() + diffInMinutes * 60000);
    const value1Older = new Date(value1.getTime() - diffInMinutes * 60000);
    if (value1Newer > value2 && value2 > value1Older) return false;
    return true;
  }
}
