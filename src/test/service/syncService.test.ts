import SyncService from "../../service/syncService";
const users = require("../../../configuration/users.js");

describe("SyncService", () => {
  describe("validateUserName", () => {
    it("should return false if not valid user", () => {
      const usersName = "SomeWrongUserName";
      const syncService = new SyncService();
      expect(syncService.isValidUserName(usersName, users)).toBe(false);
    });

    it("should return true if valid user from list", () => {
      const usersName = users[0].userName;
      const syncService = new SyncService();
      expect(syncService.isValidUserName(usersName, users)).toBe(true);
    });
  });

  describe("synchroniseDBWithMementoData", () => {
    it("should  riseError if invalid userName", () => {
      const request = { userName: "invalidUserName" };
      const syncService = new SyncService();
      const t = () => syncService.synchroniseDBWithMementoData(request);
      // expect(t).toThrow("Forbidden user");
      expect(t).rejects.toThrow("Forbidden user");
    });
  });

  const spreadsheetList = [
    {
      keyID: "xxxzzzzyyyxx",
      mssqlTableName: "Filtry_i_oleje_PROD",
      sheetName: "Filtry i oleje PROD",
      spreadSheetNumber: 3,
    },
    {
      keyID: "xxxyyyxx",
      mssqlTableName: "Siew_2017_PROD ",
      sheetName: "Siew PROD",
      spreadSheetNumber: 16,
    },
  ];

  // describe("findSpreadsheetIndexByName", () => {
  //   it("should return -1 if no sheet with this name", () => {
  //     const mementoTableName = "";
  //     const syncService = new SyncService();
  //     expect(
  //       syncService.findSpreadsheetByName(mementoTableName)
  //     ).toBe(-1);
  //   });

  //   it("should return grather then 1 if found index sheet with this name", () => {
  //     const mementoTableName = "Siew PROD";
  //     const syncService = new SyncService();
  //     expect(
  //       syncService.findSpreadsheetByName(mementoTableName)
  //     ).toBeGreaterThan(-1);
  //   });
  // });
  // describe("getSyncTablesTemplate", () => {
  //   it("should return some think if empty data", async () => {
  //     const request = {};
  //     const syncService = new SyncService();
  //     const { migration } = await syncService.getSyncTablesTemplate();
  //     expect(migration.length).toBeGreaterThan(1);
  //   });
  // });
});
