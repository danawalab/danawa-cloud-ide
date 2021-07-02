import React, { Component } from "react";
import "./DetailPanel.css";
import { Dropdown, Label, Form } from "semantic-ui-react";

const temp_options = [
  {
    name: "java",
    temp_content: [
      { text: "Java 기본 프로젝트", value: 1},
    ],
    os_content: [{text: "Ubuntu 18.04 LTS", value: 1 }],
  },
  {
    name: "node",
    temp_content: [
      { text: "Node.js 기본 프로젝트", value: 1 },
    ],
    os_content: [
      { text: "Ubuntu 18.04 LTS", value: 1 },
    ],
  }
];

class DetailPanel extends Component {
  state = {
    image: this.props.imageClicked.image,
    temp_options: temp_options,
  };

  render() {
    return (
      <div className="detail-body">
          <Form.Field inline id="detail-template-drop">
            <label>Template</label>
            <Dropdown
              className="dropdown"
              clearable
              selection
              options={
                temp_options.find((t) => t.name === this.props.imageClicked)
                  .temp_content
              }
              placeholder='템플릿을 선택하세요'
              defaultValue={1}
            />
          </Form.Field>
           <Form.Field inline id="detail-template-drop">
            <label>OS</label>
            <Dropdown
              className="dropdown"
              clearable
              selection
              options={
                temp_options.find((t) => t.name === this.props.imageClicked)
                  .os_content
              }
              defaultValue={1}
              placeholder='OS를 선택하세요'
            />
          </Form.Field>
          <Form.Field inline id="detail-template-content">
            <div
              style={
                this.props.imageClicked === "java"
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <Label size="large">
                Java
                <Label.Detail>11</Label.Detail>
              </Label>
              <Label size="large">
                Gradle
                <Label.Detail>5.4.1</Label.Detail>
              </Label>
            </div>
            <div
              style={
                this.props.imageClicked === "node"
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <Label size="large">
                Node.js
                <Label.Detail>10.16.3</Label.Detail>
              </Label>
              <Label size="large">
                Nodejs for vscode plugin
                <Label.Detail>1.9.11</Label.Detail>
              </Label>
            </div>
          </Form.Field>
      </div>
    );
  }
}

export default DetailPanel;
