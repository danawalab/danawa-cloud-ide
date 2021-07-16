import React, { Component } from "react";
import "./MasterPanel.css";
import DetailPanel from "../DetailPanel/DetailPanel.js";
import { withRouter } from "react-router-dom";
import {
  Form,
  Segment,
  Button,
  Message,
  Dimmer,
  Loader,
  Input,
  List,
  Transition,
  Radio,
} from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import java_icon from "./images/java_logo.svg";
import node_icon from "./images/node_js_logo.svg";
import axios from "axios";
import CryptoAES from 'crypto-js/aes';
import CryptoENC from 'crypto-js/enc-utf8';


// 도커를 통한 신규 컨테이너 생성 및 실행
async function createContainer(user_id, key, state) {
  let c_id;
  let pickImage = state.imageClicked;
  let useMysql = state.pkg_1;

  //컨테이너 라벨링
  var default_label = {
      "traefik.code-server.frontend.rule": "HostRegexp:es2.danawa.io,{subdomain:" + user_id + "-" + key + "}.es2.danawa.io",
      "traefik.code-server.port": "3333",
      "traefik.enable": "true",
      "traefik.passHostHeader": "true",
  }

  for(let i = 1; i < 5; i++){
    if(state[i] !== undefined){
      if(state[i].enable === true){
        default_label["traefik.test-server" + i +".frontend.rule"] = "HostRegexp:es2.danawa.io,{subdomain:" + user_id + "-" + key + "}.es2.danawa.io;PathPrefixStrip:/my_app" + i
        default_label["traefik.test-server"+ i +".port"] = state[i].port
      }
    }
  }

  try {
    let newContainer = await axios({
      method: "post",
      url: "/containers/create",
      data: {
        Hostname: "test",
        Image:
          pickImage === "java"
            ? "dcr.danawa.io/java_spring_vscode:latest" // 트래픽과 같은 포트 사용할것
            : "dcr.danawa.io/nodejs_vscode:latest",
        ExposedPorts: {},
        Labels: default_label,
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

      var rep = state.git.repo;
      
      if(state.group3 !== "non" && state.isPub === "false"){
        let gitPassword = state.git.repo_password 
        var bytes = CryptoAES.decrypt(gitPassword.toString(), 'secret key');
        var originalText = bytes.toString(CryptoENC);
    
        rep = [rep.slice(0, 8), state.git.repo_id + ":" + originalText + "@", rep.slice(8)].join('');
      } 

      var data = await axios({
        method: "post",
        url: "/containers/" + c_id + "/exec",
        data: {
          AttachStdin: false,
          AttachStdout: true,
          AttachStderr: true,
          Tty: false,
          Cmd: [
            "sh",
            "-c",
            "git clone " +
              (rep !== ""
                ? rep
                : pickImage === "java"
                ? "https://github.com/banhart123/spring-boot-helloworld.git"
                : "https://github.com/heroku/node-js-sample.git") +
              (useMysql === "no"
                ? ""
                : "&& git clone https://github.com/mysqljs/mysql.git"),
          ],
        },
      });

      await axios({
        method: "post",
        url: "/exec/" + data.data.Id + "/start",
        data: {
          Detach: true,
          Tty: false,
        },
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
      tmpl_dtl:
        state.group3 === "non"
          ? state.group3
          : state.git.repo.split("/")[4].replace(".git", "").trim(),
      stack_cd: state.imageClicked,
      pkg_1: state.pkg_1,
      port: port,
      ext_port_1: state[1] !== undefined ? (state[1].enable === true ? state[1].port : "") : "",
      ext_port_2: state[2] !== undefined ? (state[2].enable === true ? state[2].port : "") : "",
      ext_port_3: state[3] !== undefined ? (state[3].enable === true ? state[3].port : "") : "",
      ext_port_4: state[4] !== undefined ? (state[4].enable === true ? state[4].port : "") : "",
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

const users = ["0", "1", "2", "3", "4"];

class MasterPanel extends Component {
  state = {
    group1: "kor",
    group3: "non",
    isPub: "true",
    imageClicked: "java",
    loadOfDatas: false,
    result: "",
    pkg_1: "no",
    port: null,
    input_data: {
      name: "",
      content: "",
    },
    valid_name_duple: false,
    error_msg: {
      valid_name: "",
      valid_content: "",
    },
    git: {
      repo_id: "",
      repo_password: "",
      repo: "",
      repo_msg: "",
    },
    user_id: "",
    connect_urls: users.slice(0, 1),
    0: {
      port: 3333,
      enable: true,
    },
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

    let con_key = Math.random().toString(36).substr(2, 5);

    var chk = await duplechk(this.state);

    if (chk.data.count > 0) {
      this.setState({
        result: "no",
        loadOfDatas: false,
        valid_name_duple: true,
        error_msg: {
          valid_name: "중복된 컨테이너 이름이 존재합니다.",
          valid_content: this.state.error_msg.valid_content,
        },
      });
    }

    if (
      chk.data.count === 0 &&
      this.state.error_msg.valid_content === "" &&
      this.state.error_msg.valid_name === "" &&
      this.state.input_data.name !== "" &&
      (this.state.group3 === "non" ||
        (this.state.group3 !== "non" &&
          this.state.git.repo !== "" &&
          this.state.git.repo !== undefined))
    ) {
      insertTable(
        await createContainer(
          window.localStorage.getItem("user_id"),
          con_key,
          this.state
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
      });

      if (this.state.input_data.name === "") {
        this.setState({
          error_msg: {
            valid_name: "컨테이너 이름이 공백입니다.",
            valid_content: this.state.error_msg.valid_content,
          },
        });
      }

      if (this.state.group3 !== "non" && this.state.git.repo === "") {
        this.setState({
          git: {
            repo: "",
            repo_msg: "GIT 리포지토리를 입력해주세요.",
            repo_id: this.state.git.repo_id,
            repo_password: this.state.git.repo_password,
          },
        });
      }

      if(this.state.isPub === "false" && this.state.git.repo_password === "") {        
        this.setState({
          git: {
            repo: "",
            repo_msg: "GIT 비밀번호를 입력해주세요",
            repo_id: this.state.git.repo_id,
            repo_password: this.state.git.repo_password,
          },
        });
      }

      if(this.state.isPub === "false" && this.state.git.repo_id === "") {
        this.setState({
          git: {
            repo: "",
            repo_msg: "GIT 아이디를 입력해주세요",
            repo_id: this.state.git.repo_id,
            repo_password: this.state.git.repo_password,
          },
        });
      }
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
        repo_id: this.state.git.repo_id,
        repo_password: this.state.git.repo_password,
        repo: e.target.value,
        repo_msg: "",
      },
    });
  };

  // 깃리포지토리 작성
  inputGitRepId = (e) => {
    this.setState({
      git: {
        repo_id: e.target.value,
        repo_password: this.state.git.repo_password,
        repo: this.state.git.repo,
        repo_msg: "",
      },
    });
  };

  // 깃리포지토리 작성
  inputGitRepPassword = (e) => {
    this.setState({
      git: {
        repo_id: this.state.git.repo_id,
        repo_password: CryptoAES.encrypt(e.target.value, 'secret key'),
        repo: this.state.git.repo,
        repo_msg: "",
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

  handleAdd = () =>
    this.setState((prevState) => ({
      connect_urls: users.slice(0, prevState.connect_urls.length + 1),
    }));

  handleRemove = () =>
    this.setState((prevState) => ({
      connect_urls: prevState.connect_urls.slice(0, -1),
    }));

  handleUrl = (e) => {
    this.setState({
      [e.target.name]: {
        port: e.target.value,
        enable:
          this.state[e.target.name] === undefined
            ? false
            : this.state[e.target.name].enable,
      },
    });

    console.log(this.state);
  };

  setUrl = (e, k) => {
    var id = k.name;

    if (this.state[id] !== undefined && this.state[id].port !== "") {
      this.setState({
        [k.name]: {
          port: this.state[id].port,
          enable:
            this.state[id].enable === undefined
              ? true
              : this.state[id].enable === true
              ? false
              : true,
        },
      });
    }
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
              <Form.Field>
                <label htmlFor="name">컨테이너 이름</label>
                <Form.Field
                  control="input"
                  id="name"
                  name="name"
                  placeholder="영어 혹은 숫자, 하이픈(-_)만 허용됩니다. (0/20)"
                  onChange={this.handleInputData}
                  error={this.state.error_msg.valid_name !== "" ? true : false}
                />
                <Message
                  error
                  style={
                    this.state.error_msg.valid_name !== ""
                      ? { display: "block" }
                      : { display: "none" }
                  }
                >
                  <Message.Header>Warnning</Message.Header>
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
                error={this.state.error_msg.valid_content !== "" ? true : false}
              />
              <Message
                error
                style={
                  this.state.error_msg.valid_content !== ""
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <Message.Header>Warnning</Message.Header>
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
              </Form.Group>
              <Form.Group inline>
              <Form.Radio
                  label="Public"
                  style={
                    this.state.group3 === "non"
                      ? { display: "none" }
                      : { display: "inline" }
                  }
                  name="isPub"
                  value="true"
                  checked={this.state.isPub === "true"}
                  onChange={this.handleChange}
                />
                <Form.Radio
                  label="Private"
                  style={
                    this.state.group3 === "non"
                      ? { display: "none" }
                      : { display: "inline" }
                  }
                  name="isPub"
                  value="false"
                  checked={this.state.isPub === "false"}
                  onChange={this.handleChange}
                />
                <Form.Field
                  control="input"
                  style={
                    this.state.group3 !== "non" && this.state.isPub === "false"
                      ? { display: "inline" }
                      : { display: "none" }
                  }
                  id="git-input"
                  placeholder="Git ID"
                  onChange={this.inputGitRepId}
                  error={
                    this.state.isPub === "false" && this.state.git.repo_msg !== "" ? true : false
                  }
                />
                <Form.Field
                  control="input"
                  style={
                    this.state.group3 !== "non" && this.state.isPub === "false"
                      ? { display: "inline" }
                      : { display: "none" }
                  }
                  id="git-input"
                  type="password"
                  placeholder="Git Password"
                  onChange={this.inputGitRepPassword}
                  error={
                    this.state.isPub === "false" && this.state.git.repo_msg !== "" ? true : false
                  }
                />              
              <Form.Field
                  control="input"
                  style={
                    this.state.group3 === "non"
                      ? { display: "none" }
                      : { display: "inline" }
                  }
                  id="git-input_rep"
                  placeholder="(ex. https://github.com/banhart123/dnw-ojt-ide.git)"
                  onChange={this.inputGitRep}
                  error={
                    this.state.group3 !== "non" &&
                    this.state.git.repo_msg !== ""
                      ? true
                      : false
                  }
                />
                <div>
                  <Message
                    error
                    style={
                      this.state.group3 !== "non" &&
                      this.state.git.repo_msg !== ""
                        ? { display: "block", marginLeft: "20px" }
                        : { display: "none" }
                    }
                  >
                    <Message.Header>Warnning</Message.Header>
                    <p>{this.state.git.repo_msg}</p>
                  </Message>
                </div>
                {/* <Button size="large" style={{marginLeft: "5px"}} onClick={this.getCheckGitRep}>
                  <Icon name="check"/> 체크
                </Button> */}
                </Form.Group>
            </Form>

            <h4 className="ui dividing header"> </h4>

            <Form size="large">
              <Form.Group inline>
                <label>서버 실행 포트</label>
                <Button.Group>
                  <Button
                    size="tiny"
                    disabled={this.state.connect_urls.length === 1}
                    icon="minus"
                    onClick={this.handleRemove}
                  />
                  <Button
                    size="tiny"
                    disabled={this.state.connect_urls.length === users.length}
                    icon="plus"
                    onClick={this.handleAdd}
                  />
                </Button.Group>
              </Form.Group>
              <Transition.Group as={List} duration={200} verticalAlign="middle">
                {this.state.connect_urls.map((item) => (
                  <List.Item key={item}>
                    <Segment compact>
                      <Input
                        size="mini"
                        type="number"
                        name={item}
                        style={{ width: "25%" }}
                        label={
                          "http://[유저아이디]:[KEY].es2.danawa.io/" +
                          (item !== "0" ? "my_app" + item : "")
                        }
                        onChange={this.handleUrl}
                        disabled={item === "0" ? true : false}
                        placeholder="80~65000"
                        defaultValue={item === "0" ? "3333" : ""}
                      ></Input>
                      <Radio
                        label="적용"
                        name={item}
                        style={{ float: "right" }}
                        toggle
                        disabled={item === "0" ? true : false}
                        onChange={this.setUrl}
                        checked={
                          this.state[item] === undefined
                            ? false
                            : this.state[item].enable
                        }
                      />
                    </Segment>
                  </List.Item>
                ))}
              </Transition.Group>
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
        </div>
      </div>
    );
  }
}

export default withRouter(MasterPanel);
