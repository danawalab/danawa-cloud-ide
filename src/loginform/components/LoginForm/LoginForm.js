import React, { Component } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Icon,
  Message,
  Segment,
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class LoginForm extends Component {
  render() {
    return (
      <div>
        <Grid
          textAlign="center"
          style={{ height: "100vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="black" textAlign="center">
              <Icon name="cloud" />
            </Header>
            <Form size="large">
              <Segment stacked>
                <Form.Input
                  fluid
                  icon="user"
                  iconPosition="left"
                  placeholder="아이디"
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="비밀번호"
                  type="password"
                />
                <Button color="grey" fluid size="large">
                  로그인
                </Button>
              </Segment>
            </Form>
            <Message>
              <Link to={{ pathname: "/join" }}>
                <h4>회원 신규 등록</h4>
              </Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default LoginForm;
