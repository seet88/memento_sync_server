const { google } = require("googleapis");

/** Class representing a google spreadsheet reader. */

class GSReader {
  /**
   * Create sheetReader.
   * @param {string} keyID - Spreadsheet keyID.
   * @param {string} sheetName - sheet name.
   */
  constructor(keyID, sheetName) {
    this.keyID = keyID;
    this.sheetName = sheetName;
  }

  /**
   * Set range in A1 notation
   * @param {string} sheetName
   * @param {string} range
   */
  setRange(sheetName, range) {
    this.range = sheetName + "!" + range;
  }

  /**
   * get sheet's values
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  getSheetValuesWithAuthentication(auth) {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets({ version: "v4", auth });
      this.setRange(this.sheetName, "A:EE");
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: this.keyID,
          range: this.range,
        },
        (err, res) => {
          if (err) reject(err);
          const rows = res.data.values;
          if (rows.length) {
            this.setValues(rows);
            console.log("Name, Major:" + rows[1].length);
            resolve(rows);
          } else {
            console.log("No data found.");
          }
        }
      );
    });
  }

  /**
   * get sheet's values
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  updateSheetWithAuthentication(auth, values) {
    return new Promise((resolve, reject) => {
      const sheets = google.sheets({ version: "v4", auth });
      const resource = {
        values,
      };
      //console.log(JSON.stringify(resource));
      this.setRange(this.sheetName, this.range);
      let valueInputOption = "USER_ENTERED";
      sheets.spreadsheets.values.update(
        {
          spreadsheetId: this.keyID,
          range: this.range,
          valueInputOption,
          resource,
        },
        (err, result) => {
          if (err) {
            // Handle error
            console.log(err);
          } else {
            console.log("%d cells updated.", result.updatedCells);
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * create array of request for delete rows
   * @param {object} mappedTable
   * @returns {Array} request
   */
  getDeleteRowsRequest(mappedTable) {
    let requests = [];
    let counter = 0;
    for (let i = 1; i < mappedTable.uniqueValue.length; i++) {
      if (!mappedTable.updatedRows[i]) {
        requests.push({
          deleteDimension: {
            range: {
              sheetId: mappedTable.sheetID,
              dimension: "ROWS",
              startIndex: i - counter,
              endIndex: i + 1 - counter,
            },
          },
        });
        counter += 1;
      }
    }
    return requests;
  }

  /**
   * delete spread sheets rows
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
  deleteRowsWithAuthentication(auth, mappedTable) {
    return new Promise((resolve, reject) => {
      let requests = this.getDeleteRowsRequest(mappedTable);
      // Add additional requests (operations)
      const batchUpdateRequest = { requests };
      const sheets = google.sheets({ version: "v4", auth });

      //console.log(JSON.stringify(requests));
      this.setRange(this.sheetName, this.range);
      if (requests.length > 0) {
        sheets.spreadsheets.batchUpdate(
          {
            spreadsheetId: this.keyID,
            resource: batchUpdateRequest,
          },
          (err, result) => {
            if (err) {
              // Handle error
              console.log(err);
            } else {
              resolve(result);
            }
          }
        );
      } else {
        resolve("Nothing to delete");
      }
    });
  }

  /**
   * set values from sheet
   * @param {2DArray} values
   */
  setValues(values) {
    this.values = values;
  }

  /**
   * geting columns names from first row of values
   * @param {2DArray} values
   * @returns {Array} columnsNames
   */
  getColumnsNames(values) {
    if (this.isNotEmpty(values)) return values[0];
    else return [];
  }

  /**
   * settings object migration properties witch is google sheets migrations
   */
  setMigrationProperty() {
    this.migration = {
      columns: {
        ref: {
          name: "REF",
        },
        sheetFieldName: {
          name: "Pole w GS",
        },
        mssqlFieldName: {
          name: "Pole w MSSQL",
        },
        typeField: {
          name: "TypPola",
        },
        sheetName: {
          name: "Nazwa GS",
        },
        keyID: {
          name: "Klucz",
        },
        active: {
          name: "PoleAktywne",
        },
        mssqlTableName: {
          name: "Nazwa Tabeli MSSQL",
        },
        mssqlUniqueField: {
          name: "MSSQL unikalnosc",
        },
        mssqlFieldLength: {
          name: "Rozmiar pola",
        },
        sheetID: {
          name: "SheetID",
        },
      },
      values: this.values,
      columnsListNames: this.getColumnsNames(this.values),
    };
  }
  /**
   * searching column number by it's name in migration listname
   * acording to specified columns
   * @this GSReader
   */
  setNumbersOfSearchedColumns() {
    this.migration.columns.ref.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.ref.name
    );
    this.migration.columns.sheetFieldName.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.sheetFieldName.name
    );
    this.migration.columns.mssqlFieldName.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.mssqlFieldName.name
    );
    this.migration.columns.typeField.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.typeField.name
    );
    this.migration.columns.sheetName.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.sheetName.name
    );
    this.migration.columns.keyID.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.keyID.name
    );
    this.migration.columns.active.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.active.name
    );
    this.migration.columns.mssqlTableName.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.mssqlTableName.name
    );
    this.migration.columns.mssqlUniqueField.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.mssqlUniqueField.name
    );
    this.migration.columns.mssqlFieldLength.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.mssqlFieldLength.name
    );
    this.migration.columns.sheetID.number = this.getColumnNumber(
      this.migration.columnsListNames,
      this.migration.columns.sheetID.name
    );
  }
  /**
   * searching given name in columnListName - and returning array index
   * @this GSReader
   * @param {array} columnListName
   * @param {string} searchedName
   * @returns {number}
   */
  getColumnNumber(columnListName, searchedName) {
    if (this.isNotEmpty(searchedName)) {
      searchedName = "#" + searchedName + "#";
      for (let i = 0; i <= columnListName.length; i++) {
        if (
          searchedName
            .toLowerCase()
            .indexOf("#" + columnListName[i].toLowerCase() + "#") > -1 &&
          this.isNotEmpty(columnListName[i])
        ) {
          return i;
        }
      }
    }
    return "";
  }

  /**
   * set property and get migration objects
   * which contains values and columns name and number
   * @return {object} migration
   */
  getMigrationValues() {
    this.setMigrationProperty();
    this.setNumbersOfSearchedColumns();
    return this.migration;
  }

  /**
   * check if string is not empty
   * @param {string} string
   * @returns {boolean}
   */
  isNotEmpty(string) {
    if (!string) return false;
    if (string == "") return false;
    if (string === false) return false;
    if (string === null) return false;
    if (string == undefined) return false;
    string = string + " "; // check for a bunch of whitespace
    if ("" == string.replace(/^\s\s*/, "").replace(/\s\s*$/, "")) return false;
    return true;
  }

  /**
   * Draw out list of uniq spreadsheet keyID and sheet name from migration values.
   * @param {object} migration
   */
  getListOfSpreadSheetForMigration(migration) {
    let spreadsheetList = [];
    let previouslyKeyID = "";
    let previouslySheetName = "";
    let migrationValuesPerSheetList = [];
    let migrationValuesPerSheet = [];
    let counter = 0;
    if (
      this.isNotEmpty(migration.columns.keyID.number) &&
      this.isNotEmpty(migration.columns.sheetName.number)
    ) {
      let values = migration.values;
      values.forEach((element) => {
        if (
          (element[migration.columns.keyID.number] != previouslyKeyID ||
            element[migration.columns.sheetName.number] !=
              previouslySheetName) &&
          element[migration.columns.keyID.number] !=
            migration.columns.keyID.name
        ) {
          let spreadsheet = {
            keyID: element[migration.columns.keyID.number],
            sheetName: element[migration.columns.sheetName.number],
            mssqlTableName: element[migration.columns.mssqlTableName.number],
            spreadSheetNumber: counter,
          };
          spreadsheetList.push(spreadsheet);
          counter++;
        }
        previouslyKeyID = element[migration.columns.keyID.number];
        previouslySheetName = element[migration.columns.sheetName.number];
      });
    } else throw "No migration columns number filed!";
    return spreadsheetList;
  }

  /**
   * split migration values per sheets
   * @param {object} migration
   * @returns {array}
   */
  splitMigrationValuesPerSheet(migration) {
    let previouslyKeyID = "";
    let previouslySheetName = "";
    let migrationValuesPerSheetList = [];
    let migrationValuesPerSheet = [];
    let migrationSheet;
    let migrationObject = {};
    if (
      this.isNotEmpty(migration.columns.keyID.number) &&
      this.isNotEmpty(migration.columns.sheetName.number)
    ) {
      let values = migration.values;
      values.forEach((element) => {
        if (
          element[migration.columns.keyID.number] !=
          migration.columns.keyID.name
        ) {
          if (
            element[migration.columns.keyID.number] != previouslyKeyID ||
            element[migration.columns.sheetName.number] != previouslySheetName
          ) {
            if (this.isNotEmpty(previouslyKeyID)) {
              migrationObject = {
                columns: this.migration.columns,
                values: migrationValuesPerSheet,
                columnsListNames: this.migration.columnsListNames,
              };
              migrationValuesPerSheetList.push(migrationObject);
            }
            migrationValuesPerSheet = [];
          }

          migrationValuesPerSheet.push(element);

          previouslyKeyID = element[migration.columns.keyID.number];
          previouslySheetName = element[migration.columns.sheetName.number];
        }
      });
      migrationObject = {
        columns: this.migration.columns,
        values: migrationValuesPerSheet,
        columnsListNames: this.migration.columnsListNames,
      };
      migrationValuesPerSheetList.push(migrationObject);
    } else throw "No migration columns number filed!";

    return migrationValuesPerSheetList;
  }
}
module.exports = GSReader;
