const express = require("express");
const app = express();
const port = 8000;
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

const connection = mysql.createConnection({
    host: "server2.bsthun.com",
    port: "6105",
    user: "lab_1seeas",
    password: "FFa0LjByPPlG1clt",
    database: "lab_todo02_1s5iwkz",
  });

connection.on('error', (err) => {
  console.error('MySQL connection error:', err);
  connection.end();
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    connection.end();
  } else {
    console.log("Database is connected");
  }
});

app.use(bodyParser.json({type: "application/json"}));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", (req, res) => {
    const username = req.body.username;
	const password = req.body.password;
    connection.query(
        "SELECT hashed_password FROM users WHERE username = ?",
        [username],
        (err, result) => {
        if (err) {
            console.error(err.message);
            return res.json({
              success: false,
              data: null,
              error: err.message,
            });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: "Authentication failed" });
        }
        const hashedPassword = result[0].hashed_password;
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
              console.error(err.message);
              return res.json({
                success: false,
                data: null,
                error: err.message,
              });
            }
            if (result) {
              return res.status(200).json({ message: "Authentication successful" });
            } else {
              return res.status(401).json({ message: "Authentication failed" });
            }
          });
        }
      );
    });

// app.post('/register', async (req, res) => {
//     const { username, password } = req.body;
//     if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
//         return res.status(400).json({ message: 'Password does not meet the requirements' });
//     }
//     // Hash the password using bcrypt
//     // bcrypt.hash(password, (err, hashedPassword) => {
//     //     if (err) {
//     //         console.error(err.message);
//     //         return res.json({
//     //           success: false,
//     //           data: null,
//     //           error: err.message,
//     //         });
//     //     }\
//     const hash = await bcrypt.hash(password,10);
//         connection.query('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hash], (err, results) => {
//             if (err) {
//                 console.error(err.message);
//                 return res.json({
//                   success: false,
//                   data: null,
//                   error: err.message,
//                 });
//             }

//             return res.status(200).json({ message: 'Registration successful' });
       
//     });
// });

app.post(
    "/register",
    check("password")
      .notEmpty()
      .withMessage("password cannot be empty")
      .isLength({ min: 8 })
      .withMessage("password must be at least 8 characters")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
      .withMessage(
        "password must have at least 1 digit, uppercase, and lowercase"
      ),
    async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
      }
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password,salt);
      connection.query(
        `INSERT INTO users (username, hashed_password) VALUES (?,?)`,
        [username, hash],
        (err, rows) => {
          if (err) {
            res.json({
              success: false,
              data: null,
              error: err.message,
            });
          } else {
            console.log(rows);
            if (rows) {
              res.json({
                success: true,
                data: {
                  message: "create success",
                },
              });
            }
          }
        }
      );
    }
  );

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
