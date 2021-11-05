import { IDatabaseRow, IDatabaseRowResponse } from "../database/databaseRow";
import { IDatabaseTable } from "../database/databaseTable";
import { IMementoRowResponse } from "../memento/mementoRow";
import { IMementoTable } from "../memento/mementoTable";
import { ISpreadsheetTemplate } from "../spreadsheetsTemplate";
import { isEmptyObject } from "../../utils/memento";
import { IDatabaseDeletedItems } from "../database/databaseDeletedItems";
import { DataComparerRow } from "./dataComparerRow";

export enum DMLMode {
  insert,
  update,
  delete,
}

export interface IDdatabaseChanges {
  insert: Array<IDatabaseRowResponse>;
  update: Array<IDatabaseRowResponse>;
  delete: Array<IDatabaseRowResponse>;
  tableSQLName: string | null;
}

export interface IMementoChanges {
  insert: Array<IMementoRowResponse>;
  update: Array<IMementoRowResponse>;
  delete: Array<IMementoRowResponse>;
}

interface IDataComparerTable {
  databaseTable: IDatabaseTable;
  mementoTable: IMementoTable;
  spreadsheetTemplate: ISpreadsheetTemplate;
  databaseDeletedRows: IDatabaseDeletedItems[];
}

export class DataComparerTable {
  getDataDifference(tableData: IDataComparerTable) {
    return this.compareDatabaseToMementoTable(tableData);
  }

  compareDatabaseToMementoTable(tableData: IDataComparerTable) {
    const { mementoChanges, databaseChanges } =
      this.compareToMementoRows(tableData);
    const remainingRowsDiff = this.compareDatabaseRemainingRows(tableData);
    databaseChanges.delete = remainingRowsDiff.databaseChanges.delete;
    mementoChanges.insert = remainingRowsDiff.mementoChanges.insert;

    databaseChanges.tableSQLName = tableData.spreadsheetTemplate.mssqlTableName;

    return {
      mementoChanges,
      databaseChanges,
    };
  }

  compareToMementoRows(tableData: IDataComparerTable) {
    const mementoChanges: IMementoChanges = {
      insert: [],
      update: [],
      delete: [],
    };
    const databaseChanges: IDdatabaseChanges = {
      insert: [],
      update: [],
      delete: [],
      tableSQLName: null,
    };

    tableData.mementoTable.rows.map((mementoRow) => {
      //find db row
      const dbRow =
        this.findDBRowByUniqueName(
          tableData.databaseTable.rows,
          mementoRow?.uniqueNameAsInDatabase || null
        ) || null;
      const rowComparer = new DataComparerRow();
      const rowDiff = rowComparer.compareMementoAgainstDatabaseRow({
        memento: mementoRow,
        database: dbRow,
        template: tableData.spreadsheetTemplate,
        databaseDeletedRows: tableData.databaseDeletedRows,
        tableName: tableData.databaseTable.tableName,
      });
      if (rowDiff.database.update)
        databaseChanges.update.push(rowDiff.database.update);
      if (rowDiff.memento.update)
        mementoChanges.update.push(rowDiff.memento.update);
      if (dbRow) dbRow.isInMemento = rowDiff.database.isInMemento;
    });

    return {
      mementoChanges,
      databaseChanges,
    };
  }

  compareDatabaseRemainingRows(tableData: IDataComparerTable) {
    const mementoChanges: IMementoChanges = {
      insert: [],
      update: [],
      delete: [],
    };
    const databaseChanges: IDdatabaseChanges = {
      insert: [],
      update: [],
      delete: [],
      tableSQLName: null,
    };

    tableData.databaseTable.rows
      .filter((dbRow) => !dbRow.isInMemento)
      .map((dbRowFiltered) => {
        if (
          this.checkIfMissingRowWasDeletedInMemento(
            dbRowFiltered?.lastMementoEditTime || null,
            tableData.databaseTable.lastTimeSynchronizedByUser
          )
        ) {
          const deleteRow: IDatabaseRowResponse = {
            ref: dbRowFiltered.ref,
            uniqueName: dbRowFiltered?.uniqueName || "",
          };
          databaseChanges.delete.push(deleteRow);
        } else {
          const mementoNewRow: IMementoRowResponse = {
            fields: [],
          };

          const rowComparer = new DataComparerRow();

          rowComparer
            .compareRowValues(
              {
                database: dbRowFiltered,
                memento: tableData.mementoTable.rows[0],
                template: tableData.spreadsheetTemplate,
              },
              DMLMode.insert
            )
            ?.filter((rowDiff) => !isEmptyObject(rowDiff?.memento))
            ?.forEach((rowFiltered) =>
              mementoNewRow.fields?.push(rowFiltered?.memento || {})
            );
          if (mementoNewRow?.fields?.length)
            mementoChanges.insert.push(mementoNewRow);
        }
      });
    return {
      mementoChanges,
      databaseChanges,
    };
  }

  checkIfMissingRowWasDeletedInMemento(
    lastMementoEditTime: Date | null,
    lastSynchroniseByUser: Date | null
  ) {
    if (!lastMementoEditTime) return true;
    if (!lastSynchroniseByUser) return false;
    return lastMementoEditTime < lastSynchroniseByUser;
  }

  findDBRowByUniqueName(
    dbRows: IDatabaseRow[],
    mementoUniqueName: string | null
  ) {
    if (!mementoUniqueName) return null;
    return dbRows?.find(
      (row) =>
        row?.uniqueName?.trim()?.toLocaleLowerCase() ===
        mementoUniqueName?.trim().toLocaleLowerCase()
    );
  }
}
