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
    target: null,
    action: null
  };
  
  // DOM 마운트 후
  componentDidMount() {
    this.setState({
      loadOfDatas : true
    });
    this._getContainer();
  }

  // 컨테이너 조회
  _getContainer = async () => {
    const res = await axios.post("/api/search", {userId : window.localStorage.getItem("user_id")});
    var arr = [];

    for (let element of res.data.container) {
      let info = await axios.get("/containers/" + element.container_id + "/json");
      arr.push(info.data.State.Running);
    }
    console.log(res.data.container);
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
  handleStopAndDelete = async (e) => {
    let data = this.state.container[this.state.target];
    this.setState({ loadOfDatas: true, open: false});

    // 컨테이너 정지 후 제거
    try {
      await axios({
        method:"post",
        url: "/containers/" + data.container_id + "/exec",
        data: {
          Env: [
            "GIT_REP=",
            "MYSQL="
          ]  
        }
      });

      await axios.post("/containers/" + data.container_id + "/stop");
      
      if(this.state.action === "delete"){
        await axios.delete("/containers/" + data.container_id);
      }
    } catch (e) {
      console.log(e);
    } finally {
      if(this.state.action === "delete"){
        await axios.post("/api/delete", data);
      }
      await this._getContainer();
    }
  };

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
            window.open("http://es2.danawa.io:3333/" + window.localStorage.getItem("user_id") + "/" + item.port +"/?folder=/home/danawa/" + (item.tmlt_dtl !== 'non' ? item.tmlt_dtl : (item.stack_cd === "java" ? "spring-boot-helloworld" : "node-js-sample")), "_blank");
          }.bind(this), 8000)
        } else {
          window.open("http://es2.danawa.io:3333/" + window.localStorage.getItem("user_id") + "/" + item.port +"/?folder=/home/danawa/" + (item.tmlt_dtl !== 'non' ? item.tmlt_dtl : (item.stack_cd === "java" ? "spring-boot-helloworld" : "node-js-sample")), "_blank");
        }
      } 
    } catch (e) {
      console.log(e);
    }
  }


  handleCancel = () => this.setState({open: false, loadOfDatas: false });
  show = (e) => {this.setState({ open: true, target : e.target.value, action : e.target.name}); } 

  render() {
    var containerList = [];
    
    if(this.state.container !== null) {
      containerList = this.state.container.map((item, i) => ( 
        <div
            className="card_grid"
            key={i}
          >
            <Card className="container">
              <Card.Content header={item.container_nm} />

              <Card.Content
                id="card"
                meta= {"생성일시 : " + item.insert_dts.substring(0, 10) + " " + item.insert_dts.substring(11, 16)}
                description={item.note_txt}
              />
              <Card.Content extra>
                <Label className="container-text-lang" color="teal">
                  언어
                  <Label.Detail>{item.stack_cd}</Label.Detail>
                </Label>
                <Label className="container-text-zone" color="green" style={this.state.container_status[i] === true ? {display:"block"} : {display:"none"}}>
                  상태
                  <Label.Detail>Running</Label.Detail>
                </Label>
                <Label className="container-text-zone" color="red" style={this.state.container_status[i] === true ? {display:"none"} : {display:"block"}}>
                  상태
                  <Label.Detail>Stop</Label.Detail>
                </Label>              

                <Button
                  className="content-button"
                  content="▶ 터미널 실행"
                  color="black"
                  value={i}
                  onClick={this.startContainer}
                ></Button>
                <Button icon className="content-button-stop" color="grey" name="stop" value={i} onClick={this.show}>정지</Button>
              </Card.Content>
              <Button
                color="blue"
                className="delete-button"
                name="delete"
                content="삭제"
                size="mini"
                value={i}
                onClick={this.show}
              />
              <Confirm
                open={this.state.open}
                header={this.state.action == "delete" ? "컨테이너 삭제" : "컨테이너 정지"}
                content={this.state.action == "delete" ? "컨테이너를 삭제하시겠습니까?" : "컨테이너를 정지하시겠습니까?"}
                cancelButton="취소"
                confirmButton= {this.state.action == "delete" ? "삭제" : "정지"}
                onCancel={this.handleCancel}
                onConfirm= {this.handleStopAndDelete}
              />
            </Card>
          </div>
      ));
    }

    return (
      <div className="DetailPanel">
        <div className="container-header">
          <h3>Container
          <Link to={{pathname : '/newContainer', state : this.state}}>
            <Button
              className="Navigate-right-button"
              color="grey"
            ><Icon name="add"/> NEW</Button>
          </Link>
          </h3>
        </div>

        <Dimmer active={this.state.loadOfDatas}>
          <Loader></Loader>
        </Dimmer>
        
        {containerList}

        <Link to={{pathname : '/newContainer', state : this.state}}>          
          <div className="content">
            <h4 className="content-text">
              Create More..
            </h4>
            <img src={img} width="290" height="300" alt="새 컨테이너" />
          </div>
        </Link>
      </div>
    );
  }
}

export default DetailPanel;
