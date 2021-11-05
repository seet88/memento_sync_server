class Mapper {
  /**
   * Create mapper.
   * @param {object} migration - GSReader migration.
   * @param {2DArray} sheetValues - sheet values.
   */

  constructor(migration, sheetValues) {
    this.migration = migration;
    this.sheetValues = sheetValues;
  }

  setSheetColumnsListNames(values) {
    this.sheetColumnsListNames = values[0];
  }

  /**
   * getting mapped array of columns objects and table name
   * @returns {object} table
   */
  getMappedTable() {
    this.setSheetColumnsListNames(this.sheetValues);
    let mapOfSheetColumns = this.makeMap();
    let table = {};
    mapOfSheetColumns.forEach((element) => {
      if (this.isNotEmpty(element.sqlTableName)) {
        table = {
          name: element.sqlTableName,
          columns: mapOfSheetColumns,
          sheetValues: this.sheetValues,
        };
        return table;
      }
    });
    return table;
  }

  /**
   * making map of sheet columns
   * @returns {array2d} mapOfSheetColumns
   */
  makeMap() {
    const mapOfSheetColumns = [];
    const sheetColumnsListNames = this.sheetColumnsListNames.map((x) => {
      return x.toLowerCase();
    });
    this.migration.values.forEach((element) => {
      const columnNumber = sheetColumnsListNames.indexOf(
        element[this.migration.columns.sheetFieldName.number].toLowerCase()
      );
      // console.log("element:"+element);
      if (columnNumber >= 0) {
        mapOfSheetColumns[columnNumber] = this.createTableObject(
          element,
          this.migration.columns
        );
      } else {
        console.log(
          "Warning! No column found: " +
            element[this.migration.columns.sheetFieldName.number]
        );
      }
    });
    return mapOfSheetColumns;
  }

  /**
   * Create table objects with sql columns name/type
   * @param {array} row
   * @param {object} columns
   * @returns {object} mappedColumns
   */
  createTableObject(row, columns) {
    const mappedColumns = {
      sqlFieldName: row[columns.mssqlFieldName.number],
      sqlFieldType: row[columns.typeField.number],
      sqlTableName: row[columns.mssqlTableName.number],
      sqlUniqueField: row[columns.mssqlUniqueField.number],
      sqlFieldLength: row[columns.mssqlFieldLength.number],
    };
    return mappedColumns;
  }

  /**
   * adding unique array to mssql/gs table witch is concatenate unique colums values
   * @param {object} mappedGSTable
   * @param {object} mssqlValues
   * @returns {object}
   */
  extendTable(mappedGSTable, mssqlValues) {
    const listOfColumnsName = Object.getOwnPropertyNames(
      mssqlValues.recordsets[0].columns
    );
    mappedGSTable.uniqueValue = [];
    mssqlValues.uniqueValue = [];
    for (let i = 0; i < mappedGSTable.columns.length; i++) {
      if (
        this.isNotEmpty(mappedGSTable.columns[i]) &&
        mappedGSTable.columns[i].sqlUniqueField == "tak"
      ) {
        const columnNumber = listOfColumnsName
          .map((v) => v.toLowerCase())
          .indexOf(mappedGSTable.columns[i].sqlFieldName.toLowerCase());
        if (columnNumber >= 0) {
          for (let j = 1; j < mappedGSTable.sheetValues.length; j++) {
            if (this.isNotEmpty(mappedGSTable.uniqueValue[j])) {
              mappedGSTable.uniqueValue[j] += this.prepareMssqlValue(
                mappedGSTable.sheetValues[j][i]
              );
            } else {
              mappedGSTable.uniqueValue[j] = this.prepareMssqlValue(
                mappedGSTable.sheetValues[j][i]
              );
            }
          }
          // msql
          console.log("have unique column");
          for (let j = 0; j < mssqlValues.recordset.length; j++) {
            const columnName = this.getmssqlColumnName(
              listOfColumnsName,
              mappedGSTable.columns[i].sqlFieldName
            );
            if (this.isNotEmpty(mssqlValues.uniqueValue[j])) {
              mssqlValues.uniqueValue[j] += this.prepareMssqlValue(
                mssqlValues.recordset[j][columnName]
              );
            } else {
              mssqlValues.uniqueValue[j] = this.prepareMssqlValue(
                mssqlValues.recordset[j][columnName]
              );
            }
          }
        }
      }
    }
    const mappedValues = new Object();
    mappedValues.mappedGSTable = mappedGSTable;
    mappedValues.mssqlValues = mssqlValues;
    //console.log(mssqlValues.recordsets);
    return mappedValues;
  }

  /**
   * getting column name from mssql object
   * @param {string array} listOfColumnsName
   * @param {string} columnName
   * @returns {string}
   */
  getmssqlColumnName(listOfColumnsName, columnName) {
    const columnIndex = listOfColumnsName
      .map((v) => v.toLowerCase())
      .indexOf(columnName.toLowerCase());
    return listOfColumnsName[columnIndex];
  }

  /**
   * preparing value form mssql
   * @param {string|date|number} value
   * @returns {string|date|number}
   */
  prepareMssqlValue(value) {
    if (value == null) {
      return "";
    } else if (value == undefined) {
      return "";
    } else {
      return value;
    }
  }

  /**
   * Mapping mssl values to GS values
   * @param {*} mappedGSTable
   * @param {*} mssqlValues
   * @returns {object} mappedGSTable
   */
  mapMSSQLToGS(mappedGSTable, mssqlValues) {
    const mappedValues = this.extendTable(mappedGSTable, mssqlValues);
    mappedGSTable = mappedValues.mappedGSTable;
    mssqlValues = mappedValues.mssqlValues;
    mappedGSTable.updatedRows = [];
    mappedGSTable.isChanged = false;
    let originalSheetValuesSize = mappedGSTable.sheetValues.length;
    let columnNumber = -1;
    let listOfColumnsName = Object.getOwnPropertyNames(
      mssqlValues.recordsets[0].columns
    );
    for (let i = 0; i < mappedGSTable.columns.length; i++) {
      let addedRows = originalSheetValuesSize;
      if (this.isNotEmpty(mappedGSTable.columns[i])) {
        columnNumber = listOfColumnsName
          .map((v) => v.toLowerCase())
          .indexOf(mappedGSTable.columns[i].sqlFieldName.toLowerCase());
      } else {
        columnNumber = -1;
      }
      if (columnNumber >= 0) {
        // console.log(columnNumber);
        for (let j = 1; j <= mssqlValues.recordset.length; j++) {
          const rowNumber = mappedGSTable.uniqueValue.indexOf(
            String(mssqlValues.uniqueValue[j - 1])
          );
          const columnName = this.getmssqlColumnName(
            listOfColumnsName,
            mappedGSTable.columns[i].sqlFieldName
          );
          if (rowNumber >= 0) {
            // updating finded row in GS from MSSQL
            // console.log( mappedGSTable.sheetValues[rowNumber][i]+' <vs>:'+mssqlValues.recordset[j-1][mappedGSTable.columns[i].sqlFieldName]);
            const mssqlPreparedValue = this.prepareValue(
              mappedGSTable.columns[i].sqlFieldType,
              mssqlValues.recordset[j - 1][columnName],
              mappedGSTable.columns[i].sqlFieldLength
            );
            if (
              this.checkIfValuesChanged(
                mappedGSTable.sheetValues[rowNumber][i],
                mssqlPreparedValue,
                mappedGSTable.columns[i].sqlFieldType
              )
            ) {
              mappedGSTable.isChanged = true;
            }
            mappedGSTable.sheetValues[rowNumber][i] = mssqlPreparedValue;
            mappedGSTable.updatedRows[rowNumber] = true;
          } else {
            // adding row from MSSQL to GS
            if (!this.isNotEmpty(mappedGSTable.sheetValues[addedRows])) {
              mappedGSTable.sheetValues.push([]);
            }
            mappedGSTable.sheetValues[addedRows][i] = this.prepareValue(
              mappedGSTable.columns[i].sqlFieldType,
              mssqlValues.recordset[j - 1][columnName],
              mappedGSTable.columns[i].sqlFieldLength
            );
            mappedGSTable.updatedRows[addedRows] = true;
            mappedGSTable.isChanged = true;
            addedRows += 1;
          }
        }
      }
    }
    console.log("Is changed" + mappedGSTable.isChanged);
    return mappedGSTable;
  }

  /**
   * checking if GS value is diferent to sql
   * @param {string|number|date} GSValue
   * @param {string|number|date} mssqlValue
   * @param {string} fieldType
   * @returns {boolean}
   */
  checkIfValuesChanged(GSValue, mssqlValue, fieldType) {
    if (this.prepareMssqlValue(GSValue) != this.prepareMssqlValue(mssqlValue)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * prepare value from SQL for inserting to GS ;
   * @param {string} fieldType
   * @param {string|number|date} value
   * @returns {string|number|date}
   */
  prepareValue(fieldType, value, StringMaxLength) {
    if (value == null) {
      return "";
    }
    switch (fieldType) {
      case "float":
        return this.prepareSQLNumericToGS(value);
      case "int":
        return this.prepareSQLNumericToGS(value);
      case "bigint":
        return this.prepareSQLNumericToGS(value);
      case "date":
        return this.prepareSQLDateToGS(value);
      case "datetime":
        return this.prepareSQLDateTimeToGS(value);
      default:
        return this.prepareSQLStringToGS(value, StringMaxLength);
    }
  }

  /**
   * prepare string to sql
   * @param {string} value
   * @return {string} value
   */
  prepareSQLStringToGS(value, StringMaxLength) {
    if (value == undefined) {
      return "";
    } else {
      return value;
    }
  }

  /**
   * remove special symbol from value.
   * @param {string} value
   * @returns {string|numeric} value
   */
  clearValueFromSpecialSymbol(value) {
    value = String(value).replace("%", "");
    value = String(value).replace("#", "");
    value = String(value).replace("$", "");
    value = String(value).replace("!", "");
    value = String(value).replace("@", "");
    value = String(value).replace(" ", "");

    return value;
  }

  /**
   * prepare numeric to sql
   * @param {string|date} value
   * @return {string|numeric} value
   */
  prepareSQLNumericToGS(value) {
    value = this.prepareSQLStringToGS(value, 99999);
    value = this.clearValueFromSpecialSymbol(value);
    value = String(value).replace(".", ",");
    return value;
  }

  /**
   * prepare SQL date to GS
   * @param {string|date} value
   * @return {string|date} value
   */
  prepareSQLDateToGS(value) {
    if (this.isNotEmpty(value)) {
      let returnedValue;
      if (typeof value === "object" && value !== null) {
        returnedValue = value.toJSON();
      } else {
        returnedValue = value;
      }
      returnedValue = String(returnedValue).replace("T", " ");
      returnedValue = returnedValue.replace(".000Z", "");
      let day = returnedValue.substring(8, 10);
      let month = returnedValue.substring(5, 7);
      let year = returnedValue.substring(0, 4);
      returnedValue = day + "." + month + "." + year;
      if (this.isDate(returnedValue)) {
        return returnedValue;
      } else {
        return returnedValue;
      }
    } else {
      return "";
    }
  }

  /**
   * prepare SQL dateTime to GS
   * @param {string|datetime} value
   * @return {string|datetime} value
   */
  prepareSQLDateTimeToGS(value) {
    if (this.isNotEmpty(value)) {
      let returnedValue;
      if (typeof value === "object" && value !== null) {
        returnedValue = value.toJSON();
      } else {
        returnedValue = value;
      }
      returnedValue = String(returnedValue).replace("T", " ");
      returnedValue = returnedValue.replace(".000Z", "");
      let day = returnedValue.substring(8, 10);
      let month = returnedValue.substring(5, 7);
      let year = returnedValue.substring(0, 4);
      let hours = returnedValue.substring(11, 19);
      returnedValue = day + "." + month + "." + year + " " + hours;

      if (this.isDate(returnedValue)) {
        return returnedValue;
      } else {
        return returnedValue;
      }
    } else {
      return "";
    }
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
   * check if string is valid date
   * @param {string} string
   * @returns {boolean}
   */
  isDate(date) {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  }

  /**
   * check if string is valid number
   * @param {string} string
   * @returns {boolean}
   */
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}

module.exports = Mapper;
