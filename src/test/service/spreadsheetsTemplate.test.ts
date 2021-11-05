import { SpreadsheetTemplate } from "../../service/spreadsheetsTemplate";

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

describe("constructor", () => {
  it("should ", () => {
    const template = new SpreadsheetTemplate(
      columns,
      templateSpreadsheetInfoRaw
    );
    expect(template.keyID).toEqual(templateSpreadsheetInfoRaw.keyID);
    expect(template.sheetName).toEqual(templateSpreadsheetInfoRaw.sheetName);
    expect(template.mssqlTableName).toEqual(
      templateSpreadsheetInfoRaw.mssqlTableName
    );
    expect(template.spreadSheetNumber).toEqual(
      templateSpreadsheetInfoRaw.spreadSheetNumber
    );
  });
});

describe("parseToNumeric", () => {
  it("should return null if pass null", () => {
    expect(templateSS.parseToNumeric(null)).toBe(null);
  });
  it("should return correct value if pass correct number or string number", () => {
    const values = [5, "5"];
    for (const value of values)
      expect(templateSS.parseToNumeric(value)).toBe(Number(value));
  });

  it("should return correct value if pass number with comma", () => {
    const value = "5,4";
    expect(templateSS.parseToNumeric(value)).toBe(5.4);
  });
});

describe("parseToBoolean", () => {
  it("should return true if value is 'tak' ", () => {
    const value = "tak";
    expect(templateSS.parseToBoolean(value)).toBe(true);
  });
  it("should return false if value is empty ", () => {
    const values = ["", null, "nie"];
    values.forEach((value) => {
      expect(templateSS.parseToBoolean(value)).toBe(false);
    });
  });
});

describe("getColumnsNamesForUniqueName", () => {
  it("should containt ref column as unique marked", () => {
    expect(templateSS.getColumnsNamesForUniqueName()).toContain("REF");
  });
});
