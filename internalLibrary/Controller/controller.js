const GSReader = require("../Controller/readSpreadsheet.js");
const Mapper = require("../Controller/mapper.js");
const SQLManager = require("../Controller/SQLManager.js");
const MSSQLManager = require("../Connection/mssqConnection.js");
const ssConnection = require("../Connection/spreadsheetConnection.js");
const driveConnection = require("../Connection/driveConnections.js");
const gDrive = require("../Controller/googleDrive.js");
const googleConfig = require("../../configuration/google/config");

class Controller {
  /**
   * getting data from migration sheets
   */
  getMigration() {
    return new Promise((resolve, reject) => {
      let keyID = googleConfig.migrationSpreadsheetKey;
      let sheetName = googleConfig.migrationSheetName;
      let reader = new GSReader(keyID, sheetName);
      ssConnection.authenticate().then((auth) => {
        reader.getSheetValuesWithAuthentication(auth).then((resp) => {
          reader.getMigrationValues();
          let spreadsheetList = reader.getListOfSpreadSheetForMigration(
            reader.migration
          );
          let migrationValueList = reader.splitMigrationValuesPerSheet(
            reader.migration
          );
          //reader.migration.valuesPerSheet = migrationValuesPerSheetList;
          let migrationList = {
            spreadsheetList: spreadsheetList,
            migration: migrationValueList,
          };
          resolve(migrationList);
        });
      });
    });
  }

  /**
   * Merge values for all (choosen by user) sheets with db
   * @param {object} migrationList
   */
  async getValuesFromAllSheets(migrationList) {
    for (let i = 0; i < migrationList.spreadsheetList.length; i++) {
      if (
        this.listOfNumberGS.indexOf(String(i)) != -1 ||
        this.listOfNumberGS.indexOf("ALL") != -1
      ) {
        await this.getValuesFromSheet(
          migrationList.spreadsheetList[i],
          migrationList.migration[i]
        );
        console.log(
          "z updated: " +
            migrationList.spreadsheetList[i].mssqlTableName +
            "(" +
            migrationList.spreadsheetList[i].spreadSheetNumber +
            ")"
        );
      }
    }
  }

  /**
   * after getMigration is done,
   * it's getting value from each sheet according to migration data keyid and sheetName
   */
  async startMapping() {
    return new Promise((resolve, reject) => {
      this.getMigration().then((migrationList) => {
        this.getValuesFromAllSheets(migrationList).then((res) => {
          resolve();
        });
      });
    });
  }

  /**
   * Idk..?
   * getting values from sheet acording to sheet keyid and name
   * and Map it with values in MSSQL based on migration data
   * @param {array} spreadsheet
   * @param {object} migration
   */
  getValuesFromSheet(spreadsheet, migration) {
    return new Promise((resolve, reject) => {
      let reader2 = new GSReader(spreadsheet.keyID, spreadsheet.sheetName);
      ssConnection.authenticate().then((auth) => {
        reader2.getSheetValuesWithAuthentication(auth).then((rows) => {
          switch (this.actionType) {
            case 1:
              this.mapValuesForMargeMSSQL(rows, migration).then((result) => {
                resolve(result);
              });
              break;
            case 2:
              this.mapValuesForUpadteGS(rows, migration).then((result) => {
                resolve(result);
              });
              break;
            default:
              console.log("default option chosen");
          }
        });
      });
    });
  }

  /**
   * mapping values, checking table compatibility and marge values
   * @param {array2d} sheetValues
   * @param {object} migration
   */
  mapValuesForMargeMSSQL(sheetValues, migration) {
    return new Promise((resolve, reject) => {
      let mapper = new Mapper(migration, sheetValues);
      let mappedTable = mapper.getMappedTable();
      let sqlStatement = "";
      let temporary = true;
      this.checkTable(mappedTable)
        .then((result) => {
          sqlStatement += this.createTable(mappedTable, temporary);
          sqlStatement += this.insertValuesToTemporaryTable(mappedTable);
          sqlStatement += this.mergeTableSQL(mappedTable);
          sqlStatement += this.dropTable(mappedTable);
          sqlStatement += this.setSynchroniseTimeTable(mappedTable, "Download");
          //sqlStatement += this.deleteNotExistRowsFromMSSQL(mappedTable) ;
          console.log(sqlStatement);
          this.runQuery(sqlStatement)
            .then((result) => {
              resolve(result);
            })
            .catch((reject) => {
              console.log("runQuery error: " + reject);
            });
        })
        .catch((reject) => {
          console.log("checkTable error: " + reject);
        });
    });
  }

  /**
   * mapping values, checking table compatibility and marge values
   * @param {array2d} sheetValues
   * @param {object} migration
   */
  mapValuesForUpadteGS(sheetValues, migration) {
    return new Promise((resolve, reject) => {
      let mapper = new Mapper(migration, sheetValues);
      let mappedTable = mapper.getMappedTable();
      //to do think about create select with columns from migration - it will help witch marge especialy date, numbers
      let SqlStatement = "select * from " + mappedTable.name;
      this.runQuery(SqlStatement).then((mssqlValues) => {
        let mappedMssqlTable = mapper.mapMSSQLToGS(mappedTable, mssqlValues);
        if (mappedMssqlTable.isChanged) {
          mappedMssqlTable.sheetID =
            migration.values[0][migration.columns.sheetID.number];
          let mappedMssqlValues = mappedMssqlTable.sheetValues;
          ssConnection.authenticate().then((auth) => {
            let keyID = migration.values[0][migration.columns.keyID.number];
            let sheetName =
              migration.values[0][migration.columns.sheetName.number];
            let reader = new GSReader(keyID, sheetName);
            reader.range = this.getA1Range(mappedMssqlValues);
            //reader.range = 'A1:H8'
            reader
              .updateSheetWithAuthentication(auth, mappedMssqlValues)
              .then((result) => {
                console.log("done" + result);
                console.log("done upload");
                reader.deleteRowsWithAuthentication(auth, mappedMssqlTable);
                this.runQuery(
                  this.setSynchroniseTimeTable(mappedTable, "Upload")
                ).then((mssqlValues) => {
                  resolve(mappedMssqlValues);
                });
                console.log("done upload and sync");
              });
          });
        } else
          this.runQuery(
            this.setSynchroniseTimeTable(mappedTable, "UploadWithoutChanges")
          ).then((mssqlValues) => {
            resolve();
          });
        resolve("Nothink for update");
      });
    });
  }

  /**
   * returning range of values in A1 notatnion
   * @param {Array2d} values
   * @returns {string} rangeInA1
   */
  getA1Range(values) {
    let range = "";
    let lastColumnNumber = values[0].length;
    let lastRowNumber = values.length;
    if (lastColumnNumber > 26) {
      let x = Math.floor(lastColumnNumber / 26);
      let firstLetter = String.fromCharCode(x + 64);
      let reminder = lastColumnNumber - x * 26;
      let secendLetter = String.fromCharCode(reminder + 64);
      range = "A1:" + firstLetter + secendLetter + "" + lastRowNumber;
    } else
      range =
        "A1:" + String.fromCharCode(lastColumnNumber + 64) + "" + lastRowNumber;
    return range;
  }

  /**
   * create sql statement for creating temporary table
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  createTable(mappedTable, temporary) {
    let sql = new SQLManager(mappedTable);
    //let temporary = true;
    let sqlStatement = sql.createTable(mappedTable, temporary);
    return sqlStatement;
  }

  /**
   * create sql statement for inserting values into temporary table
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  insertValuesToTemporaryTable(mappedTable) {
    let sql = new SQLManager(mappedTable);
    let temporary = true;
    let sqlStatement = "";
    for (let i = 1; i < mappedTable.sheetValues.length; i++) {
      sqlStatement += sql.insertValues(mappedTable, temporary, i);
    }
    return sqlStatement;
  }

  /**
   * create sql statement for inserting values into temporary table
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  mergeTableSQL(mappedTable) {
    let sql = new SQLManager(mappedTable);
    let sqlStatement = sql.mergeTableSQL(mappedTable);
    return sqlStatement;
  }

  /**
   * create sql statement for dropping temporary table
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  dropTable(mappedTable) {
    let sql = new SQLManager(mappedTable);
    let temporary = true;
    let sqlStatement = sql.dropTable(mappedTable, temporary);
    return sqlStatement;
  }
  /**
   * set synchronise time table into DB
   * @param {object} mappedTable
   * @param  {string} mode
   * @returns  {string} sqlStatement
   */
  setSynchroniseTimeTable(mappedTable, mode) {
    let sql = new SQLManager(mappedTable);
    let sqlStatement = sql.setSynchroniseTimeTable(mappedTable.name, mode);
    return sqlStatement;
  }

  /**
   * create sql statement to check if table exists then delete rows from database that no longer exists in GS
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  deleteNotExistRowsFromMSSQL(mappedTable) {
    let sql = new SQLManager(mappedTable);
    let sqlStatement = sql.deleteNotExistRowsFromMSSQL(mappedTable);
    return sqlStatement;
  }

  /**
   * create sql statement for selecting columns names of given table
   * based on mappedTable object
   * @param {object} mappedTable
   * @returns {string} sqlStatement
   */
  selectTableColumns(mappedTable) {
    let sql = new SQLManager(mappedTable);
    let temporary = false;
    let sqlStatement = sql.selectTableColumns(mappedTable, temporary);

    return sqlStatement;
  }

  /**
   * check table compatibility between sheet and dababase
   * if table missin - add
   * @param {object} mappedTable
   */
  checkTable(mappedTable) {
    return new Promise((resolve, reject) => {
      let sqlStatement = this.selectTableColumns(mappedTable);
      this.runQuery(sqlStatement).then((returnedValues) => {
        if (returnedValues.recordset.length > 0) {
          this.checkColumns(mappedTable, returnedValues)
            .then((result) => {
              resolve(result);
            })
            .catch((reject) => {
              console.log("checkColumns error: " + reject);
            });
        } else {
          let temporary = false;
          sqlStatement = this.createTable(mappedTable, temporary);
          this.runQuery(sqlStatement)
            .then((result) => {
              resolve(result);
            })
            .catch((reject) => {
              console.log("checkTable error: " + reject);
            });
        }
      });
    });
  }

  /**
   * check columns compatibility between sheet and database
   * if columns missing - add
   * @param {object} mappedTable
   * @param {object} returnedValues
   */
  checkColumns(mappedTable, returnedValues) {
    return new Promise((resolve, reject) => {
      let sql = new SQLManager(mappedTable);
      let sqlStatement = "";
      let sqlAddedColumns = "";

      mappedTable.columns.forEach((sheetColumns) => {
        let founded = false;
        returnedValues.recordset.forEach((mssqlRecord) => {
          if (!founded) {
            //if(mssqlRecord.column_name.indexOf(sheetColumns.sqlFieldName) >= 0){
            if (
              mssqlRecord.column_name.toUpperCase() ===
              sheetColumns.sqlFieldName.toUpperCase()
            ) {
              founded = true;
            }
          }
        });
        if (!founded) {
          sqlAddedColumns += sql.extendTable(sheetColumns);
        }
      });
      if (this.isNotEmpty(sqlAddedColumns)) {
        sqlAddedColumns = sqlAddedColumns.substring(
          0,
          sqlAddedColumns.length - 4
        );
        sqlStatement = `alter table ` + mappedTable.name + " ADD ";
        sqlStatement += sqlAddedColumns;
        this.runQuery(sqlStatement)
          .then((result) => {
            resolve(result);
          })
          .catch((reject) => {
            console.log("checkColumns error: " + reject);
          });
      } else resolve();
    });
  }

  /**
   *
   * @param {string} sqlStatement
   * @returns {string} sqlStatement
   */
  runQuery(sqlStatement) {
    return new Promise((resolve, reject) => {
      let mssql = new MSSQLManager();
      //mssql.close();
      //console.log(sqlStatement);
      mssql
        .runQuery(sqlStatement)
        .then((returnedValues) => {
          //console.log("json: "+JSON.stringify(returnedValues.recordset));
          resolve(returnedValues);
          mssql.close();
        })
        .catch((reject) => {
          console.log("inside runQuery error: " + reject);
        });
    });
  }

  /**
   * ask question what system need to do.
   */
  askUserQuestion(question) {
    return new Promise((resolve, reject) => {
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      /*let question = `Wypisz numer czynnosci jaka chcesz wykonac:
				1. Z aktualizowac mssql danymi z GS
				2. Z akutalizowac GS danymi z MSSQL
				`;	*/
      readline.question(question, (answer) => {
        console.log(`You choose: ` + answer);
        resolve(answer);
        //this.runChosenFunctionality(answer);
        //this.startMapping();
        readline.close();
      });
    });
  }

  /**
   *
   */
  chooseWhatToDo() {
    let question = `Choose activity:
			1. Update Database data from GS
			2. Update GS date from Database
			3. Update Database files list from google drive
			`;
    this.askUserQuestion(question).then((answer) => {
      if (String(answer) == "3")
        this.insertFilesListToDataBase(googleConfig.folderKey);
      else
        this.getSpreadsheetsListFromMigrationGS().then((list) => {
          this.runChosenFunctionality(answer);
          question =
            `Choose spreadsheet in which You want run action - If you want update all write "ALL": \n or '>2' or '<10' or '>2 and < 10' ` +
            list.descript;
          this.askUserQuestion(question).then((answer) => {
            console.log(answer);
            let listOfGS = [];
            if (answer.includes("<") || answer.includes(">"))
              listOfGS = this.getSheetListAccordingToCondition(answer, list);
            else listOfGS = answer.split(",");
            this.setChoosenGSForActivities(listOfGS);
            this.startMapping();
          });
        });
    });
  }

  /**
   * setting array of choosen GS for activities.
   * @param {array} listOfNumberGS
   */
  setChoosenGSForActivities(listOfNumberGS) {
    this.listOfNumberGS = listOfNumberGS;
  }

  /**
   * returning list of GS from menu accroding to given condition
   * @param {string} condition
   * @param {object} list
   * @returns {array} listOfGS
   */
  getSheetListAccordingToCondition(condition, list) {
    let listOfGS = [];

    for (let number of list.number) {
      if (
        condition.includes(">") &&
        condition.includes("<") &&
        condition.includes("and")
      ) {
        let conditionNumber = Number(
          condition.split("and")[0].replace(">", "")
        );
        let conditionNumber2 = Number(
          condition.split("and")[1].replace("<", "")
        );
        if (number > conditionNumber && number < conditionNumber2)
          listOfGS.push(String(number));
      } else if (condition.includes(">")) {
        let conditionNumber = Number(condition.replace(">", ""));
        if (number > conditionNumber) listOfGS.push(String(number));
      } else if (condition.includes("<")) {
        let conditionNumber = Number(condition.replace("<", ""));
        if (number < conditionNumber) listOfGS.push(String(number));
      }
    }
    return listOfGS;
  }

  /**
   * set type of action
   * @param {string} answer
   */
  runChosenFunctionality(answer) {
    switch (answer) {
      case "1":
        this.actionType = 1;
        break;
      case "2":
        this.actionType = 2;
        break;
      default:
        this.actionType = 0;
    }
  }

  /**
   * create sheet list for menu show
   * @param {object} spreadsheetList
   * @returns {object} list
   */
  spreadSheetListForMenuShow(spreadsheetList) {
    let list = {};
    list.descript = "\n";
    list.number = [];
    let counter = 0;
    for (let spreadsheet of spreadsheetList) {
      list.descript +=
        spreadsheet.spreadSheetNumber +
        ". " +
        spreadsheet.sheetName +
        " " +
        spreadsheet.mssqlTableName +
        " \n";
      list.number[counter] = spreadsheet.spreadSheetNumber;
      counter += 1;
    }
    return list;
  }

  /**
   * getting list of spreadsheet from migration GS
   * @return {Promise|string} list
   */
  getSpreadsheetsListFromMigrationGS() {
    return new Promise((resolve, reject) => {
      this.getMigration().then((migrationList) => {
        let list = this.spreadSheetListForMenuShow(
          migrationList.spreadsheetList
        );
        resolve(list);
      });
    });
  }
  /**
   * test? - raczej u usuniecia
   */
  getSorFormDB() {
    let querry = "select top 5 * from SoR_Mieszaniny_2019_PROD";
    this.runQuery(querry).then((result) => {
      //console.log(result.recordsets[0].columns);
      let listOfColumnsName = Object.getOwnPropertyNames(
        result.recordsets[0].columns
      );
      console.log("listOfColumnsName");
      console.log(listOfColumnsName);
      console.log("result");
      console.log(result);

      //console.log(Object.getOwnPropertyNames(result.recordsets[0].columns));
    });
  }

  /**
   * list all files from folder in given ID
   * @param {string} FolderId
   */
  listAllFilesFromFolderID(FolderId) {
    let gD = new gDrive();
    return new Promise((resolve, reject) => {
      driveConnection.authenticate().then((auth) => {
        gD.listAllFilesFromFolderId(auth, FolderId).then((files) => {
          resolve(files);
        });
      });
    });
  }

  /**
   * inserting list of files into mssql
   * @param {string} FolderId
   */
  insertFilesListToDataBase(FolderId) {
    return new Promise((resolve, reject) => {
      let gD = new gDrive();
      this.listAllFilesFromFolderID(FolderId).then((files) => {
        let table = gD.createTableObject();
        table = gD.fillTableObjectFormFilesList(files, table);
        let sqlStatement = "";
        let temporary = true;
        this.checkTable(table)
          .then((result) => {
            sqlStatement += this.createTable(table, temporary);
            sqlStatement += this.insertValuesToTemporaryTable(table);
            sqlStatement += this.mergeTableSQL(table);
            sqlStatement += this.dropTable(table);
            //sqlStatement += this.deleteNotExistRowsFromMSSQL(table) ;
            this.runQuery(sqlStatement)
              .then((result) => {
                resolve(result);
              })
              .catch((reject) => {
                console.log("runQuery error: " + reject);
              });
          })
          .catch((reject) => {
            console.log("checkTable error: " + reject);
          });
      });
    });
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
}

module.exports = Controller;
