const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const md5 = require("md5");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const fileUpload = require("express-fileupload");
const JSONstream = require("JSONStream");
const es = require("event-stream");
const fastCsv = require("fast-csv");
const moment = require("moment");
var parser = require('xml2json');

function coordDistance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
}


const app = express();



const router = express.Router({ mergeParams: true });
const port = 3001;

const createUserId = (email, password) => {
  const algorithm = "aes-192-cbc";
  const key = crypto.scryptSync(password, "salt", 24);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(email, "utf8", "hex") + cipher.final("hex");
  return encrypted;
};

const getCoordinates = (coordinate) => {
  return coordinate / 1e7;
};

const getTimestamp = (timestamp) => {
  try {
    return moment.unix(timestamp / 1000).format("YYYY-MM-DD HH:mm:ss");

    // return date = new Date(timestamp).toISOString()
  } catch (err) {
    console.log(err);
  }

  // return date.toISOString(timestamp);
};

var connection = mysql.createConnection({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "",
  database: "first",
  multipleStatements: true,
});

const startApp = (port) => {
  app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
  });
};

app.use(cors());
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

router.post("/login", (req, res, next) => {
  const username = req.body.email;
  const password = req.body.password;
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  connection.query(
    `SELECT * FROM persons WHERE username="${username}" AND password="${hashedPassword}"`,
    (errors, results) => {
      if (results.length > 0) {
        const row = JSON.parse(JSON.stringify(results[0]));
        console.log(row.userid);
        res.locals.sessionId = row.userid;
        res.status(200).send({ userId: row.userid, role: row.role });
      } else if (errors) {
        res.status(404);
      }
    }
  );
});

router.post("/register", (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const role = "user";
  const hashedPassword = crypto
    .createHash("md5")
    .update(password)
    .digest("hex");
  const userId = createUserId(email, password);
  console.log("userid");
  console.log(userId);

  connection.query(
    `INSERT INTO Persons ( userid, username, password, email, role)
    VALUES ("${userId}" ,"${username}" , "${hashedPassword}" ,"${email}","${role}")`,
    (errors, results) => {
      // console.log(results);
      if (errors) {
        console.log("Unable to insert to sql");
        throw errors;
      }
      console.log("Successfully inserted to SQL");
      res.send("OK");
      res.status(200);
    }
  );
});

app.post("/deleteData", () => {
  // connection.query(`DELETE * FROM records; DELETE * FROM persons`, (errors) => {
  //   if (errors) {
  //     console.log(errors)
  //     res.send(500).send(errors);
  //   } else {
  //     res.send(200);
  //   }
  // });
})

app.get("/exportData",(req, res) => {
  console.log('In export data component')
  connection.query("SELECT * FROM records; SELECT * FROM persons;", 
  (errors, results) => {
    if (errors) {
      res.status(500).send("Internal server error")
      throw errors;      
    } else {
      const fileType = req.body.fileType;
      const filePath = '/';
      const fileName = `exported_data.${fileType}`;
      // File options
      const options = {
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'content-disposition': "attachment; filename=" + fileName, // gets ignored
            'content-type': "text/csv"
        }
    }

      switch(req.body.fileType) {
        case 'json':
          {
            const json = JSON.stringify(results);           
            fs.writeFileSync(fileName, json, (error, success) => {
              if (error) {
                console.log(error);
                throw error
              } else {
                console.log("successfully writen data");
              }
            });
            
          }
        case 'csv':
          {
            const ws = fs.createWriteStream(fileName);
            const jsonData = JSON.parse(JSON.stringify(results));            
            fastCsv.write(jsonData, { headers: true})
            .on("finish", () => {
              console.log("exported File created successfully");
            }).pipe(ws);
         
          }
        case 'xml': {
          const data = JSON.stringify(results);
          const xml = parser.toXml(data);            
          fs.writeFileSync(fileName, xml, (error, success) => {
            if (error) {
              console.log(error);
              throw error
            } else {
              console.log("successfully writen data");
            }
          });
        }
  
        
      }
      try {
        res.download(
            filePath,
            fileName,
            options
        );
        console.log("File sent successfully!");
    }
    catch (error) {
        console.error("File could not be sent!");
        throw error;
    }
    }

  })  

})
app.get("/adminData", async (req, res, nect) => {
  let data = []; 
  let readDatabase = new Promise((resolve, reject) => {
    console.log("Reading data from DB...");

    connection.query(`
    SELECT COUNT(*) AS count FROM records WHERE activityType!="${'null'}";
    SELECT activityType,COUNT(*) as count FROM records WHERE activityType!="${'null'}" GROUP BY activityType ORDER BY count DESC;
    SELECT userid,COUNT(*) as count FROM records WHERE activityType!="${'null'}" GROUP BY userid ORDER BY count DESC;
    SELECT MONTH(timestamp) AS month, COUNT(*) AS count FROM records WHERE activityType!="${'null'}" GROUP BY month ORDER BY month ASC;
    SELECT DAYOFWEEK(timestamp) AS day, COUNT(*) AS count FROM records WHERE activityType!="${'null'}" GROUP BY day ORDER BY day ASC;
    SELECT HOUR(timestamp) AS hour, COUNT(*) AS count FROM records WHERE activityType!="${'null'}" GROUP BY hour ORDER BY hour ASC;
    SELECT YEAR(timestamp) AS year, COUNT(*) AS count FROM records WHERE activityType!="${'null'}" GROUP BY year ORDER BY year ASC;
    SELECT userid, username FROM persons;
     `, async (errors, result) => {
      if (errors) {
        reject(errors);
      } else {
        const results = JSON.parse(JSON.stringify(result));
        const totalRecords = results[0][0].count;   
        // const users = results[7];  
       
        const activityDist = results[1].map((item) => {
          return {activityType: item.activityType, count: item.count/totalRecords}
        });  
        let array = [];    
        const users = results[7].map((item) => {
          return Object.values(item);
        } ).flat();
        console.log('typeof users');
        console.log(typeof(users));
        console.log('users');
        console.log(users)
         const userDist = results[2].map((item) => {   
          const usernameIndex = users.indexOf(item.userid) + 1;
          return {userid: users[usernameIndex], count: item.count/totalRecords}
        });
        const monthDist = results[3].map((item) => {
          return {month: item.month, count: item.count/totalRecords}
        });
        const weekDayDist = results[4].map((item) => {
          return {day: item.day, count: item.count/totalRecords}
        });
        const hourDist = results[5].map((item) => {
          return {hour: item.hour, count: item.count/totalRecords}
        });
        const yearDist = results[6].map((item) => {
          return {year: item.year, count: item.count/totalRecords}
        });

        // console.log(results)
        data.push(activityDist)
        console.log("userdist")
        console.log(userDist)
        data.push(userDist)
        console.log("monthDist");
        console.log(monthDist)
        data.push(monthDist)
        data.push(weekDayDist)
        data.push(hourDist)
        data.push(yearDist)
        resolve(data)       
      }      
    });   
  });

  await readDatabase.then(() => {
    console.log('successfully read from Database');
    res.status(200).send({data});
  });
},() => {res.status(400).send(errors)});

app.get("/adminData/users", async (req, res, nect) => {
  let data = []; 
  let readDatabase = new Promise((resolve, reject) => {
    console.log("Reading data from DB...");

    connection.query(`SELECT activityType,COUNT(*) as count FROM records WHERE activityType!=${'null'} GROUP BY activityType ORDER BY count DESC`, (errors, results) => {
      if (errors) {
        reject(errors);
      } else {
        console.log(results);
        data.push(results)   
        resolve(data);
      }      
    });   
  });

  await readDatabase.then(() => {
    res.status(200).send({data});
  });
},() => {res.status(400).send(errors)});


app.post("/userData", async (req, res, next) => {
  let score = [];
  let promise = new Promise((resolve, reject) => {
    console.log("Reading data from DB...");
    const userid = req.body.userid;
    connection.query(
      `  
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}"
AND timestamp <= "${moment()
        .subtract(0, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >=  "${moment()
        .startOf("Month")
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}"
AND timestamp <= "${moment()
        .subtract(1, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(2, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}"
AND timestamp <= "${moment()
        .subtract(2, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(3, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(3, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(4, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(4, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(5, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(5, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(6, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(6, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(7, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(7, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(8, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(8, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(9, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(9, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(10, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(10, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(11, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(11, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(12, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(12, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(13, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(13, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(14, "Month")
        .utc()
        .format("YYYY-MM-DD")}"; 
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}"
AND timestamp <= "${moment()
        .subtract(0, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >=  "${moment()
        .startOf("Month")
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(1, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(2, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(2, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(3, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(3, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(4, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(4, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(5, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(5, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(6, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(6, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(7, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(7, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(8, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(8, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(9, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(9, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(10, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(10, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(11, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(11, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(12, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(12, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(13, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT COUNT(*) AS count FROM records WHERE activityType IN ("ON_BICYCLE","ON_FOOT","RUNNING","WALKING","IN_VEHICLE") AND userid="${userid}" 
AND timestamp <= "${moment()
        .subtract(12, "Month")
        .utc()
        .format("YYYY-MM-DD")}" AND timestamp >= "${moment()
        .subtract(13, "Month")
        .utc()
        .format("YYYY-MM-DD")}";
SELECT uploaded FROM persons WHERE userid="${userid}";
SELECT MAX(timestamp) AS lastRecord FROM records WHERE userid="${userid}";
SELECT MIN(timestamp) AS firstRecord FROM records WHERE userid="${userid}";
`,
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(404);
          reject(error);
          throw error;
        } else {
          let oneScore;
          let totalActivity;
          let bodyActivity;
          for (i = 0; i < 14; i++) {
            bodyActivity = JSON.parse(JSON.stringify(results[i]));
            totalActivity = JSON.parse(JSON.stringify(results[i + 14]));
            oneScore =
              totalActivity[0].count !== 0
                ? bodyActivity[0].count / totalActivity[0].count
                : null;
            score.push(oneScore);
          }
          console.log(score);
          // const rowUploaded = moment(JSON.parse(JSON.stringify(results[28]))).format("YY/MM/DD HH:mm:ss");
          // const lastRecord = moment(JSON.parse(JSON.stringify(results[29]))).format("YY/MM/DD HH:mm:ss");
          // const firstRecord = moment(JSON.parse(JSON.stringify(results[30]))).format("YY/MM/DD HH:mm:ss");
          // console.log(rowUploaded.uploaded);
          // console.log(lastRecord.lastRecord);
          // console.log(firstRecord.firstRecord);
          // score.push(rowUploaded[0].uploaded);
          // score.push(lastRecord[0].lastRecord);
          // score.push(firstRecord[0].firstRecord);
          resolve(score);
        }
      }
    );
  });
  await promise.then(
    (score) => {
      console.log("DB read successfully");
      res.status(200).send({ score });
    },
    (err) => {
      console.log("Failed to read DB");
      res.status(404).send(err);
    }
  );
});

app.post("/upload", async (req, res, next) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.file;
      const userId = req.body.userId;
      const restrictedLocations = req.body.locations;
      console.log("form data");
      console.log(req.body.name);
      console.log(req.body.locations);
      console.log(req.body.title);
      console.log(req.body.userId);

      // next()
      await avatar.mv("../uploads/" + avatar.name);
      const parser = JSONstream.parse("locations.*");
      const uploadTimestamp = getTimestamp(moment().valueOf());
      connection.query(
        `UPDATE persons SET uploaded="${uploadTimestamp}" WHERE userid="${userId}"`,
        (errors) => {
          if (errors) {
            console.log(errors);
            throw errors;
          }
        }
      );
      const stream = await fs.createReadStream("../uploads/" + avatar.name, {
        encoding: "utf8",
      });
      stream.pipe(parser).pipe(
        es.mapSync((data) => {
          const latitude = getCoordinates(data.latitudeE7);
          const longitude = getCoordinates(data.longitudeE7);
          const distance = coordDistance(latitude, longitude, 38.230462, 21.75315,"K");
          console.log('restrictedLocations');
          console.log(restrictedLocations);
          if (distance > 10) {
            const timestamp = getTimestamp(data.timestampMs);
            const activityTimestamp = data.activity
              ? getTimestamp(data.activity[0].timestampMs)
              : null;
            const activityType = data.activity
              ? data.activity[0].activity[0].type
              : null;

            connection.query(
              `INSERT INTO records (userId, timestamp, latitude, longitude, activityType, activityTimestamp) VALUES 
        ("${userId}", "${timestamp}", "${latitude}", "${longitude}", "${activityType}", "${activityTimestamp}")`,
              (error) => {
                if (error) {
                  console.log("unable to insert record");
                  throw error;
                }
              }
            );
          }
        })
      );

      //send response
      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: avatar.name,
          mimetype: avatar.mimetype,
          size: avatar.size,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.use("/", router);

connection.connect(() => {
  console.log("SQL connection completed");
});

// connection.end()
startApp(port);
