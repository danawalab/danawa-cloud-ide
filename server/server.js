const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const db = require("./config/db");
const cors = require("cors");
const bodyParser = require('body-parser');
const prom = require('prom-client');

app.use(bodyParser.json())
app.use(cors());

app.get('/metrics', function (req, res) {
  res.set('Content-Type', prom.register.contentType);
  res.end(prom.register.metrics());
});

const collectDefaultMetrics = prom.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'my_ide:' });

// 컨테이너 수
const gauge = new prom.Gauge({
  name: 'my_ide:nodejs_count_container',
  help: 'metric_help',
  labelNames: ['method', 'statusCode'],
});

// 컨테이너 조회
app.post("/api/search", (req, res) => {
  const user_id = req.body.userId;
  db.query(
    "SELECT * FROM USER_INFO UI INNER JOIN CONTAINER_INFO CI ON UI.USER_ID = CI.USER_ID WHERE UI.USER_ID = (?) ORDER BY CI.INSERT_DTS DESC",
    [user_id],
    (err, data) => {
      if (!err) res.send({ container: data });
      else res.send(err);
    }
  );
});

// 중복 컨테이너 조회
app.post("/api/selectDuple", (req, res) => {
  const user_id = req.body.user_id;
  const container_nm = req.body.container_nm;
  db.query(
    "SELECT COUNT(*) CNT FROM USER_INFO UI INNER JOIN CONTAINER_INFO CI ON UI.USER_ID = CI.USER_ID WHERE UI.USER_ID = (?) AND CI.CONTAINER_NM = (?)",
    [user_id, container_nm],
    (err, data) => {
      console.log(data[0].CNT);
      if (!err) res.send({ count: data[0].CNT });
      else res.send(err);
    }
  );
});

// 컨테이너 삭제
app.post("/api/delete", (req, res) => {
  const user_id = req.body.user_id;
  const container_id = req.body.container_id;
  db.query(
    "DELETE FROM CONTAINER_INFO WHERE USER_ID = (?) AND CONTAINER_ID = (?)",
    [user_id, container_id],
    (err, data) => {
      if (!err) res.send({ container: data });
      else res.send(err);
    }
  );
});

// 컨테이너 생성
app.post("/api/insert", (req, res) => {
  const user_id = req.body.user_id;
  const container_id = req.body.container_id;
  const container_nm = req.body.container_nm;
  const note_txt = req.body.note_txt;
  const tmpl_dtl = req.body.tmpl_dtl;
  const stack_cd = req.body.stack_cd;
  const ADDPKG_CD_1 = req.body.pkg_1;
  const port = req.body.port;
  const ext_port_1 = req.body.ext_port_1;
  const ext_port_2 = req.body.ext_port_2;
  const ext_port_3 = req.body.ext_port_3;
  const ext_port_4 = req.body.ext_port_4;

  db.query(
    "INSERT INTO CONTAINER_INFO(	USER_ID,     CONTAINER_ID,    CONTAINER_NM,    NOTE_TXT,	TMLT_DTL,    STACK_CD,    ADDPKG_CD_1, PORT, EXT_PORT_1, EXT_PORT_2, EXT_PORT_3, EXT_PORT_4, UPDATE_DTS,    INSERT_DTS) " +
      "VALUES (	(?),    (?),    (?),    (?),     (?),    (?),    (?),    (?),  (?), (?), (?), (?),    NOW(),    NOW())",
    [
      user_id,
      container_id,
      container_nm,
      note_txt,
      tmpl_dtl,
      stack_cd,
      ADDPKG_CD_1,
      port,
      ext_port_1,
      ext_port_2,
      ext_port_3,
      ext_port_4
    ],
    (err, data) => {
      if (!err) res.send({ container: data });
      else res.send(err);
    }
  );
});

app.all('/api/insert', function (req, res, next) {
  gauge.inc();
  next();
});

app.all('/api/delete', function (req, res, next) {
  gauge.dec();
  next();
});

// 회원가입
app.post("/api/join", (req, res) => {
  const user_id = req.body.user_id;
  const user_pwd = req.body.user_pwd;

  db.query(
    "INSERT INTO USER_INFO(USER_ID, USER_PWD, UPDATE_DTS, INSERT_DTS) " + "VALUES (	(?), (?), NOW(), NOW())",
    [
      user_id,
      user_pwd
    ],
    (err, data) => {
      if (!err) res.send({ container: data });
      else res.send(err);
    }
  );
});

// 로그인
app.post("/api/login", (req, res) => {
  const user_id = req.body.user_id;
  const user_pwd = req.body.user_pwd;
  db.query(
    "SELECT * FROM USER_INFO WHERE USER_ID = (?) AND USER_PWD = (?)",
    [user_id, user_pwd],
    (err, data) => {
      if (!err) res.send({ container: data });
      else res.send(err);
    }
  );
});


app.listen(PORT, () => {
  console.log(`Server On : http://localhost:${PORT}/`);
});
