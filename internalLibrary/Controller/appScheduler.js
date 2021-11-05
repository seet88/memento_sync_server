const Controller = require("../Controller/controller");

class AppScheduler {
  initController() {
    let controller = new Controller();
    return controller;
  }

  /**
   * update database products from Google sheets
   *
   * @param {object} controller
   */
  updateSNNTableInMSQQLFromGS(controller) {
    return new Promise((resolve, reject) => {
      controller.actionType = 1;
      controller.listOfNumberGS = ["27"];
      controller.startMapping().then((res) => {
        console.log("updateSNNTableInMSQQLFromGS");
        resolve(res);
      });
    });
  }

  /**
   * calculate SNN columns in database
   * @param {object} controller
   */
  calculateSNNColumnsInMSSQL(controller) {
    return new Promise((resolve, reject) => {
      let sqlStatement = "exec p_naliczanie_produktow_zabiegow";
      controller.runQuery(sqlStatement).then((result) => {
        console.log("calculateSNNColumnsInMSSQL");
        resolve(result);
      });
    });
  }

  /**
   * update sheets products from MSSQL
   *
   * @param {object} controller
   */
  updateSNNSheetsFromMSSQL(controller) {
    return new Promise((resolve, reject) => {
      controller.actionType = 2;
      controller.listOfNumberGS = ["27"];
      controller.startMapping().then((res) => {
        console.log("updateSNNSheetsFromMSSQL");
        resolve(res);
      });
    });
  }

  /**
   * synchonise SNN columns between database and sheets
   */
  synchroniseSNN_GSandMSSQL() {
    return new Promise((resolve, reject) => {
      let controller = this.initController();
      this.updateSNNTableInMSQQLFromGS(controller).then((res) => {
        this.calculateSNNColumnsInMSSQL(controller).then((res2) => {
          this.updateSNNSheetsFromMSSQL(controller).then((res3) => {
            resolve();
          });
        });
      });
    });
  }
}
module.exports = AppScheduler;
