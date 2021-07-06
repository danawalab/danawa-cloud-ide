import React, { Component } from "react";
import "./DetailPanel.css";
import { Button, Label, Card, Dimmer, Loader } from "semantic-ui-react";
import img from "./images/create_container.svg";
import { Link } from "react-router-dom";
import axios from "axios";

class DetailPanel extends Component {
  state = {
    container: null,
    loadOfDatas: false,
    userId: window.localStorage.getItem("user_id"),
    port: null
  };
  
  // DOM 마운트 후
  componentDidMount() {
    this._getContainer();
  }

  // 컨테이너 조회
  _getContainer = async () => {
    const res = await axios.post("/api/search", {userId : window.localStorage.getItem("user_id")});
    console.log(res);
    this.setState({ container: res.data.container, loadOfDatas: false});
  };

  // state 변경사항 있을때 다시 그리기 여부
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.container !== this.state.container) {
      // 삭제 후 다시 그리기
      return true;
    } else if (nextState.loadOfDatas !== this.state.loadOfDatas) {
      // 로딩창 다시 그리기
      return true;
    } else {
      return false;
    }
  }

  // 컨테이너 삭제
  handleDelete = async (e) => {
    let data = this.state.container[e.target.value];
    this.setState({ loadOfDatas: true });

    // 컨테이너 정지 후 제거
    try {
      await axios.post("/containers/" + data.container_id + "/stop");
      await axios.delete("/containers/" + data.container_id);
    } catch (e) {
      console.log(e);
    } finally {
      await axios.post("/api/delete", data);
      await this._getContainer();
    }
  };

  render() {
    var containerList = []; 
    
    if(this.state.container !== null) {
      containerList = this.state.container.map((item, i) => (
        <div
            className="inner-content"
            key={i}
          >
            <Card className="container">
              <Card.Content header={item.container_nm} />
              <Card.Content
                id="card"
                description={item.note_txt}
              />
              <Card.Content extra>
                <Label className="container-text-lang" color="teal">
                  Language
                  <Label.Detail>{item.stack_cd}</Label.Detail>
                </Label>
                <Label className="container-text-zone" color="yellow">
                  Region
                  <Label.Detail>대한민국</Label.Detail>
                </Label>
                <Button
                  className="content-button"
                  content="▶ 터미널 실행"
                  color="black"
                  onClick={() => window.open("http://localhost/" + window.localStorage.getItem("user_id") + "/" + item.port +"/", "_blank")}
                ></Button>
              </Card.Content>
              <Button
                color="blue"
                className="delete-button"
                content="삭제"
                size="mini"
                value="0"
                onClick={this.handleDelete}
              />
            </Card>
          </div>
      ));
    }

    return (
      <div className="DetailPanel">
        <h3>컨테이너</h3>
        
        <Link to={{pathname : '/newContainer', state : this.state}}>
          <Button
            className="Navigate-right-button"
            color="grey"
            content="+ 새 컨테이너"
          />
        </Link>

        <Dimmer active={this.state.loadOfDatas}>
          <Loader></Loader>
        </Dimmer>
        
        {containerList}

        <Link to={{pathname : '/newContainer', state : this.state}}>          
          <div className="content">
            <h4 className="content-text">
              Create More..
            </h4>
            <img src={img} width="300" height="300" alt="새 컨테이너" />
          </div>
        </Link>
      </div>
    );
  }
}

export default DetailPanel;
