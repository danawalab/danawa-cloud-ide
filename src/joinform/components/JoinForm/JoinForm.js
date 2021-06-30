import React from "react";
import {
  Divider,
  Form,
  Message,
  Segment,
  Button,
  Grid,
  Icon,
  Modal
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
      user_pwd: state.user_pwd
    },
  })
}

class JoinForm extends React.Component {
  state = {
    user_id: "",
    user_pwd: "",
    join_failMsg: "",
    join_accept: false,
  };

  handleId = (e) => {
    this.setState({
      user_id: e.target.value,
      join_failMsg: ""
    });
  };

  handlePwd = (e) => {
    this.setState({
      user_pwd: e.target.value,
      join_failMsg: ""
    });
  };

  handleJoin = async (e) => {
    var msg = await insertUserInfo(this.state);
    if(msg.data.errno === undefined || msg.status !== 200){
      console.log("회원가입 성공");
      this.setState({join_accept : true});
    } else {
      this.setState({join_failMsg : msg.data.code});
    }
      
  };

  handleModal = (e) => {
    const { history } = this.props;
    history.push({
      pathname: "/"
    });
  }

  render() {
    return (
    <div>
    <Modal
      open={this.state.join_accept}
      header='가입완료!'
      content='가입이 완료되었습니다. 생성된 아이디로 로그인 가능합니다.'
      actions={[{ key: 'done', content: '확인', positive: true }]}
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
                <input
                  onChange={this.handleId}
                  placeholder="알파벳으로 입력하시기 바랍니다."
                />
              </Form.Field>
              <Form.Field>
                <label>패스워드</label>
                <input
                  onChange={this.handlePwd}
                  type="password"
                  placeholder="패스워드"
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
          <Message style={this.state.join_failMsg === "" ? { display : "none" } :  { display : "block" } } negative>
            <Message.Header>회원가입 실패</Message.Header>
            <div>가입 계정을 확인해주세요 <div>{this.state.join_failMsg}</div></div>
          </Message>
        </Grid.Column>
      </Grid>
    </div>
    );
  }
}

export default withRouter(JoinForm);
