import React from "react";
import {
  Divider,
  Form,
  Message,
  Segment,
  Button,
  Grid,
  Icon,
  Modal,
} from "semantic-ui-react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";

async function insertUserInfo(state) {
  return await axios({
    method: "post",
    url: "/api/join",
    headers: { "Content-Type": "application/json" },
    data: {
      user_id: state.user_id,
      user_pwd: state.user_pwd,
      serialkey: state.serialkey,
    },
  });
}

class JoinForm extends React.Component {
  state = {
    user_id: "",
    user_pwd: "",
    join_failMsg: "",
    join_accept: false,
    user_pwd_double: "",
    serialkey: Math.random().toString(36).substr(2, 5)
  };

  handleId = (e) => {
    this.setState({
      user_id: e.target.value,
      join_failMsg: "",
    });
  };

  handlePwd = (e) => {
    this.setState({
      user_pwd: e.target.value,
      join_failMsg: "",
    });
  };

  handlePwdDouble = (e) => {
    this.setState({
      user_pwd_double: e.target.value,
      join_failMsg: "",
    });
  };

  handleJoin = async (e) => {
    var flag = true;
    
    if(this.state.user_id === ""){
      this.setState({ join_failMsg: "아이디가 공백입니다." });
      flag = false
    } 
    
    if(this.state.user_pwd === "") {
      this.setState({ join_failMsg: "패스워드가 공백입니다." });
      flag = false
    } 
    
    if(this.state.user_pwd !== this.state.user_pwd_double) {
      this.setState({ join_failMsg: "패스워드와 패스워드 확인이 일치하지 않습니다." });
      flag = false
    } 
    
    if(flag === true){
      var msg = await insertUserInfo(this.state);
      if (msg.data.errno === undefined || msg.status !== 200) {
        console.log("회원가입 성공");
        this.setState({ join_accept: true });
      } else {
        this.setState({ join_failMsg: msg.data.code });
      }
    }
  };

  handleModal = (e) => {
    const { history } = this.props;
    history.push({
      pathname: "/",
    });
  };

  render() {
    return (
      <div>
        <Modal
          open={this.state.join_accept}
          header="가입완료!"
          content="가입이 완료되었습니다. 생성된 아이디로 로그인 가능합니다."
          actions={[{ key: "done", content: "확인", positive: true }]}
          onClick={this.handleModal}
        />
        <Grid
          textAlign="center"
          style={{ height: "70vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ textAlign: "left", maxWidth: 700 }}>
            <Divider hidden />
            <Message info style={{ textAlign: "center" }}>
              <Message.Header>회원 가입</Message.Header>
            </Message>
            <Segment>
              <Form>
                <Form.Field>
                  <label>아이디</label>
                  <Form.Field
                    control="input"
                    onChange={this.handleId}
                    placeholder="알파벳으로 입력하시기 바랍니다."
                    error={this.state.join_failMsg.includes("아이디")}
                  />
                </Form.Field>
                <Form.Field>
                  <label>패스워드</label>
                  <Form.Field
                    control="input"
                    onChange={this.handlePwd}
                    type="password"
                    placeholder="패스워드"
                    error={this.state.join_failMsg.includes("패스워드")}
                  />
                </Form.Field>
                <Form.Field>
                  <label>패스워드 확인</label>
                  <Form.Field
                    control="input"
                    onChange={this.handlePwdDouble}
                    type="password"
                    placeholder="패스워드"
                    error={this.state.join_failMsg.includes("패스워드")}
                  />
                </Form.Field>
                <Link to={{ pathname: "/" }}>
                  <Button type="submit">
                    <Icon name="reply"></Icon>뒤로
                  </Button>
                </Link>
                <Button type="submit" onClick={this.handleJoin}>
                  가입하기
                </Button>
              </Form>
            </Segment>
            <Message
              style={
                this.state.join_failMsg === ""
                  ? { display: "none" }
                  : { display: "block" }
              }
              negative
            >
              <Message.Header>회원가입 실패</Message.Header>
              <div>
                <div>{this.state.join_failMsg}</div>
              </div>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default withRouter(JoinForm);
