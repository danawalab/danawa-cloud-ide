import React, { Component } from 'react';
import './SideBar.css';
import { Progress, Label, Icon } from 'semantic-ui-react'

class SideBar extends Component {
    state = {
        id : this.props.userId.userId,
        ctnr : this.props.arr
    };
    
    render() {
        var total_num = 0;
        var run_num = 0;


        if(window.localStorage.getItem("container_info") !== null){
            var total = window.localStorage.getItem("container_info").split(',');

            if(total[0] !== "" && total !== undefined && total !== null){
                total_num = total.length;
            }

            
            if(total_num > 0){
                total.forEach(each => {
                    if(each === "true"){
                        run_num++; 
                    }
                });
            }
        }

        return (
            <div className="SideBar">                
                <Label size="huge" >
                    <Icon name='user' /> {window.localStorage.getItem("user_id")}
                </Label>
                <h2>내 컨테이너 정보</h2>
                <h3>생성된 컨테이너</h3>
                <Progress size="large" value={total_num} total='10' progress='ratio' />
                <h3>실행중인 컨테이너</h3>
                <Progress size="large" value={run_num} color="blue" total='10' progress='ratio' />
            </div>
        );
    }
}

export default SideBar;