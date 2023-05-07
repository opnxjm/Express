const express = require("express");
const app = express();
const port = 8000;
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

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
            return res.status(500).json({ message: "Internal Server Error" });
        }
        if (result.length === 0) {
            // User not found
            return res.status(401).json({ message: "Authentication failed" });
        }
        const hashedPassword = result[0].hashed_password;
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ message: "Internal Server Error" });
            }
    
            if (result) {
              // Passwords match, authentication successful
              return res.status(200).json({ message: "Authentication successful" });
            } else {
              // Passwords do not match, authentication failed
              return res.status(401).json({ message: "Authentication failed" });
            }
          });
        }
      );
    });
    app.post('/register', (req, res) => {
        const { username, password } = req.body;
    
        // Validate the password
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
            return res.status(400).json({ message: 'Password does not meet the requirements' });
        }
    
        // Hash the password using bcrypt
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
    
            // Insert the user record into the database
            connection.query('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
    
                return res.status(200).json({ message: 'Registration successful' });
            });
        });
    });
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
