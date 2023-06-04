/* 설치한 express 모듈 불러오기 */
const express = require("express");

/* 설치한 socket.io 모듈 불러오기 */
const socket = require("socket.io");

/* Node.js 기본 내장 모듈 불러오기 */
const http = require("http");

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require("fs");

/* express 객체 생성 */
const app = express();

/* express http 서버 생성 */
const server = http.createServer(app);

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);

/*ejs 사용*/
app.set("views", __dirname + "/src/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/src/views"));

// app.use(logger);
app.use(express.urlencoded({ extended: true }));

/**session으로 profile의 string을 받을것 */
const maria = require("./src/database/connect/maria");
const mybatisMapper = require("mybatis-mapper");

// MariaDB 연결
maria.connect();

// MyBatis 매퍼 생성 및 XML 파일 로드
mybatisMapper.createMapper(["./src/database/mapper/calendar.xml"]);

/*이전 가족 창에서 채팅창을 받는다.*/
var username;
app.get("/chat", function (req, res) {
  username = req.query.username; // req.query.username을 사용하여 쿼리 문자열에서 username 값을 가져옴
  console.log(username);
  //SQL 파라미터
  const parameter = {
    name: username, //공통 or 개인 => session user를 받아서 처리하기
  };

  //SQL문 가져오기
  const format = { language: "sql", indent: "  " };
  const query = mybatisMapper.getStatement(
    "CalendarMapper",
    "selectEventsByType",
    parameter,
    format
  );

  //실행
  maria.query(query, function (err, results, fields) {
    if (err) {
      console.error("An error occurred while executing the query:", err);
    }

    // EJS 파일 렌더링 및 결과 전달
    return res.render("index", { username: username, results: results });
  });
});

io.sockets.on("connection", function (socket) {
  /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
  socket.on("newUser", function (name) {
    console.log(name + " 님이 접속하였습니다.");

    /* 소켓에 이름 저장해두기 */
    socket.name = name;

    /* 모든 소켓에게 전송 */
    io.sockets.emit("update", {
      type: "connect",
      name: "SERVER",
      message: name + "님이 접속하였습니다.",
    });
  });

  /* 전송한 메시지 받기 */
  socket.on("message", function (data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name;

    console.log("메시지 전송 받음");
    console.log(data);
    /**이부분에서 데이터 저장하기 */

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit("update", data);
    console.log("broadcat");
  });

  /* 접속 종료 */
  socket.on("disconnect", function () {
    console.log(socket.name + "님이 나가셨습니다.");

    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit("update", {
      type: "disconnect",
      name: "SERVER",
      message: socket.name + "님이 나가셨습니다.",
    });
  });
});

/* 서버를 6000 포트로 listen */
server.listen(8080, function () {
  console.log("서버 실행 중..");
});
