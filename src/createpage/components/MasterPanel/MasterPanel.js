import React, { Component } from "react";
import "./MasterPanel.css";
import DetailPanel from "../DetailPanel/DetailPanel.js";
import { withRouter } from "react-router-dom";
import {
  Form,
  Input,
  Segment,
  Button,
  Message,
  Dimmer,
  Loader,
  Modal,
  Header,
  Icon,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import java_icon from "./images/java_logo.svg";
import node_icon from "./images/node_js_logo.svg";
import axios from "axios";

// 도커를 통한 신규 컨테이너 생성 및 실행
async function createContainer(user_id, key, pickImage, rep, useMysql) {
  let c_id;
  try {
    let newContainer = await axios({
      method: "post",
      url: "/containers/create",
      data: {
        Hostname: "test",
        Env: [
          "GIT_REP=" +
            (rep !== ""
              ? "git clone " +
                rep +
                " /home/danawa/works/" +
                (pickImage === "java"
                  ? "spring-boot-helloworld-master/clone_space"
                  : "node-js-sample-master/clone_space")
              : ""),
          "MYSQL=" +
            (useMysql === "no"
              ? ""
              : "git clone https://github.com/mysqljs/mysql.git" +
                " /home/danawa/works/" +
                (pickImage === "java"
                  ? "spring-boot-helloworld-master/mysql"
                  : "node-js-sample-master/mysql")),
        ],
        Image:
          pickImage === "java"
            ? "dcr.danawa.io/java_spring_vscode:latest" // 트래픽과 같은 포트 사용할것
            : "dcr.danawa.io/nodejs_vscode:latest",
        ExposedPorts: {
          "3333/tcp": {},
        },
        Labels: {
          "traefik.frontend.rule": "PathPrefixStrip:/" + user_id + "/" + key,
          "traefik.backend": user_id + "-" + key,
          "traefik.port": "3333",
          "traefik.enable": "true",
          "traefik.passHostHeader": "true",
          "traefik.http.middlewares.test-redirectregex.redirectregex.regex":
            "^http://es2.danawa.io/" + user_id + "/" + key + "/(.*)",
          "traefik.http.middlewares.test-redirectregex.redirectregex.replacement":
            "http://es2.danawa.io/" + user_id + "/" + key + "/$${1}",
        },
        HostConfig: {
          Binds: [],
          NetworkMode: "web",
        },
        NetworkingConfig: {
          EndpointsConfig: {
            web: {
              IPAMConfig: {},
              Links: [],
              Aliases: [],
            },
          },
        },
      },
    });

    c_id = newContainer.data.Id;
    console.log(newContainer.data.Id);

    if (c_id !== null) {
      await axios({
        method: "post",
        url: "/containers/" + c_id + "/start",
      });
    } else {
      console.log("컨테이너가 시작되지 않았습니다.");
    }
  } catch (e) {
    console.log(e);
  }
  return c_id;
}

// 깃 레포지토리 조회
async function getExistRepository(url) {
  console.log(url);
  const res = axios({
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    method: "get",
    url: url,
  });

  return res;
}

// 컨테이너 DB 인서트
function insertTable(id, state, port) {
  console.log(state);
  // 생성 API 호출
  axios({
    method: "post",
    url: "/api/insert",
    data: {
      user_id: window.localStorage.getItem("user_id"),
      container_id: id,
      container_nm: state.input_data.name,
      note_txt: state.input_data.content,
      tmpl_cd: state.group2,
      tmpl_dtl: state.group3,
      stack_cd: state.imageClicked,
      pkg_1: state.pkg_1,
      port: port,
    },
  });
}

// 컨테이너명 중복 검색
async function duplechk(state) {
  const res = axios({
    method: "post",
    url: "/api/selectDuple",
    data: {
      user_id: window.localStorage.getItem("user_id"),
      container_nm: state.input_data.name,
    },
  });

  return res;
}

class MasterPanel extends Component {
  state = {
    group1: "kor",
    group3: "non",
    imageClicked: "java",
    loadOfDatas: false,
    result: "",
    pkg_1: "no",
    port: null,
    input_data: {
      name: "",
      content: "",
    },
    isError: false,
    valid_name_duple: false,
    error_msg: {
      valid_name: "",
      valid_content: "",
    },
    git: {
      repo: "",
      repo_msg: "",
    },
    user_id: "",
  };

  // 라디오 그룹 제어함수
  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  // 추가 패키지 제어함수
  handlePkgChange = (e, { value }) => {
    if (this.state.pkg_1 === "no") {
      this.setState({ pkg_1: "yes" });
    } else {
      this.setState({ pkg_1: "no" });
    }
  };

  // 밸리데이션 체크 & 입력
  handleInputData = (e) => {
    let tg = e.target;
    let formError = this.state.error_msg;
    let formInput = this.state.input_data;

    if (tg.name === "name" && tg.value.length > 20) {
      formError.valid_name = "컨테이너 이름은 20자로 제한됩니다.";
    } else if (
      tg.name === "name" &&
      /[^a-zA-Z0-9-_-]/.test(tg.value) === true
    ) {
      formError.valid_name =
        "컨테이너 이름은 영어 혹은 숫자, 하이픈(-)만 허용됩니다.";
    } else if (tg.name === "content" && tg.value.length > 100) {
      formError.valid_content = "컨테이너 내용은 100자로 제한됩니다.";
    } else {
      if (tg.name === "name") {
        formInput.name = tg.value;
        formError.valid_name = "";
      } else if (tg.name === "content") {
        formInput.content = tg.value;
        formError.valid_content = "";
      }
    }
    this.setState({ error_msg: formError });
  };

  // 이미지 클릭 이벤트
  imageClick = (e) => {
    let name = e.target.name;
    this.setState({ imageClicked: name });
  };

  // 생성 버튼 ok 콜백함수
  handleConfirm = async () => {
    this.setState({
      result: "yes",
      loadOfDatas: true,
      user_id: window.localStorage.getItem("user_id"),
    });

    let con_key = Math.random().toString(36).substr(2, 11);

    if (
      this.state.error_msg.valid_content === "" &&
      this.state.error_msg.valid_name === "" &&
      this.state.input_data.name !== ""
    ) {
      var chk = await duplechk(this.state);
      if (chk.data.count === 0) {
        insertTable(
          await createContainer(
            window.localStorage.getItem("user_id"),
            con_key,
            this.state.imageClicked,
            this.state.git.repo,
            this.state.pkg_1
          ),
          this.state,
          con_key
        );
        setTimeout(
          function () {
            this.setState({ port: con_key });
          }.bind(this),
          8000
        );
      } else {
        this.setState({
          result: "no",
          loadOfDatas: false,
          isError: true,
          valid_name_duple: true
        });
      }
    } else {
      this.setState({
        result: "no",
        loadOfDatas: false,
        isError: true,
      });
    }
  };

  // 메인화면 이동
  handleClose = (e) => {
    const { history } = this.props;
    history.push({
      pathname: "/main",
      state: this.state.user_id,
    });
  };

  // 리포지토리 체크
  getCheckGitRep = async (e) => {
    let msg = "";
    console.log(this.state.git.repo);
    try {
      msg = await getExistRepository(this.state.git.repo);
    } catch (error) {
      console.log(error);
    }
    console.log(msg);
  };

  // 깃리포지토리 작성
  inputGitRep = (e) => {
    this.setState({
      git: {
        repo: e.target.value,
      },
    });
  };

  // 현재 계정 로그아웃
  execLogOut = () => {
    const { history } = this.props;
    window.localStorage.setItem("user_id", "");
    history.push({
      pathname: "/",
    });
  };

  // 에러 메시지 확인
  handleError = () => {
    this.setState({ isError: false, valid_name_duple: false });
  };

  render() {
    return (
      <div>
        <Dimmer className="loadingBar" active={this.state.loadOfDatas}>
          <Loader
            style={
              this.state.port !== null
                ? { display: "none" }
                : { display: "block" }
            }
          ></Loader>
          <div
            id="done-panel"
            style={
              this.state.port !== null
                ? { display: "block" }
                : { display: "none" }
            }
          >
            <h2 id="done-panel-header">컨테이너 생성 완료 !</h2>
            <h3 id="done-panel-body">신규 컨테이너가 생성되었습니다.</h3>
            <Button
              content="대시보드로 이동"
              color="olive"
              onClick={this.handleClose}
            />
          </div>
        </Dimmer>
        <Button size="large" color="black" onClick={this.execLogOut}>
          로그아웃
        </Button>
        <Button
          className="navigate-left-button"
          color="grey"
          content="대시보드로 돌아가기"
          size="large"
          onClick={this.handleClose}
        />
        <div>
          <Button
            className="navigate-right-button"
            color="blue"
            content="컨테이너 생성"
            size="large"
            onClick={this.handleConfirm}
          />
        </div>

        <h2 id="title-content">컨테이너 생성</h2>
        <div className="inner-content">
          <Segment>
            <Form size="large">
              <Form.Field inline>
                <label htmlFor="name">컨테이너 이름</label>
                <Input
                  id="name"
                  name="name"
                  placeholder="영어 혹은 숫자, 하이픈(-_)만 허용됩니다. (0/20)"
                  onChange={this.handleInputData}
                />
                <Message
                  warning
                  style={
                    this.state.error_msg.valid_name !== ""
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <Message.Header>경고</Message.Header>
                  <p>{this.state.error_msg.valid_name}</p>
                </Message>
              </Form.Field>
            </Form>

            <h4 className="ui dividing header"> </h4>

            <Form size="large">
              <Form.TextArea
                width={13}
                name="content"
                label="컨테이너 설명"
                placeholder="컨테이너 설명을 입력해주세요. 0/100"
                onChange={this.handleInputData}
              />
              <Message
                warning
                style={
                  this.state.error_msg.valid_content !== ""
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <Message.Header>경고</Message.Header>
                <p>{this.state.error_msg.valid_content}</p>
              </Message>
            </Form>

            <h4 className="ui dividing header"> </h4>

            <Form size="large">
              <Form.Group inline>
                <label>템플릿</label>
                <Form.Radio
                  label="기본 템플릿"
                  name="group3"
                  value="non"
                  checked={this.state.group3 === "non"}
                  onChange={this.handleChange}
                />
                <Form.Radio
                  label="Git"
                  name="group3"
                  value="git"
                  checked={this.state.group3 === "git"}
                  onChange={this.handleChange}
                />
                <Input
                  style={
                    this.state.group3 === "non"
                      ? { display: "none" }
                      : { display: "inline" }
                  }
                  id="name"
                  name="name"
                  placeholder="Git repository (ex. https://github.com/banhart123/dnw-ojt-ide.git)"
                  onChange={this.inputGitRep}
                />
                {/* <Button size="large" style={{marginLeft: "5px"}} onClick={this.getCheckGitRep}>
                  <Icon name="check"/> 체크
                </Button> */}
              </Form.Group>
            </Form>

            <h4 className="ui dividing header"> </h4>

            <Form size="large">
              <Form.Group inline>
                <label>소프트웨어 스택</label>
              </Form.Group>
              <div className="icon-items">
                <a className="icon-item">
                  <img
                    className="icons"
                    name="java"
                    alt="java_image"
                    src={java_icon}
                    style={
                      this.state.imageClicked === "java"
                        ? { background: "#DBFFD5", border: "solid 0.3em" }
                        : { background: "#F2F3F7" }
                    }
                    width="100"
                    height="100"
                    onClick={this.imageClick}
                  />
                </a>
                <a className="icon-item">
                  <img
                    className="icons"
                    name="node"
                    alt="node_img"
                    src={node_icon}
                    style={
                      this.state.imageClicked === "node"
                        ? { background: "#DBFFD5", border: "solid 0.3em" }
                        : { background: "#F2F3F7" }
                    }
                    width="100"
                    height="100"
                    onClick={this.imageClick}
                  />
                </a>
              </div>
              <DetailPanel imageClicked={this.state.imageClicked} />
            </Form>

            <h4 className="ui dividing header"> </h4>

            <Form size="large">
              <Form.Group inline>
                <label>추가 모듈/패키지</label>
                <Form.Checkbox
                  label="Mysql 설치"
                  onClick={this.handlePkgChange}
                  value="1"
                ></Form.Checkbox>
              </Form.Group>
            </Form>
          </Segment>
          <Button
            style={{ float: "right" }}
            color="blue"
            content="컨테이너 생성"
            size="large"
            onClick={this.handleConfirm}
          />
          <Modal basic open={this.state.isError} size="small">
            <Header icon>
              <Icon name="warning circle" />
              Error Messages
            </Header>
            <Modal.Content>
              <p>컨테이너 생성중 오류가 발생했습니다.</p>
              <p>{this.state.error_msg.valid_name}</p>
              <p>{this.state.error_msg.valid_content}</p>
              {this.state.input_data.name === "" ? (
                <p>컨테이너 이름이 공백입니다.</p>
              ) : (
                <p></p>
              )}
              {this.state.valid_name_duple === true ? (
                <p>중복된 컨테이너 이름이 존재합니다.</p>
              ) : (
                <p></p>
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button inverted onClick={this.handleError}>
                확인
              </Button>
            </Modal.Actions>
          </Modal>
        </div>
      </div>
    );
  }
}

export default withRouter(MasterPanel);
