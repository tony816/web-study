const express = require("express");
const fs = require("fs");
const https = require("https");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json()); // JSON 데이터를 처리
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 데이터 처리
app.use(bodyParser.json()); // JSON 데이터 처리

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "/")));

app.use(
  cors({
    origin: "https://localhost:3001", // 클라이언트가 실행되는 주소와 포트
    methods: ["GET", "POST"], // 허용할 HTTP 메서드
    credentials: true, // 쿠키 허용 (필요 시)
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// 기본 라우팅
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "apply.html")); // apply.html로 이동
});

const sslOptions = {
  key: fs.readFileSync("private-key.pem"),
  cert: fs.readFileSync("certificate.pem"),
};

// HTTPS 서버 실행
https.createServer(sslOptions, app).listen(3001, () => {
  console.log("HTTPS 서버가 https://localhost:3001 에서 실행 중입니다.");
});

const http = require("http");

http
  .createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  })
  .listen(80);

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Penguin816!!", // MySQL root 비밀번호
  database: "teardelete_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
    process.exit(1);
  }
  console.log("MySQL에 연결되었습니다.");
});

app.get("/check-email", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("이메일이 제공되지 않았습니다.");
  }

  const query = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("MySQL 오류:", err);
      return res.status(500).send("서버 오류가 발생했습니다.");
    }

    const isAvailable = results[0].count === 0;
    res.json({ available: isAvailable });
  });
});

app.get("/check-user", (req, res) => {
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).send("이름과 전화번호가 제공되지 않았습니다.");
  }

  const query = `
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE name = ? AND phone = ?
  `;

  db.query(query, [name, phone], (err, results) => {
    if (err) {
      console.error("MySQL 오류:", err);
      return res.status(500).send("서버 오류가 발생했습니다.");
    }

    const isAvailable = results[0].count === 0; // 중복이 없으면 true
    res.json({ available: isAvailable });
  });
});

app.post("/register", async (req, res) => {
  console.log("서버로 POST 요청 도착:", req.body); // 디버깅용

  const {
    name,
    gender,
    birthdate,
    email,
    password,
    phone,
    subscription_period,
  } = req.body;

  if (
    !name ||
    !gender ||
    !birthdate ||
    !email ||
    !password ||
    !phone ||
    !subscription_period
  ) {
    console.error("필수 데이터가 누락되었습니다.", req.body);
    return res.status(400).send("필수 필드가 누락되었습니다.");
  }

  const usercheckQuery = `
    SELECT COUNT(*) AS count 
    FROM users 
    WHERE name = ? AND phone = ?
    `;
  const [results] = await db.promise().query(usercheckQuery, [name, phone]);

  if (results[0].count > 0) {
    return res.status(200).json({
      success: false,
      message: "중복된 사용자 정보가 존재합니다.",
    });
  }

  // 비밀번호 형식 검증
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .send("비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.");
  }

  // 비밀번호 해시화 처리
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해시화
  } catch (err) {
    console.error("비밀번호 해시화 오류:", err);
    return res.status(500).send("비밀번호 처리 중 오류가 발생했습니다.");
  }

  // 나이 계산
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  const schedule = require("node-schedule");

  // 매일 자정에 나이 업데이트
  schedule.scheduleJob("0 0 * * *", () => {
    const updateAgeQuery = `
      UPDATE users
      SET age = YEAR(CURDATE()) - YEAR(birthdate) - 
                (DATE_FORMAT(CURDATE(), '%m-%d') < DATE_FORMAT(birthdate, '%m-%d'));
    `;

    db.query(updateAgeQuery, (err, results) => {
      if (err) {
        console.error("스케줄링 나이 업데이트 오류:", err);
      } else {
        console.log("모든 사용자의 나이가 업데이트되었습니다.");
      }
    });
  });

  const checkQuery = "SELECT email FROM users WHERE email = ?";
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      console.error("MySQL 오류:", err);
      return res.status(500).send("중복 확인 중 오류가 발생했습니다.");
    }

    if (results.length > 0) {
      console.log("중복된 이메일:", email);
      return res.status(400).send("이미 등록된 이메일입니다.");
    }

    const insertQuery = `
      INSERT INTO users (name, gender, birthdate, age, email, password, phone, subscription_period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [
        name,
        gender,
        birthdate,
        age,
        email,
        hashedPassword,
        phone,
        subscription_period,
      ],
      (err, result) => {
        if (err) {
          console.error("MySQL 오류:", err);
          return res.status(500).json({
            success: false,
            message: "사용자 등록에 실패했습니다.",
            error: err.message,
          });
        }
        res.status(200).json({
          success: true,
          message: "사용자가 성공적으로 등록되었습니다.",
        });
        console.log("서버 응답 완료: 사용자 등록 성공");
      }
    );
  });
});

app.get("/update-ages", (req, res) => {
  const updateAgeQuery = `
    UPDATE users
    SET age = YEAR(CURDATE()) - YEAR(birthdate) - 
              (DATE_FORMAT(CURDATE(), '%m-%d') < DATE_FORMAT(birthdate, '%m-%d'));
  `;

  db.query(updateAgeQuery, (err, results) => {
    if (err) {
      console.error("나이 업데이트 오류:", err);
      return res
        .status(500)
        .send("나이를 업데이트하는 중 오류가 발생했습니다.");
    }
    res.send("모든 사용자의 나이가 성공적으로 업데이트되었습니다.");
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
