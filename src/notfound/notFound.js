import React, { Component } from 'react';
import { Button, Form, Grid, Header, Icon } from 'semantic-ui-react'
import { Link } from "react-router-dom";

class notFoundPage extends Component {
    render() {
        return (
            <div>
                <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                    <Grid.Column style={{ maxWidth: 450 }}>
                    <Icon name='warning sign' size='massive' />
                    <Header as='h2' color='black' textAlign='center'>
                        해당 페이지를 찾을 수 없습니다.
                    </Header>
                    <Form size='large'>
                        <Link to={{ pathname: "/" }}>
                            <Button color='yellow' fluid size='large'>
                                로그인 화면으로 돌아가기
                            </Button>
                        </Link>
                    </Form>
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export {notFoundPage};