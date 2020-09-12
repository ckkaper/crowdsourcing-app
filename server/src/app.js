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
}

const getTimestamp = (timestamp) => {
  const date = new Date()
  return date.toISOString(timestamp);
}

var connection = mysql.createConnection({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "",
  database: "first",
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
const oneDayToSeconds = 24 * 60 * 60;

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
      console.log("here");
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
      console.log(results);
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
      console.log("form data");
      console.log(req.body.name);
      console.log(req.body.locations);
      console.log(req.body.title);
      console.log(req.body.userId);

 
      await avatar.mv("../uploads/" + avatar.name);
      const parser = JSONstream.parse("locations.*");
      console.log(avatar.name);
      const stream = await  fs.createReadStream("../uploads/"+avatar.name, {encoding: 'utf8'});
      stream.pipe(parser).pipe(es.mapSync((data) => {
        const latitude = getCoordinates(data.latitudeE7);
        const longitude = getCoordinates(data.longitudeE7);
        const timestamp = getTimestamp(data.timestampMs);
        const activityTimestamp = data.activity ? data.activity[0].timestamp : null;
        const activityType = data.activity ? data.activity[0].activity[0].type : null;
  
        connection.query(`INSERT INTO records (userId, timestamp, latitude, longitude, activityType, activityTimestamp) VALUES 
        ("${userId}", "${timestamp}", "${latitude}", "${longitude}", "${activityType}", "${activityTimestamp}")`,
        (error)=> {
          if (error) {
            console.log("unable to insert record");
            throw error;
          }
        })
      }));
 

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
