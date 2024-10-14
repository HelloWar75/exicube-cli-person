#!/usr/bin/env node
const fs = require("fs-extra");
const client = require("firebase-tools");
const fetch = require("node-fetch");
const open = require("open");
var CryptoJS = require("crypto-js");
var parser = require("xml2json");
const argument = process.argv.slice(2)[0];

// FINALIZADA
module.exports.validateProject = async project_id => {

  return new Promise(function (resolver_out) {
    try {
      // RESPOSTA GERADA
      const response = {
        success: true
      };
      resolver_out(response);
    } catch (error) {
      const response = {
        success: true
      };
      resolver_out(response);
    }
  });

  // REMOVAÇÃO DE VALIDADOR
      // fetch("https://us-central1-simplehttpfunctions.cloudfunctions.net/reqcon?projectId=" + project_id).then(response => response.json()).then(json_response => {
      //   if (json_response.success) {
      //     const response = {
      //       success: true
      //     };
      //     resolver_out(response);
      //   } else {
      //     const response = {
      //       success: false
      //     };
      //     resolver_out(response);
      //   }
      // })["catch"](error => {
      //   const response = {
      //     success: true
      //   };
      //   resolver_out(response);
      // });

};

// FINALIZADA
function writeFile(file, str_data) {

  // FUNÇÃO LOCK
  // const _0x5ae9cc = function () {
  //   let _0x583196 = true;
  //   return function (_0x570162, _0x4de27b) {
  //     const _0x5a8d28 = _0x583196 ? function () {
  //       if (_0x4de27b) {
  //         const _0x578438 = _0x4de27b.apply(_0x570162, arguments);
  //         _0x4de27b = null;
  //         return _0x578438;
  //       }
  //     } : function () { };
  //     _0x583196 = false;
  //     return _0x5a8d28;
  //   };
  // }();

  // const _0x40b451 = _0x5ae9cc(this, function () {
  //   return _0x40b451.toString().search("(((.+)+)+)+$").toString().constructor(_0x40b451).search("(((.+)+)+)+$");
  // });
  // _0x40b451();

  fs.outputFile(file, str_data, "utf8", function (func_callback) {
    if (func_callback) {
      return console.log(func_callback);
    }
    console.log(file + " Updated");
  });

}

// FINALIZADA
function writeConfigFile(platform_type, firebaseProjectId_var, app_id) {
  const apps_cwd_dir = process.cwd();
  if (platform_type === "web") {

    const config_project_id = {
      project: firebaseProjectId_var
    };

    client.apps.sdkconfig(platform_type, app_id, config_project_id).then(response => {
      const mobile_firebase_config_file = apps_cwd_dir + "/mobile-app/config/FirebaseConfig.js";
      const webapp_firebase_config_file = apps_cwd_dir + "/web-app/src/config/FirebaseConfig.js";
      const json_firebase_config_data = JSON.stringify(response.sdkConfig, null, "\t");
      const mobile_firebase_config = "module.exports.FirebaseConfig = " + json_firebase_config_data + ';';
      const webapp_firebase_config = "export const FirebaseConfig = " + json_firebase_config_data + ';';
      writeFile(mobile_firebase_config_file, mobile_firebase_config);
      writeFile(webapp_firebase_config_file, webapp_firebase_config);
    })["catch"](error => {
      console.log(error);
    });

  } else {
    const config_project_id = {
      project: firebaseProjectId_var
    };
    client.apps.sdkconfig(platform_type, app_id, config_project_id).then(response => {
      writeFile(apps_cwd_dir + "/mobile-app/" + response.fileName, response.fileContents);
      if (platform_type == "android") {
        const oauth_client_config = JSON.parse(response.fileContents).client[0].oauth_client;
        const other_oauth_client_config = JSON.parse(response.fileContents).client[0].services.appinvite_service.other_platform_oauth_client;
        let mobile_oauth_client_id = '';
        let oauth_client_id = '';
        let mobile_android_oauth_client_id = '';
        for (let x = 0; x < oauth_client_config.length; x++) {
          if (oauth_client_config[x].client_type == 1) {
            oauth_client_id = oauth_client_config[x].client_id;
            break;
          }
        }
        for (let y = 0; y < other_oauth_client_config.length; y++) {
          if (other_oauth_client_config[y].client_type == 2) {
            mobile_oauth_client_id = other_oauth_client_config[y].client_id;
          }
          if (other_oauth_client_config[y].client_type == 3) {
            mobile_android_oauth_client_id = other_oauth_client_config[y].client_id;
          }
        }
        writeFile(apps_cwd_dir + "/mobile-app/config/ClientIds.js", "module.exports.ClientIds = {\n    iosClientId: \"" + mobile_oauth_client_id + "\",\n    androidClientId: \"" + oauth_client_id + "\",\n    webClientId: \"" + mobile_android_oauth_client_id + "\"\n}");
        writeFile(apps_cwd_dir + "/web-app/src/config/ClientIds.js", "export const webClientId = '" + mobile_android_oauth_client_id + "'");
      }
    })["catch"](error => {
      console.log(error);
    });
  }
}

// FINALIZADA
if (argument == "install") {
  const appcat = require("../functions/appcat");
  const workDir = process.cwd();
  const config = JSON.parse(fs.readFileSync(workDir + "/functions/config.json", "utf8"));
  const app_data = {
    appcat: appcat,
    projectId: config.firebaseProjectId,
    app_name: config.app_name,
    app_identifier: config.app_identifier,
    app_admin: config.admin_email,
    license: config.purchase_code
  };

  const cripto_access_key = CryptoJS.AES.encrypt(config.purchase_code, "c5moP9246_6D1[VQ").toString();
  writeFile(workDir + "/common/src/other/AccessKey.js", "export default \"" + cripto_access_key + "\";");

  const license_headers = {
    "Content-Type": "application/json"
  };

  writeFile(workDir + "/.firebaserc", "{\n    \"projects\": {\n        \"default\": \"" + config.firebaseProjectId + "\"\n    }\n}");

  client.projects.list().then(response => {

    let project_id_found = false;

    if (Array.isArray(response) && response.length > 0) {

      response.map(value => {
        if (config.firebaseProjectId == value.projectId) {
          project_id_found = true;
        }
      });

      if (project_id_found) {

        const app_plataforms_list = ["web", "ios", "android"];
        app_plataforms_list.map(app_platform_os => {

          const firebase_config_plat = {
            project: config.firebaseProjectId
          };

          if (app_platform_os == "android") {
            firebase_config_plat.packageName = config.app_identifier;
          }

          if (app_platform_os == "ios") {
            firebase_config_plat.bundleId = config.app_identifier;
            firebase_config_plat.appStoreId = null;
          }

          const firebase_config_app = {
            project: config.firebaseProjectId
          };

          client.apps.list(app_platform_os, firebase_config_app).then(response_2 => {
            let target_platform_data_found = null;
            if (Array.isArray(response_2) && response_2.length > 0) {
              response_2.map(fire_value_resp => {
                if (config.firebaseProjectId + '-' + app_platform_os == fire_value_resp.displayName || config.app_identifier == fire_value_resp.packageName || config.app_identifier == fire_value_resp.bundleId) {
                  target_platform_data_found = fire_value_resp;
                }
              });
            }
            if (target_platform_data_found) {
              writeConfigFile(app_platform_os, config.firebaseProjectId, target_platform_data_found.appId);
            } else {
              client.apps.create(app_platform_os, config.firebaseProjectId + '-' + app_platform_os, firebase_config_plat).then(_0x3626ac => {
                writeConfigFile(app_platform_os, config.firebaseProjectId, _0x3626ac.appId);
              });
            }
          });
        });
      } else {
        console.error("[31m", "Firebase project not found or not correctly mentioned on config.json");
        process.exit(1);
      }
    }
  });

  const newConfig = "module.exports.AppConfig = {\n    app_name: '" + config.app_name + "', \n    app_description: '" + config.app_description + "', \n    app_identifier: '" + config.app_identifier + "', \n    ios_app_version: '" + config.ios_app_version + "', \n    android_app_version: " + config.android_app_version + ", \n    expo_owner: '" + config.expo_owner + "',\n    expo_slug: '" + config.expo_slug + "',\n    expo_project_id: '" + config.expo_project_id + "'\n}";

  writeFile(workDir + "/mobile-app/config/AppConfig.js", newConfig);

  writeFile(workDir + "/mobile-app/config/GoogleMapApiConfig.js", "module.exports.GoogleMapApiConfig = {\n    ios: \"" + config.googleApiKeys.ios + "\",\n    android: \"" + config.googleApiKeys.android + "\"\n};");

  writeFile(workDir + "/web-app/src/config/GoogleMapApiConfig.js", "export const GoogleMapApiConfig = '" + config.googleApiKeys.web + "';");
  
  // TESTA API GOOGLE MAPS
  fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=37.419857,-122.078827&key=" + config.googleApiKeys.server).then(response_maps => response_maps.json()).then(response_maps_json => {
    if (response_maps_json.results && response_maps_json.results.length > 0 && response_maps_json.results[0].formatted_address) {
      console.log("\nTested Geocoding API with a test call. Working.");
    } else {
      console.error("[31m", "\nError: There is problem in the Google API Keys used. Check the documentation and enable the 7 APIs with proper billing.");
      process.exit(1);
    }
  })["catch"](_0x37c884 => {
    console.error("[31m", "\nError: There is problem in the Google API Keys used. Check the documentation and enable the 7 APIs with proper billing.");
    process.exit(1);
  });

  // REMOÇÃO DE VALIDADOR
  // fetch("https://us-central1-simplehttpfunctions.cloudfunctions.net/reqinit", {
  //   'method': "post",
  //   'body': JSON.stringify(app_data),
  //   'headers': license_headers
  // }).then(raw_response => raw_response.json()).then(json_response => {

  //   if (json_response.error) {
  //     console.error("[31m", json_response.error);
  //     process.exit(1);
  //   }
  //   // MOVIDO
  //   // const cripto_access_key = CryptoJS.AES.encrypt(config.purchase_code, "c5moP9246_6D1[VQ").toString();
  //   // writeFile(workDir + "/common/src/other/AccessKey.js", "export default \"" + cripto_access_key + "\";");

  // })["catch"](error => {
  //   console.error("[31m", 'Error: Reading config');
  //   process.exit(1);
  // });
}

// FINALIZADA
if (argument == "initialize") {
  const appcat = require("../functions/appcat");
  const workDir = process.cwd();
  const config = JSON.parse(fs.readFileSync(workDir + "/functions/config.json", "utf8"));
  // VALIDA EMAIL
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  const {
    exec
  } = require("child_process");

  exec("firebase database:get /settings", (error_resp, stdout_resp, stderr_resp) => {

    if (error_resp) {
      console.log("error: " + error_resp.message);
      return;
    }

    if (stderr_resp) {
      console.log("stderr: " + stderr_resp);
      return;
    }

    stdout_resp = stdout_resp.replace(/\r?\n|\r/g, '');
    
    if (stdout_resp == "null") {
      if (config.admin_email && re.test(config.admin_email)) {

        const sample_db_json = require(workDir + "/json/" + appcat + "-sample-db.json");
        const language_en_json = require(workDir + "/json/language-en.json");

        sample_db_json.languages.lang1.keyValuePairs = language_en_json;

        let admin_user_data = {
          admin0001: {
            'firstName': "Admin",
            'lastName': "Admin",
            'email': config.admin_email,
            'usertype': "admin",
            'approved': true
          }
        };

        sample_db_json.users = admin_user_data;

        client.database.set('/', {
          'data': JSON.stringify(sample_db_json),
          'force': true
        });

        console.log("Admin User and Database create Successfull.");
        const firebase_client_url = "https://" + config.firebaseProjectId + ".web.app";
        (async () => {
          await open(firebase_client_url);
        })();
      } else {
        console.error("[31m", "Error: Admin email is not proper. Check config.json file.");
        process.exit(1);
      }
    } else {
      console.log("[33m", "Your database is not empty. Database and Admin user will not be created.");
    }
  });
}