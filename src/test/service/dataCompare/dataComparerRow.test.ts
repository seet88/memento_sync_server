import { DatabaseField } from "../../../service/database/databaseField";
import { DatabaseRow } from "../../../service/database/databaseRow";
import { DataComparerRow } from "../../../service/dataCompare/dataComparerRow";
import { DMLMode } from "../../../service/dataCompare/dataComparerTable";
import { MementoRow } from "../../../service/memento/mementoRow";
import { SpreadsheetTemplate } from "../../../service/spreadsheetsTemplate";
import { objectSample as mementoSampleObj } from "../memento/mementoRow.test";

const templateSampleObj = {
  templateField: {
    ref: 505,
    sheetFieldName: "Nazwa",
    mementoFieldKey: "nazwa",
    mssqlFieldName: "Nazwa",
    typeField: "varchar(500)",
    mssqlFieldLength: 500,
    mssqlUniqueField: true,
    sheetName: "SomeSheetName",
    keyId: "SomeKeyId",
    active: true,
    mssqlTableName: "SomeDbTableName",
    sheetID: "SomeSheetID",
  },
};

const templateSpreadsheetInfoRaw = {
  keyID: "SomeKey",
  sheetName: "Sheet1",
  mssqlTableName: "FV_ALL",
  spreadSheetNumber: 0,
};

const columns = {
  values: [
    [
      "1",
      "dostawca",
      "dostawca",
      "varchar(250)",
      "250",
      "",
      "Sheet1",
      "SomeKey",
      "tak",
      "FV_ALL",
      "0",
    ],
    [
      "2",
      "nr faktury",
      "nr_faktury",
      "varchar(250)",
      "250",
      "",
      "Sheet1",
      "SomeKey",
      "tak",
      "FV_ALL",
      "0",
    ],
    [
      "35",
      "REF",
      "REF",
      "int",
      "",
      "tak",
      "Sheet1",
      "SomeKey",
      "tak",
      "FV_ALL",
      "0",
    ],
  ],
};

const templateSS = new SpreadsheetTemplate(columns, templateSpreadsheetInfoRaw);

describe("getDatabaseFieldLastMementoEditTime", () => {
  test("should return dabaseField with lastModifietTime", () => {
    const dcr = new DataComparerRow();
    const mementoRow = new MementoRow(mementoSampleObj);
    mementoRow.lastModifiedTime = "2021-10-22T22:53:52.000Z";

    const result = dcr.getDatabaseFieldLastMementoEditTime(mementoRow);
    const expectedObj = new DatabaseField(
      mementoRow.lastModifiedTime,
      "datetime",
      null,
      "lastMementoEditTime"
    );

    expect(result).toEqual(expectedObj);
  });
});

describe("addStaticFieldsToMementoDbDiff", () => {
  test("should return empty array when passed array is empty", () => {
    const dcr = new DataComparerRow();
    const mementoRow = new MementoRow(mementoSampleObj);

    const result = dcr.addStaticFieldsToMementoDbDiff([], mementoRow);

    expect(result).toEqual([]);
  });

  test("should return array with static fields if diff passed array is not empty", () => {
    const dcr = new DataComparerRow();
    const mementoRow = new MementoRow(mementoSampleObj);

    const fieldDiff = {
      memento: {},
      database: new DatabaseField(
        "someMementoValue",
        templateSampleObj.templateField.typeField,
        templateSampleObj.templateField.mssqlFieldLength,
        templateSampleObj.templateField.mssqlFieldName
      ),
      isEmpty: false,
    };
    const mementoDbDiff = [fieldDiff];

    const result = dcr.addStaticFieldsToMementoDbDiff(
      mementoDbDiff,
      mementoRow
    );
    const expectedObj = {
      memento: {},
      isEmpty: false,
      database: new DatabaseField(
        mementoRow.lastModifiedTime,
        "datetime",
        null,
        "lastMementoEditTime"
      ),
    };

    expect(result).toEqual([expectedObj]);
  });
});

describe("checkIfdatabaseValueIsNewer", () => {
  const dbSampleObj = {
    Nazwa_srodka: "Reglone 200 SL",
    ID: "H-49-1",
    jednostka_opakowania: "l",
    Wartosc_netto: 183.5,
    Data_wprowadzenia_co_do_minuty: null,
    Data_waznosci: null,
    REF: 3,
    Cena_sr_wazona_zl_l: null,
    MEMENTO_ID: "1616326948012",
    lastMementoEditTime: {},
    uniqueName: "3",
    SysStartTime: {},
  };
  test("should return true if db lastmodyfication is newer then memento ", () => {
    const dcr = new DataComparerRow();
    const mementoRow = new MementoRow(mementoSampleObj);
    mementoRow.lastModifiedTime = "2018-07-26T12:16:04.000Z";
    const databaseRow = new DatabaseRow(dbSampleObj);
    databaseRow.lastMementoEditTime = new Date("2018-07-26T13:16:04.000Z");

    const isDbValueNewer = dcr.checkIfdatabaseValueIsNewer(
      databaseRow,
      mementoRow
    );

    expect(isDbValueNewer).toBe(true);
  });
});

describe("getMementoDataForDatabaseInsert", () => {
  test("should return obj with values ", () => {
    const dcr = new DataComparerRow();
    const mementoRow = new MementoRow(mementoSampleObj);

    const result = dcr.getMementoDataForDatabaseInsert(mementoRow, templateSS);
    const expectObj = {
      database: {
        fields: [
          { name: "REF", size: null, type: "int", value: 282 },
          {
            name: "lastMementoEditTime",
            size: null,
            type: "datetime",
            value: "2021-10-22T22:53:52.000Z",
          },
        ],
      },
      isEmpty: false,
      memento: {},
    };

    expect(result).toEqual(expectObj);
  });
});

describe("compareRowValues", () => {
  const dbSampleObj = {
    Nazwa_srodka: "Reglone 200 SL",
    ID: "H-49-1",
    jednostka_opakowania: "l",
    Wartosc_netto: 183.5,
    Data_wprowadzenia_co_do_minuty: null,
    Data_waznosci: null,
    REF: 3,
    Cena_sr_wazona_zl_l: null,
    MEMENTO_ID: "1616326948012",
    lastMementoEditTime: {},
    uniqueName: "3",
    SysStartTime: {},
  };
  const dataComparerRow = {
    template: templateSS,
    memento: new MementoRow(mementoSampleObj),
    database: new DatabaseRow(dbSampleObj),
    databaseDeletedRows: [],
    tableName: "fv_all",
  };
  test("should return object if is different between memento and db values ", () => {
    const dcr = new DataComparerRow();

    const result = dcr.compareRowValues(dataComparerRow, DMLMode.update);
    const expectObj = [
      {
        database: { name: "REF", size: null, type: "int", value: 282 },
        isEmpty: false,
        memento: {},
      },
      {
        database: {
          name: "lastMementoEditTime",
          size: null,
          type: "datetime",
          value: "2021-10-22T22:53:52.000Z",
        },
        isEmpty: false,
        memento: {},
      },
    ];

    expect(result).toEqual(expectObj);
  });
});
