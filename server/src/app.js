const express = require('express');
const mysql = require('mysql');
const md5 = require('md5');
const bodyParser = require('body-parser')
const cors = require('cors');

const app = express();
const router = express.Router({ mergeParams: true });
const port = 3001;

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


router.post('/login', (req, res, next)=> {
    const username = req.body.email;
    const password = req.body.password;

   connection.query(`SELECT * FROM persons WHERE username="${username}" AND password="${password}"`,
    (errors, results) => {
        console.log('here')
      if (results.length > 0 ) {
          res.send('ok');
          res.status(200);
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

    connection.query(`INSERT INTO Persons ( username, password, email, role)
    VALUES ("${username}" , "${password}" ,"${email}","${role}")`, (errors, results) => {
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


