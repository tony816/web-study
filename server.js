const express = require("express");
const fs = require("fs");
const https = require("https");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser"); // 꼭 추가
const ACCESS_SECRET = "access_secret_123"; // 실제 환경에서는 .env 사용 권장
const REFRESH_SECRET = "refresh_secret_456";

app.use(cookieParser());

app.use(
  cors({
    origin: true, // 클라이언트가 실행되는 주소와 포트
    methods: ["GET", "POST"], // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // 쿠키 허용 (필요 시)
  })
);
app.use(express.json()); // JSON 데이터를 처리
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded 데이터 처리
app.use(bodyParser.json()); // JSON 데이터 처리

app.use(express.static(path.join(__dirname, "/")));

// 정적 파일 제공
app.use("/media", express.static(path.join(__dirname, "media")));

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

function getLevelByPoint(point) {
  if (point < 100) return "🌱 견습 딜리터";
  if (point >= 100 && point < 500) return "🥉 초등 딜리터 1";
  if (point >= 500 && point < 1000) return "🥉 초등 딜리터 2";
  if (point >= 1000 && point < 1500) return "🥉 초등 딜리터 3";
  if (point >= 1500 && point < 2000) return "🥉 초등 딜리터 4";
  if (point >= 2000 && point < 2500) return "🥉 초등 딜리터 5";
  if (point >= 2500 && point < 4000) return "🥉 초등 딜리터 6";
  if (point >= 4000 && point < 5000) return "🥈 중등 딜리터 1";
  if (point >= 5000 && point < 6000) return "🥈 중등 딜리터 2";
  if (point >= 6000 && point < 8000) return "🥈 중등 딜리터 3";
  if (point >= 8000 && point < 9500) return "🥇 고등 딜리터 1";
  if (point >= 9500 && point < 11000) return "🥇 고등 딜리터 2";
  if (point >= 11000 && point < 15000) return "🥇 고등 딜리터 3";
  if (point >= 15000 && point < 20000) return "🏆 수석 딜리터 1";
  if (point >= 20000 && point < 25000) return "🏆 수석 딜리터 2";
  if (point >= 25000 && point < 30000) return "🏆 수석 딜리터 3";
  if (point >= 30000) return "🏆 수석 딜리터 4";
}

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

//JWT 비밀 키
const JWT_SECRET = "your_secret_key";

// 로그인 엔드포인트
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("이메일과 비밀번호를 입력해주세요.");
  }

  // 데이터베이스에서 사용자 확인
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("데이터베이스 오류:", err);
        return res.status(500).send("서버 오류가 발생했습니다.");
      }

      if (results.length === 0) {
        return res
          .status(401)
          .send("이메일 또는 비밀번호가 올바르지 않습니다.");
      }

      const user = results[0];

      // 비밀번호 비교
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .send("이메일 또는 비밀번호가 올바르지 않습니다.");
      }

      // JWT 토큰 생성
      const accessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "로그인 성공", token: accessToken });
    }
  );
});

// 인증 미들웨어
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).send("인증 토큰이 제공되지 않았습니다.");

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).send("유효하지 않은 토큰입니다.");
    req.user = user; // 사용자 정보를 req 객체에 저장
    next();
  });
}

app.post("/token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).send("리프레시 토큰 없음");

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).send("리프레시 토큰 유효하지 않음");

    const newAccessToken = jwt.sign({ userId: user.userId }, ACCESS_SECRET, {
      expiresIn: "15m",
    });
    res.json({ accessToken: newAccessToken });
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.send("로그아웃 완료");
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "대시보드 데이터", user: req.user });
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

//이하는 로그인한 유저 관련 로직
// 오디오 기록
app.post("/audio-played", (req, res) => {
  const { userId, audioFile, title } = req.body;
  if (!userId || !audioFile) {
    return res.status(400).send("필수 데이터가 누락되었습니다.");
  }

  const userQuery = `SELECT name FROM users WHERE id = ?`;
  db.query(userQuery, [userId], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(500).send("사용자 정보 조회 실패");
    }

    const userName = userResult[0].name;

    const checkQuery = `
      SELECT play_count, point FROM audio_logs WHERE user_id = ? AND audio_file = ?
    `;
    db.query(checkQuery, [userId, audioFile], (err, results) => {
      if (err) return res.status(500).send("로그 조회 실패");

      let newPlayCount = 1;
      let newPoint = 10;
      if (results.length > 0) {
        newPlayCount = results[0].play_count + 1;
        newPoint = newPlayCount * 10;
      }

      // 총 포인트로 레벨 계산
      const pointQuery = `SELECT SUM(point) AS total FROM audio_logs WHERE user_id = ?`;
      db.query(pointQuery, [userId], (err, pointResult) => {
        if (err) return res.status(500).send("포인트 합산 실패");

        const totalPoint = pointResult[0].total || 0;
        const level = getLevelByPoint(totalPoint + newPoint); // 이번 점수 포함해서 등급 산정

        if (results.length > 0) {
          const updateQuery = `
            UPDATE audio_logs SET play_count = ?, point = ?, played_at = NOW(), title = ?, level = ?
            WHERE user_id = ? AND audio_file = ?
          `;
          db.query(
            updateQuery,
            [newPlayCount, newPoint, title, level, userId, audioFile],
            (err) => {
              if (err) return res.status(500).send("업데이트 실패");
              console.log(
                `✅ 오디오 재생 업데이트 완료: userId=${userId}, file=${audioFile}, point=${newPoint}, level=${level}`
              );
              updateTotalPoints(userId, userName, res);
            }
          );
        } else {
          const insertQuery = `
            INSERT INTO audio_logs (user_id, user_name, audio_file, title, play_count, point, level)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          db.query(
            insertQuery,
            [userId, userName, audioFile, title, newPlayCount, newPoint, level],
            (err) => {
              if (err) return res.status(500).send("삽입 실패");
              console.log(
                `✅ 오디오 재생 신규 기록 완료: userId=${userId}, file=${audioFile}, point=${newPoint}, level=${level}`
              );
              updateTotalPoints(userId, userName, res);
            }
          );
        }
      });
    });
  });
});

function updateTotalPoints(userId, userName, res) {
  const query = `
    SELECT SUM(point) AS total FROM audio_logs WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ audio_logs 합산 오류:", err);
      return res.status(500).send("포인트 합산 실패");
    }

    const totalPoints = results[0].total || 0;

    const checkQuery = `SELECT * FROM total_points WHERE user_id = ?`;
    db.query(checkQuery, [userId], (err, rows) => {
      if (err) {
        console.error("❌ total_points 조회 오류:", err);
        return res.status(500).send("조회 실패");
      }

      if (rows.length === 0) {
        // 삽입
        const insertQuery = `
          INSERT INTO total_points (user_id, user_name, total_points) VALUES (?, ?, ?)
        `;
        db.query(insertQuery, [userId, userName, totalPoints], (err) => {
          if (err) {
            console.error("❌ INSERT 오류:", err);
            return res.status(500).send("삽입 실패");
          }
          return res.status(200).send("포인트 저장 완료");
        });
      } else {
        // 갱신
        const updateQuery = `
          UPDATE total_points SET total_points = ? WHERE user_id = ?
        `;
        db.query(updateQuery, [totalPoints, userId], (err) => {
          if (err) {
            console.error("❌ UPDATE 오류:", err);
            return res.status(500).send("업데이트 실패");
          }
          return res.status(200).send("포인트 업데이트 완료");
        });
      }
    });
  });
}

//대시보드 audio-logs
app.get("/api/audio-logs", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const query = `
    SELECT level, title, audio_file, play_count, point 
    FROM audio_logs 
    WHERE user_id = ?
    ORDER BY point DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB 오류" });
    res.json(results);
  });
});

app.get("/api/total-points", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query = `SELECT total_points FROM total_points WHERE user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("총 포인트 조회 오류:", err);
      return res.status(500).send("총 포인트 조회 실패");
    }

    const total = results.length > 0 ? results[0].total_points : 0;
    res.json({ totalPoints: total });
  });
});

app.post("/api/debug/recalculate-levels", (req, res) => {
  const query = "SELECT user_id, point FROM audio_logs";

  db.query(query, (err, results) => {
    if (err) return res.status(500).send("레벨 조회 실패");

    const updates = results.map(({ user_id, point }) => {
      const level = getLevelByPoint(point);
      return new Promise((resolve, reject) => {
        db.query(
          "UPDATE audio_logs SET level = ? WHERE user_id = ? AND point = ?",
          [level, user_id, point],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });
    });

    Promise.all(updates)
      .then(() => res.send("레벨 정정 완료"))
      .catch(() => res.status(500).send("일부 업데이트 실패"));
  });
});
