const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "../configuration/google/token.json";

/**
 * Class representing Authentication of google by token
 */
class Authentication {
  /**
   * Authorize user request by credentials
   * @param {json} credentials
   */
  authenticate(credentials) {
    return new Promise((resolve, reject) => {
      let credentials = this.getClientSecret();
      let authorizePromise = this.authorize(credentials);
      authorizePromise.then(resolve, reject);
    });
  }

  /**
   * Get user credentials
   * @returns {json} credentials
   */
  getClientSecret() {
    return require("../../configuration/google/credentials.json");
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    return new Promise((resolve, reject) => {
      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      });
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
      });
      console.log("Authorize this app by visiting this url:", authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err)
            return console.error(
              "Error while trying to retrieve access token",
              err
            );
          oAuth2Client.setCredentials(token);
          storeToken(token);
          resolve(oAuth2Client);
        });
      });
    });
  }
  /**
   * store token into file
   * @param {object} token
   */
  storeToken(token) {
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log("Token stored to", TOKEN_PATH);
  }
}

module.exports = new Authentication();
