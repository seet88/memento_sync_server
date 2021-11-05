class SQLManager {
  /**
   * create SQL Manager
   * @param {object} table
   */
  constructor(table) {
    this.table = table;
  }

  /**
   * Create SQL Statement for create table.
   * @param {object} table
   * @param {boolean} temporary
   * @returns {string} sqlStatement
   */
  createTable(table, temporary) {
    let sqlStatement = "CREATE TABLE ";
    if (temporary) sqlStatement += "#";
    sqlStatement += table.name;
    sqlStatement += " ( ";
    let sqlColumns = " ";
    let newLine = `
		`;
    table.columns.forEach((row) => {
      sqlColumns += row.sqlFieldName + " ";
      if (row.sqlFieldType.includes("varchar"))
        sqlColumns +=
          row.sqlFieldType + " COLLATE  Polish_100_CI_AS, " + newLine;
      else sqlColumns += row.sqlFieldType + ", " + newLine;
    });
    sqlStatement += sqlColumns;
    sqlStatement += " ) ";

    return sqlStatement;
  }

  /**
   * create sql statement with inserting rows value
   * @param {object} table
   * @param {bolean} temporary
   * @param {integer} numberOfRow
   */
  insertValues(table, temporary, numberOfRow) {
    let sqlStatement = "INSERT INTO ";
    if (temporary) sqlStatement += "#";
    sqlStatement += table.name;
    let sqlColumns = " ( ";
    let sqlValues = " VALUES ( ";
    let newLine = `
		`;
    for (let i = 0; i < table.columns.length; i++) {
      if (this.isNotEmpty(table.columns[i])) {
        sqlColumns += table.columns[i].sqlFieldName + ", ";
        sqlValues += this.prepareValue(
          table.columns[i].sqlFieldType,
          table.sheetValues[numberOfRow][i],
          table.columns[i].sqlFieldLength
        );
        sqlValues += ", ";
        if (
          table.columns[i].sqlUniqueField == "tak" &&
          !this.isNotEmpty(table.sheetValues[numberOfRow][i])
        )
          return "";
      }
    }
    sqlColumns = sqlColumns.substring(0, sqlColumns.length - 2);
    sqlValues = sqlValues.substring(0, sqlValues.length - 2);
    sqlColumns += " ) ";
    sqlValues += " ); ";
    sqlStatement += sqlColumns;
    sqlStatement += sqlValues;
    sqlStatement += newLine;
    return sqlStatement;
  }

  /**
   * create sqlStatement - extend table with given column
   * @param {object} column
   * @returns {string} sqlStatement
   */
  extendTable(column) {
    let newLine = `
		`;
    let sqlStatement =
      column.sqlFieldName + " " + column.sqlFieldType + "," + newLine;
    return sqlStatement;
  }

  /**
   * prepare value for inserting to database via insert statement;
   * @param {string} fieldType
   * @param {string|number|date} value
   * @returns {string|number|date}
   */
  prepareValue(fieldType, value, StringMaxLength) {
    switch (fieldType) {
      case "float":
        return this.prepareNumericToSQL(value);
      case "int":
        return this.prepareNumericToSQL(value);
      case "bigint":
        return this.prepareNumericToSQL(value);
      case "date":
        return this.prepareDateToSQL(value);
      case "datetime":
        return this.prepareDateTimeToSQL(value);
      default:
        return this.prepareStringToSQL(value, StringMaxLength);
    }
  }

  /**
   * prepare string to sql
   * @param {string} value
   * @return {string} value
   */
  prepareStringToSQL(value, StringMaxLength) {
    if (this.isNotEmpty(value)) {
      if (value.length > StringMaxLength) {
        console.log("Too long values: " + value);
        return `'` + String(value).substring(0, StringMaxLength - 1) + `'`;
      } else return `'` + value + `'`;
    } else return `''`;
  }

  /**
   * remove special symbol from value.
   * @param {string} value
   * @returns {string|numeric} value
   */
  clearValueFromSpecialSymbol(value) {
    value = value.replace("%", "");
    value = value.replace("#", "");
    value = value.replace("$", "");
    value = value.replace("!", "");
    value = value.replace("@", "");
    value = value.replace(" ", "");

    return value;
  }

  /**
   * prepare numeric to sql
   * @param {string|date} value
   * @return {string|numeric} value
   */
  prepareNumericToSQL(value) {
    if (this.isNotEmpty(value)) {
      if (this.isNumeric(value)) return value;
      value = String(value).replace(",", ".");
      if (this.isNumeric(value)) return value;
      else {
        value = this.clearValueFromSpecialSymbol(value);
        if (this.isNumeric(value)) return value;
        else return "null";
      }
    } else return "null";
  }

  /**
   * prepare date to sql
   * @param {string|date} value
   * @return {string|date} value
   */
  prepareDateToSQL(value) {
    if (value instanceof Date) {
      const diffInMinutes = 240;
      const shiftedDate = new Date(value.getTime() + diffInMinutes * 60000);
      return `'${shiftedDate.toISOString().slice(0, 10)}'`;
    }
    if (this.isNotEmpty(value)) {
      let year = String(value).substring(6, 10);
      if (year.replace(".", "-").includes("-")) {
        return `'` + value + `'`;
      }
      let day = String(value).substring(0, 2);
      let month = String(value).substring(3, 5);
      value = `'` + year + "-" + month + "-" + day + `'`;
      if (this.isDate(value)) return value;
      else return "null";
    } else return "null";
  }

  /**
   * prepare dateTime to sql
   * @param {string|datetime} value
   * @return {string|datetime} value
   */
  prepareDateTimeToSQL(value) {
    if (value instanceof Date) return JSON.stringify(value).replace(/"/g, `'`);
    if (this.isNotEmpty(value)) {
      let year = String(value).substring(6, 10);
      if (year.replace(".", "-").includes("-")) {
        return `'` + value + `'`;
      }
      let day = String(value).substring(0, 2);
      let month = String(value).substring(3, 5);
      let hours = String(value).substring(11);
      value = year + "-" + month + "-" + day + " " + hours;
      if (this.isDate(value)) {
        value = `'` + value + `'`;
        return value;
      } else return "null";
    } else return "null";
  }

  /**
   * create sql statement drop table
   * @param {object} table
   * @param {boolean} temporary
   * @returns {string} sqlStatement
   */
  dropTable(table, temporary) {
    let sqlStatement = "DROP TABLE ";
    let newLine = `
		`;
    if (temporary) sqlStatement += "#";
    sqlStatement += table.name + newLine;
    return sqlStatement;
  }
  /**
   * set synchronise time table into DB
   * @param  {string} tableName
   * @param  {string} mode
   * @returns {string} sqlStatement
   */
  setSynchroniseTimeTable(tableName, mode) {
    let sqlStatement =
      `
			INSERT INTO [dbo].[SynchronizacjeGoogleSheets]
				   ([nazwa_tabeli]
				   ,[data_synchronizacji]
				   ,[typ])
			 VALUES
				   ('` +
      tableName +
      `'
				   ,getdate()
				   ,'` +
      mode +
      `')`;
    return sqlStatement;
  }

  /**
   * create sql statement to check if table exists then delete rows from database that no longer exists in GS
   * @param {object} table
   * @returns {string} sqlStatement
   */
  deleteNotExistRowsFromMSSQL(table) {
    let newLine = `
		`;
    let historyTabelName = table.name + "_History";
    let sqlStatement =
      `
			WAITFOR DELAY '00:00:02';
			IF (EXISTS (SELECT * 
			FROM INFORMATION_SCHEMA.TABLES 
			WHERE TABLE_SCHEMA = 'dbo' 
			AND  TABLE_NAME = '` +
      historyTabelName +
      `'))
			BEGIN` +
      newLine;
    sqlStatement += " delete from ";
    sqlStatement += table.name;
    sqlStatement += " where ref not in ( " + newLine;
    sqlStatement += " select  ref " + newLine;
    sqlStatement += " from " + historyTabelName + newLine;
    sqlStatement +=
      " where sysendtime > dateadd(MINUTE,-122,getdate()) " + newLine;
    sqlStatement +=
      " ) and ref in (select ref from " + historyTabelName + ")" + newLine;
    sqlStatement += " END " + newLine;
    //console.log(sqlStatement);
    return sqlStatement;
  }

  /**
   * create sql statement merge temporary table with original
   * @param {object} table
   * @returns {string} sqlStatement
   */
  mergeTableSQL(table) {
    let sqlStatement = "MERGE ";
    let newLine = `
		`;
    let mergeAlias = " m.";
    let usingAlias = " u.";
    sqlStatement += table.name + " AS " + mergeAlias.replace(".", "") + newLine;
    sqlStatement += "USING (SELECT ";
    let sqlColumns = "";
    let sqlMergeColumns = "";
    let sqlUsingColumns = "";
    let sqlUniqueField = "";
    let sqlUpdateColumns = "";
    table.columns.forEach((row) => {
      sqlColumns += row.sqlFieldName + ", ";
      sqlMergeColumns += mergeAlias + row.sqlFieldName + ", ";
      sqlUsingColumns += usingAlias + row.sqlFieldName + ", ";
      sqlUpdateColumns +=
        mergeAlias +
        row.sqlFieldName +
        " = " +
        usingAlias +
        row.sqlFieldName +
        ", ";
      if (row.sqlUniqueField == "tak") {
        sqlUniqueField +=
          mergeAlias +
          row.sqlFieldName +
          " = " +
          usingAlias +
          row.sqlFieldName +
          " and ";
      }
    });
    sqlColumns = sqlColumns.substring(0, sqlColumns.length - 2);
    sqlMergeColumns = sqlMergeColumns.substring(0, sqlMergeColumns.length - 2);
    sqlUsingColumns = sqlUsingColumns.substring(0, sqlUsingColumns.length - 2);
    sqlUniqueField = sqlUniqueField.substring(0, sqlUniqueField.length - 5);
    sqlUpdateColumns = sqlUpdateColumns.substring(
      0,
      sqlUpdateColumns.length - 2
    );
    sqlStatement += sqlColumns;
    sqlStatement +=
      " FROM #" + table.name + ") AS " + usingAlias.replace(".", "") + newLine;
    sqlStatement += " ON " + sqlUniqueField + newLine;
    sqlStatement +=
      " WHEN MATCHED THEN UPDATE SET " + sqlUpdateColumns + newLine;
    sqlStatement += " WHEN NOT MATCHED by target THEN INSERT( " + sqlColumns;
    sqlStatement +=
      " )" + newLine + " VALUES ( " + sqlUsingColumns + " )" + newLine;
    sqlStatement += " WHEN NOT MATCHED BY SOURCE THEN DELETE ;";
    sqlStatement += newLine;
    return sqlStatement;
  }

  /**
   * create sql statement selecting columns names of given table
   * @param {object} table
   * @returns {string} sqlStatement
   */
  selectTableColumns(table, temporary) {
    let sqlStatement = `SELECT column_name 
			FROM INFORMATION_SCHEMA.COLUMNS 
			WHERE TABLE_SCHEMA = 'dbo' 
			AND  TABLE_NAME = '`;
    if (temporary) sqlStatement += "#";
    sqlStatement += table.name;
    sqlStatement += `';`;

    return sqlStatement;
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

  async prepareInsertStatementFromMementoData(data, runQuery) {
    let multipleStatements = "";
    for await (const row of data) {
      let stm = ` INSERT INTO ${row[0].tableName} `;
      let columnStatement = " ( ";
      let valueStatement = " VALUES ( ";
      for (const col of row) {
        columnStatement += col.name + ", ";
        valueStatement +=
          this.prepareValue(col.type, col.value, col.size) + ", ";
      }
      columnStatement = columnStatement.slice(0, -2);
      columnStatement += " ) ";
      valueStatement = valueStatement.slice(0, -2);
      valueStatement += " ) ";
      stm += columnStatement + valueStatement;
      multipleStatements += stm;
      console.log(stm);
      //   await runQuery(stm);
    }
    await runQuery(multipleStatements);
  }

  async prepareUpdateStatementFromMementoData(data, runQuery) {
    let multipleStatements = "";
    for await (const row of data) {
      let stm = ` UPDATE ${row.tableName} set `;
      let columnStatement = "";
      let valueStatement = "";
      for (const col of row.columns) {
        columnStatement = col.name + " = ";
        valueStatement =
          this.prepareValue(col.type, col.value, col.size) + ", ";
        stm += columnStatement + valueStatement;
      }
      stm = stm.slice(0, -2);
      stm += ` where ref = ${row.ref} `;
      multipleStatements += stm;
      console.log(stm);
      //   await runQuery(stm);
    }
    await runQuery(multipleStatements);
  }

  getDeletedRowsOfTable(tableName) {
    const stm = ` select * from  deleted_items_in_tables 
    where tableName = '${tableName}' `;
    return stm;
  }

  getLastSynchroniseUserTableTimeStm(tableName, userName) {
    const stm = ` select last_synchronise from user_table_synchronise
     where table_name = '${tableName}' and user_name = '${userName}' `;
    return stm;
  }

  getSQLStatementForTableDate(tableName, sqlColumnsUniqueName) {
    return `select *,  ${sqlColumnsUniqueName}, SysStartTime  from ${tableName}`;
  }

  getDeleteStatementFromMementoData(tableSQLName, rows) {
    let multiStm = "";
    for (const row of rows)
      multiStm += ` delete from ${tableSQLName} where ref = ${row.ref} `;
    return multiStm;
  }

  getInsertStatementForDeletedItems(tableSQLName, userName, rows) {
    let multiStm = "";

    for (const row of rows)
      multiStm += ` insert into deleted_items_in_tables 
      (tableName, rowRef, rowUniqueKey, 
        deletedDatetime, deletedByUser)         
      values ( '${tableSQLName}', ${row.ref}, '${row.uniqueName}',
        getdate(), '${userName}' )        
      `;

    return multiStm;
  }

  getSynchroniseTimeStatement(tableName, userName) {
    const stm = `exec setSynchroniseForUserAndTable '${userName}','${tableName}' `;
    return stm;
  }

  getInsertStatementFromMementoData(dataRows, tableName) {
    let multipleStatements = "";
    for (const row of dataRows) {
      let stm = ` INSERT INTO ${tableName} `;
      let columnStatement = " ( ";
      let valueStatement = " VALUES ( ";
      for (const col of row.fields) {
        columnStatement += col.name + ", ";
        valueStatement +=
          this.prepareValue(col.type, col.value, col.size) + ", ";
      }
      columnStatement = columnStatement.slice(0, -2);
      columnStatement += " ) ";
      valueStatement = valueStatement.slice(0, -2);
      valueStatement += " ) ";
      stm += columnStatement + valueStatement;
      multipleStatements += stm;
    }
    return multipleStatements;
  }

  getUpdateStatementFromMementoData(dataRows, tableName) {
    let multipleStatements = "";
    for (const row of dataRows) {
      let stm = ` UPDATE ${tableName} set `;
      let columnStatement = "";
      let valueStatement = "";
      for (const col of row.fields) {
        columnStatement = col.name + " = ";
        valueStatement =
          this.prepareValue(col.type, col.value, col.size) + ", ";
        stm += columnStatement + valueStatement;
      }
      stm = stm.slice(0, -2);
      stm += ` where ref = ${row.ref} `;
      multipleStatements += stm;
    }
    return multipleStatements;
  }
}

module.exports = SQLManager;
