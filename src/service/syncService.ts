const Controller = require("../../internalLibrary/Controller/controller.js");
const users = require("../../configuration/users.js");
import * as database from "./database/databaseManipulator";
import {
  ISpreadsheetTemplate,
  SpreadsheetTemplate,
} from "./spreadsheetsTemplate";

import { MementoTable } from "./memento/mementoTable";
import { DatabaseTable } from "./database/databaseTable";
import { DataComparerTable } from "./dataCompare/dataComparerTable";
import { IDatabaseDeletedItems } from "./database/databaseDeletedItems";

interface ISyncService {
  spreadsheetsTemplates?: ISpreadsheetTemplate[];
}

export class SyncService implements ISyncService {
  spreadsheetsTemplates: ISpreadsheetTemplate[];
  constructor() {
    this.spreadsheetsTemplates = [];
  }

  async getRawSyncTablesTemplate() {
    let controller = new Controller();
    const migrationSheet = await controller.getMigration();
    return migrationSheet;
  }

  parseRawTemplateDataToSpreadsheetList(rawTemplates: any) {
    const { spreadsheetList, migration } = rawTemplates;
    let spreadsheetsTemplates: Array<ISpreadsheetTemplate> = [];
    for (const [index, sheet] of spreadsheetList.entries()) {
      spreadsheetsTemplates.push(
        new SpreadsheetTemplate(migration[index], sheet)
      );
    }
    return spreadsheetsTemplates;
  }

  async synchroniseDBWithMementoData(mementoRequest: any) {
    const { userName } = mementoRequest;
    if (!this.isValidUserName(userName, users))
      throw new Error("Forbidden user");
    if (!mementoRequest) throw new Error("empty request");
    let mementoTable = new MementoTable(mementoRequest);

    const rawTemplates = await this.getRawSyncTablesTemplate();
    this.spreadsheetsTemplates =
      this.parseRawTemplateDataToSpreadsheetList(rawTemplates);
    let ssTemplate = this.getTemplateTableByName(mementoTable.tableNameAsInGS);
    if (!ssTemplate)
      throw new Error(`no template for ${mementoTable.tableNameAsInGS}`);

    const dbTableRaw = await database.getTableDataFromDB(
      ssTemplate.mssqlTableName,
      ssTemplate.getSQLColumnsNamesForUniqueName()
    );

    const dbDeletedRowsOfTable: IDatabaseDeletedItems[] =
      await database.getDeletedRowsOfTable(ssTemplate.mssqlTableName);

    const dbLastSynchroniseUserTableTime =
      await database.getLastSynchroniseUserTableTime(
        ssTemplate.mssqlTableName,
        userName
      );

    mementoTable.setUniqueNameAsInDatabaseInAllRows(
      ssTemplate.getColumnsNamesForUniqueName()
    );

    const databaseTable = new DatabaseTable(
      ssTemplate.mssqlTableName,
      dbLastSynchroniseUserTableTime[0]?.last_synchronise || null
    );
    databaseTable.parseRawRows(dbTableRaw);

    const dataComparer = new DataComparerTable();
    const mementoDatabaseChanges = dataComparer.getDataDifference({
      databaseTable,
      mementoTable,
      spreadsheetTemplate: ssTemplate,
      databaseDeletedRows: dbDeletedRowsOfTable,
    });

    database.setTableWithChangedData(
      mementoDatabaseChanges.databaseChanges,
      userName
    );
    return mementoDatabaseChanges.mementoChanges;
  }

  getTemplateTableByName(
    mementoTableName: string
  ): ISpreadsheetTemplate | null {
    return (
      this.spreadsheetsTemplates.find(
        (template) => template.sheetName === mementoTableName
      ) || null
    );
  }

  isValidUserName(userName: string, listOfValidUser: Array<any>): boolean {
    return listOfValidUser.find((user) => user.userName === userName)
      ? true
      : false;
  }
}

export default SyncService;
