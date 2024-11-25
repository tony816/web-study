const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "penguin816!!", // MySQL root 비밀번호
  database: "teardelete_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    process.exit(1);
  }
  console.log("MySQL에 연결되었습니다.");
});

app.post('/register', (req, res) => {
  console.log("서버로 POST 요청 도착:", req.body); // 디버깅용
  const { name, gender, birthdate, email, password, phone, subscription_period } = req.body;
  const query = `
      INSERT INTO users (name, gender, birthdate, email, password, phone, subscription_period)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [name, gender, birthdate, email, password, phone, subscription_period], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('사용자 등록에 실패했습니다.');
      } else {
          res.send('사용자가 성공적으로 등록되었습니다.');
      }
  });
});

 

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("사용자 데이터를 가져오지 못했습니다.");
    } else {
      res.json(results);
    }
  });
});

app.listen(3001, () => {
  console.log("서버가 http://localhost:3001 에서 실행 중입니다.");
});
