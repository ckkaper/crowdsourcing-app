const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const md5 = require("md5");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const fileUpload = require("express-fileupload");

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
 
      let avatar = req.files.file;
      console.log("form data");
      console.log(req.body.name);
      console.log(req.body.locations);
      console.log(req.body.title);

 
      avatar.mv("./uploads/" + avatar.name);

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
