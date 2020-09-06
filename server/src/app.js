const express = require('express');
const mysql = require('mysql');
const md5 = require('md5');
const bodyParser = require('body-parser')
const cors = require('cors');
const crypto = require('crypto');
const { ENAMETOOLONG } = require('constants');
// const session = require('express-session');

const app = express();
const router = express.Router({ mergeParams: true });
const port = 3001;

// app.use(session({ secret: "SrTtX4ItBE"

// }))



const createUserId = (email, password) => {
    const algorithm = "aes-192-cbc";
    const key = crypto.scryptSync(password, 'salt', 24);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = cipher.update(email, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
}

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '',
    database: 'first'
  })


const startApp = (port) => {
    app.listen(port, () => {
        console.log(`Server is listening on ${port}`);
    })
}

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router)
const oneDayToSeconds = 24 * 60 * 60;

router.post('/login', (req, res, next)=> {
    const username = req.body.email;
    const password = req.body.password;
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    connection.query(`SELECT * FROM persons WHERE username="${username}" AND password="${hashedPassword}"`,
    (errors, results) => {
        console.log('here')
      if (results.length > 0 ) {
          res.cookie('username',username, {maxAge: oneDayToSeconds, httpOnly:false});
          res.status(200).send('ok');
          
 
          
      } else if (errors) {
          res.status(404);
      }
    });
  
  
 
 
})

router.post('/register', (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = "user";
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    const userId = createUserId(email, password);
    console.log('userid')
    console.log(userId);


    connection.query(`INSERT INTO Persons ( userid, username, password, email, role)
    VALUES ("${userId}" ,"${username}" , "${hashedPassword}" ,"${email}","${role}")`, (errors, results) => {
        console.log(results)
        if (errors) {
            console.log('Unable to insert to sql');
            throw errors;                         
        }
        console.log('Successfully inserted to SQL');
        res.send('OK');
        res.status(200);
    }); 
    
})

router.all('/', (req, res, next) => {
    res.send("Hello")
    console.log('Call to /');
})

app.use('/',router)





connection.connect(() => {
    console.log('SQL connection completed')
})
 
// connection.end()
startApp(port)


