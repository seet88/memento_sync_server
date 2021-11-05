import { isEmptyObject } from "../../utils/memento";
import { IDatabaseDeletedItems } from "../database/databaseDeletedItems";
import { DatabaseField } from "../database/databaseField";
import { IDatabaseRow, IDatabaseRowResponse } from "../database/databaseRow";
import { IMementoRow, IMementoRowResponse } from "../memento/mementoRow";
import { ISpreadsheetTemplate } from "../spreadsheetsTemplate";
import { DMLMode } from "./dataComparerTable";
import { DataComparerField, IMementoDbDiff } from "./dataComparerField";

interface IDataComparerRow {
  template: ISpreadsheetTemplate;
  memento: IMementoRow;
  database: IDatabaseRow | null;
  databaseDeletedRows?: IDatabaseDeletedItems[];
  tableName?: string;
}

export interface IDataRowChanges {
  database: IDatabaseRowDMLChanges;
  memento: IMementoRowDMLChanges;
}

export interface IDatabaseRowDMLChanges {
  insert?: IDatabaseRowResponse;
  update?: IDatabaseRowResponse;
  delete?: IDatabaseRowResponse;
  tableSQLName?: string | null;
  isInMemento?: boolean;
}

export interface IMementoRowDMLChanges {
  insert?: IMementoRowResponse;
  update?: IMementoRowResponse;
  delete?: IMementoRowResponse;
}

export class DataComparerRow {
  compareMementoAgainstDatabaseRow(inputRow: IDataComparerRow) {
    const rowChanges: IDataRowChanges = {
      memento: {},
      database: {},
    };
    const { memento, database, template, databaseDeletedRows } = inputRow;
    if (this.checkIfRowHasBeenDeleted(inputRow)) {
      rowChanges.memento.delete = {
        uniqueName: memento.uniqueName,
        memento_id: memento.memento_id,
      };
    } else {
      const rowDiff = this.compareMementoDatabaseRow(inputRow);
      // rowChanges.database.update = rowDiff.database.update;
      // rowChanges.database.insert = rowDiff.database.insert;
      // rowChanges.memento.update = rowDiff.memento.update;
      rowChanges.memento = rowDiff.memento;
      rowChanges.database = rowDiff.database;
    }
    return rowChanges;
  }

  checkIfRowHasBeenDeleted(inputRow: IDataComparerRow) {
    const deletedRow = inputRow?.databaseDeletedRows?.find(
      (row) =>
        row.rowUniqueKey === inputRow.memento.uniqueNameAsInDatabase &&
        row.tableName === inputRow.tableName
    );
    return deletedRow ? true : false;
  }

  compareMementoDatabaseRow(rowData: IDataComparerRow) {
    let rowChanges: IDataRowChanges = {
      memento: {},
      database: {},
    };
    const { memento, database, template } = rowData;
    if (database) {
      const rowsDiff = this.compareRowValues(rowData, DMLMode.update);

      const mementoUpdatedRow: IMementoRowResponse = {
        uniqueName: memento.uniqueName,
        memento_id: memento.memento_id,
        fields: [],
      };

      rowsDiff
        ?.filter((rowDiff) => !isEmptyObject(rowDiff?.memento))
        ?.forEach((rowFiltered) => {
          mementoUpdatedRow?.fields?.push(rowFiltered?.memento || {});
        });
      if (mementoUpdatedRow?.fields?.length)
        rowChanges.memento.update = mementoUpdatedRow;

      const databaseUpdatedRow: IDatabaseRowResponse = {
        fields: [],
        ref: database.ref,
      };
      rowsDiff
        ?.filter((rowDiff) => !isEmptyObject(rowDiff?.database))
        ?.forEach((field) => databaseUpdatedRow.fields?.push(field.database));

      if (databaseUpdatedRow?.fields?.length)
        rowChanges.database.update = databaseUpdatedRow;
      rowChanges.database.isInMemento = true;
    } else {
      const dbNewRow = this.getMementoDataForDatabaseInsert(
        memento,
        template
      ).database;
      rowChanges.database.insert = dbNewRow;
    }
    return rowChanges;
  }

  addStaticFieldsToMementoDbDiff(
    mementoDbDiff: Array<IMementoDbDiff | null> | null,
    mementoRow: IMementoRow
  ) {
    const mementoDbDiffCopy = [];
    const diffObj: IMementoDbDiff = {
      memento: {},
      database: {},
      isEmpty: true,
    };

    if (mementoDbDiff?.find((diff) => !isEmptyObject(diff?.database))) {
      diffObj.database = this.getDatabaseFieldLastMementoEditTime(mementoRow);
      diffObj.isEmpty = false;
      mementoDbDiffCopy?.push(diffObj);
    }
    return mementoDbDiffCopy;
  }

  getDatabaseFieldLastMementoEditTime(
    mementoRow: Pick<IMementoRow, "lastModifiedTime">
  ) {
    return new DatabaseField(
      mementoRow.lastModifiedTime,
      "datetime",
      null,
      "lastMementoEditTime"
    );
  }

  compareRowValues(rowData: IDataComparerRow, mode: DMLMode) {
    const { memento, database, template } = rowData;
    if (!database) return;
    const mementoDbDiff: IMementoDbDiff[] = [];
    template.columns?.forEach((templateField) => {
      if (
        templateField.mssqlFieldName in database.fields &&
        templateField.mementoFieldKey in memento.fields
      ) {
        const isDbRowNewerThenMemento = this.checkIfdatabaseValueIsNewer(
          database,
          memento
        );
        const mementoField = memento.fields[templateField.mementoFieldKey];
        const dbField = database.fields[templateField.mssqlFieldName];
        const fieldComparer = new DataComparerField();
        const fieldDiff = fieldComparer.getValuesDiff({
          memento: mementoField,
          database: dbField,
          templateField,
          mode,
          isDbValueNewerThenMemento: isDbRowNewerThenMemento,
        });
        if (!fieldDiff.isEmpty) mementoDbDiff.push(fieldDiff);
      }
    });
    this.addStaticFieldsToMementoDbDiff(mementoDbDiff, memento).forEach(
      (diff) => mementoDbDiff?.push(diff)
    );
    return mementoDbDiff;
  }

  checkIfdatabaseValueIsNewer(
    dbLastEditTime: Pick<IDatabaseRow, "getLastMementoEditTime">,
    mementoLastEditTime: Pick<IMementoRow, "getParsedLastModifiedTime">
  ) {
    return (
      dbLastEditTime.getLastMementoEditTime() >
      mementoLastEditTime.getParsedLastModifiedTime()
    );
  }

  getMementoDataForDatabaseInsert(
    mementoRow: IMementoRow,
    template: ISpreadsheetTemplate
  ) {
    const databaseDiff: IDatabaseRowResponse = {
      fields: [],
    };
    template.columns?.forEach((templateField) => {
      if (templateField.mementoFieldKey in mementoRow.fields) {
        const mementoField = mementoRow.fields[templateField.mementoFieldKey];
        databaseDiff.fields?.push(
          new DatabaseField(
            mementoField.prepareValueToDatabase(templateField.typeField),
            templateField.typeField,
            templateField.mssqlFieldLength,
            templateField.mssqlFieldName
          )
        );
      }
    });
    databaseDiff.fields?.push(
      this.getDatabaseFieldLastMementoEditTime(mementoRow)
    );
    return {
      memento: {},
      database: databaseDiff,
      isEmpty: false,
    };
  }
}
