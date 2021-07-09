import React, { Component } from "react";
import "./DetailPanel.css";
import { Button, Label, Card, Dimmer, Loader, Confirm, Icon } from "semantic-ui-react";
import img from "./images/create_container.svg";
import { Link } from "react-router-dom";
import axios from "axios";

class DetailPanel extends Component {
  state = {
    container: null,
    container_status: null,
    loadOfDatas: false,
    userId: window.localStorage.getItem("user_id"),
    port: null,
    open: false,
    del_trgt: null,
  };
  
  // DOM 마운트 후
  componentDidMount() {
    this._getContainer();
  }

  // 컨테이너 조회
  _getContainer = async () => {
    const res = await axios.post("/api/search", {userId : window.localStorage.getItem("user_id")});
    console.log(res);
    var arr = [];

    for (let element of res.data.container) {
      let info = await axios.get("/containers/" + element.container_id + "/json");
      arr.push(info.data.State.Running);
    }

    console.log(arr);

    this.setState({ container: res.data.container, container_status : arr, loadOfDatas: false});
  };

  // state 변경사항 있을때 다시 그리기 여부
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.container !== this.state.container || nextState.loadOfDatas !== this.state.loadOfDatas || nextState.open !== this.state.open) {
      // 삭제 후 다시 그리기
      return true;
    } else {
      return false;
    }
  }

  // 컨테이너 삭제
  handleDelete = async (e) => {
    let data = this.state.container[this.state.del_trgt];
    this.setState({ loadOfDatas: true, open: false});

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

  // 컨테이너 정지
  stopContainer = async (e) => {
    let data = this.state.container[e.target.value];
    
    this.setState({ loadOfDatas: true});
    
    try {
      await axios.post("/containers/" + data.container_id + "/stop");
    } catch(e){
      console.log(e);
    } finally {
      await this._getContainer();
    }
  }

  // 컨테이너 실행
  startContainer = async(e) => {
    let item = this.state.container[e.target.value];

    try {
      // 컨테이너 상태 점검
      let info = await axios.get("/containers/" + item.container_id + "/json");

      if(info !== undefined){
        if(info.data.State.Running === false){
          this.setState({ loadOfDatas: true});
          await axios.post("/containers/" + item.container_id + "/start");
        
          setTimeout(function () {
            this._getContainer();
            window.open("http://es2.danawa.io:3333/" + window.localStorage.getItem("user_id") + "/" + item.port +"/?folder=/home/danawa/works/" +   (item.stack_cd === "java" ? "spring-boot-helloworld-master" : "node-js-sample-master") + item.tmlt_dtl === 'non' ? "/clone_space" : "", "_blank")
          }.bind(this), 8000)
        } else {
          window.open("http://es2.danawa.io:3333/" + window.localStorage.getItem("user_id") + "/" + item.port +"/?folder=/home/danawa/works/" + (item.stack_cd === "java" ? "spring-boot-helloworld-master" : "node-js-sample-master") + item.tmlt_dtl === 'non' ? "/clone_space" : "", "_blank")
        }
      } 
    } catch (e) {
      console.log(e);
    }
  }


  handleCancel = () => this.setState({open: false, loadOfDatas: false });
  show = (e) => { console.log(e.target.value); this.setState({ open: true, del_trgt : e.target.value}); } 

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
                  언어
                  <Label.Detail>{item.stack_cd}</Label.Detail>
                </Label>
                <Label className="container-text-zone" color="violet">
                  상태
                  <Label.Detail>{this.state.container_status[i] === true ? "Running" : "Stop"}</Label.Detail>
                </Label>
                <Button
                  className="content-button"
                  content="▶ 터미널 실행"
                  color="black"
                  value={i}
                  onClick={this.startContainer}
                ></Button>
                <Button icon className="content-button-stop" color="grey" value={i} onClick={this.stopContainer}>정지</Button>
              </Card.Content>
              <Button
                color="blue"
                className="delete-button"
                content="삭제"
                size="mini"
                value={i}
                onClick={this.show}
              />
              <Confirm
                open={this.state.open}
                header="컨테이너 삭제"
                content="컨테이너를 삭제하시겠습니까?"
                cancelButton="취소"
                confirmButton="삭제"
                onCancel={this.handleCancel}
                onConfirm={this.handleDelete}
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
