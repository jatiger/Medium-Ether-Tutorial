import React from "react";
import ReactDOM from "react-dom";
import Web3 from "web3";
import TruffleContract from "truffle-contract";
import Debate1 from "../../build/contracts/Debate1.json";
import Debate2 from "../../build/contracts/Debate2.json";

import Content from "./Content";
import "bootstrap/dist/css/bootstrap.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      candidates: [],
      candidates2: [],
      hasVoted: false,
      loading: true,
      voting: false
    };

    if (typeof web3 != "undefined") {
      this.web3Provider = web3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }

    this.web3 = new Web3(this.web3Provider);

    this.debate1 = TruffleContract(Debate1);
    this.debate1.setProvider(this.web3Provider);
    this.debate2 = TruffleContract(Debate2);
    this.debate2.setProvider(this.web3Provider);

    this.castVote = this.castVote.bind(this);
    this.watchEvents = this.watchEvents.bind(this);
  }

  componentDidMount() {
    // TODO: Refactor with promise chain
    this.web3.eth.getCoinbase((err, account) => {
      this.setState({ account });
      this.debate1.deployed().then(debateInstance => {
        this.debateInstance = debateInstance;
        this.watchEvents();
        this.debateInstance.candidatesCount().then(candidatesCount => {
          for (var i = 1; i <= candidatesCount; i++) {
            this.debateInstance.candidates(i).then(candidate => {
              const candidates = [...this.state.candidates];
              candidates.push({
                id: candidate[0],
                name: candidate[1],
                voteCount: candidate[2]
              });
              this.setState({ candidates: candidates });
            });
          }
        });
        this.debateInstance.voters(this.state.account).then(hasVoted => {
          this.setState({ hasVoted, loading: false });
        });
      });

      this.debate2.deployed().then(debate2Instance => {
        this.debate2Instance = debate2Instance;
        this.watchEvents();
        this.debate2Instance.candidatesCount().then(candidatesCount => {
          for (var i = 1; i <= candidatesCount; i++) {
            this.debate2Instance.candidates(i).then(candidate => {
              const candidates2 = [...this.state.candidates2];
              candidates2.push({
                id: candidate[0],
                name: candidate[1],
                voteCount: candidate[2]
              });
              this.setState({ candidates2: candidates2 });
            });
          }
        });
        this.debate2Instance.voters(this.state.account).then(hasVoted => {
          this.setState({ hasVoted, loading: false });
        });
      });
    });
  }

  watchEvents() {
    // TODO: trigger event when vote is counted, not when component renders
    this.debateInstance
      .votedEvent(
        {},
        {
          fromBlock: 0,
          toBlock: "latest"
        }
      )
      .watch((error, event) => {
        this.setState({ voting: false });
      });
  }

  castVote(candidateId) {
    this.setState({ voting: true });
    this.debateInstance
      .vote(candidateId, { from: this.state.account })
      .then(result => this.setState({ hasVoted: true }));
  }

  render() {
    return (
      <div
        class="row"
        style={{
          width: "100%",
          height: "100%",
          padding: "5vh 0",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <h1 style={{}}>Presidential Election 2020:  Pick your Candidate</h1>
        <div
          class="col-lg-12 text-center"
          style={{ width: "100%", textAlign: "center" }}
        >
          <br />
          {this.state.loading || this.state.voting ? (
            <p class="text-center">Loading...</p>
          ) : (
            <div
              style={{
                width: "100vw",
                display: "flex",
                justifyContent: "center",
                flexDirection: "row",
                padding: "0 1vw"
              }}
            >
              <Content
                title="Republicans"
                date="Right Wing"
                candidates={this.state.candidates}
                hasVoted={this.state.hasVoted}
                castVote={this.castVote}
              />
              <Content
                title="Democracts"
                date="Left Wing"
                candidates={this.state.candidates2}
                hasVoted={this.state.hasVoted}
                castVote={this.castVote}
              />
            </div>
          )}
        </div>
        <p style={{ margin: "2vh 0" }}>Your account: {this.state.account}</p>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
