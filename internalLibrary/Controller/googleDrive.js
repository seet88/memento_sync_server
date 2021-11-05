const driveConnection = require("../Connection/driveConnections.js");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

class GDrive {
  /**
   * Returns list of fiels in given folder ID
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   * @param {string} folderId
   * @returns {ArrayofObjects} fileListObjects
   */
  listFilesFromFolderId(auth, folderId) {
    return new Promise((resolve, reject) => {
      const drive = google.drive({ version: "v3", auth });
      drive.files.list(
        {
          pageSize: 1000,
          fields:
            "nextPageToken, files(contentHints/thumbnail,fileExtension,iconLink,id,name,size,thumbnailLink,webContentLink,webViewLink,mimeType,parents)",
          q: ` '` + folderId + `' in parents `,
        },
        (err, res) => {
          if (err) reject(err);
          const files = res.data.files;
          if (files.length) {
            //console.log('Files:');
            files.map((file) => {
              //console.log(`${file.name} (${file.id})  (${file.fileExtension}) `);
            });
            resolve(files);
          } else {
            console.log("No files found.");
          }
        }
      );
    });
  }

  /**
   * listing all files in folder
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   * @param {string} folderId
   * @returns {ArrayofObjects} fileListObjects
   */
  async asyncListAllFilesFromFolderId(auth, folderId) {
    let listOfFiles = [];
    let files = await this.listFilesFromFolderId(auth, folderId);
    for (const file of files) {
      if (!this.isNotEmpty(file.fileExtension)) {
        let filesDept = await this.listFilesFromFolderId(auth, file.id);
        Array.prototype.push.apply(listOfFiles, filesDept);
      } else listOfFiles.push(file);
    }
    //console.log(files);
    return listOfFiles;
  }

  /**
   * listing all files in folder
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   * @param {string} folderId
   * @returns {ArrayofObjects} fileListObjects
   */
  listAllFilesFromFolderId(auth, folderId) {
    return new Promise((resolve, reject) => {
      resolve(this.asyncListAllFilesFromFolderId(auth, folderId));
    });
  }

  /**
   * fill table object with files value
   * @param {object} table
   * @param {listOfObjects} files
   * @return {object} table
   */
  fillTableObjectFormFilesList(files, table) {
    for (let file of files) {
      let column = [];
      column.push(file.id);
      column.push(file.name);
      column.push(file.parents);
      column.push(file.webViewLink);
      column.push(file.fileExtension);
      column.push(file.size);
      table.sheetValues.push(column);
    }
    return table;
  }

  /**
   * create object table with columns name
   * @return {object} table
   */
  createTableObject() {
    let table = {};
    table.name = "RaportImages";
    table.columns = [];
    table.sheetValues = [];
    table.columns.push({
      sqlFieldName: "Id",
      sqlFieldType: "varchar(500)",
      sqlTableName: "Id",
      sqlUniqueField: "tak",
      sqlFieldLength: "500",
    });
    table.columns.push({
      sqlFieldName: "Name",
      sqlFieldType: "varchar(2000)",
      sqlTableName: "Name",
      sqlUniqueField: "",
      sqlFieldLength: "2000",
    });
    table.columns.push({
      sqlFieldName: "Parents",
      sqlFieldType: "varchar(500)",
      sqlTableName: "Parents",
      sqlUniqueField: "",
      sqlFieldLength: "500",
    });
    table.columns.push({
      sqlFieldName: "WebViewLink",
      sqlFieldType: "varchar(5000)",
      sqlTableName: "WebViewLink",
      sqlUniqueField: "",
      sqlFieldLength: "5000",
    });
    table.columns.push({
      sqlFieldName: "FileExtension",
      sqlFieldType: "varchar(50)",
      sqlTableName: "FileExtension",
      sqlUniqueField: "",
      sqlFieldLength: "50",
    });
    table.columns.push({
      sqlFieldName: "Size",
      sqlFieldType: "int",
      sqlTableName: "Size",
      sqlUniqueField: "",
      sqlFieldLength: "",
    });

    return table;
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
module.exports = GDrive;
