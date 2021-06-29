import React from "react";
import {
  Divider,
  Form,
  Message,
  Segment,
  Button,
  Grid,
} from "semantic-ui-react";
import axios from "axios";

function insertUserInfo(state) {
  axios({
    method: "post",
    url: "/api/join",
    headers: { "Content-Type": "application/json" },
    data: {
      user_id: state.user_id,
      user_pwd: state.user_pwd
    },
  });
}

class JoinForm extends React.Component {
  state = {
    user_id: "",
    user_pwd: "",
    loadOfDatas: false,
  };

  handleId = (e) => {
    this.setState({
      user_id: e.target.value,
    });
  };

  handlePwd = (e) => {
    this.setState({
      user_pwd: e.target.value,
    });
  };

  handleJoin = (e) => {
    insertUserInfo(this.state);
  };

  render() {
    return (
    <div>
      <Grid
        textAlign="center"
        style={{ height: "70vh" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ textAlign: "left", maxWidth: 700 }}>
          <Divider hidden />
          <Message info style={{ textAlign: "center" }}>
            <Message.Header>회원 가입 양식</Message.Header>
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
              <Button type="submit" onClick={this.handleJoin}>
                가입하기
              </Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
    );
  }
}

export default JoinForm;
