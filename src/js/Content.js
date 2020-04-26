import React from "react";
import Table from "./Table";
import Form from "./Form";

class Content extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: "0 5vw",
          width: "35vw"
        }}
      >
        <h1>{this.props.title}</h1>
        <h2>{this.props.date}</h2>

        <Table candidates={this.props.candidates} />
        <hr />
        {!this.props.hasVoted ? (
          <Form
            candidates={this.props.candidates}
            castVote={this.props.castVote}
          />
        ) : null}
      </div>
    );
  }
}

export default Content;
