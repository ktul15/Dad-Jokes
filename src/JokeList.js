import React, { Component } from "react";
import Joke from "./Joke";
import "./JokeList.css";
import axios from "axios";
import uuid from "uuid/v4";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.joke));
    this.handleClick = this.handleClick.bind(this);
  }
  async componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" }
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuid(), joke: res.data.joke, votes: 0 });
        } else {
          console.log("duplicate" + newJoke);
        }
      }
      this.setState(
        st => ({
          loading: false,
          jokes: [...st.jokes, ...jokes]
        }),
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick() {
    this.setState({ loading: true }, () => this.getJokes());
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="Jokelist-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="Jokelist-title">Loading...</h1>
        </div>
      );
    } else {
      return (
        <div className="JokeList">
          <div className="JokeList-sidebar">
            <h1 className="JokeList-title">
              <span>Dad</span> Jokes
            </h1>
            <img />
            <button className="JokeList-getmore" onClick={this.handleClick}>
              New Jokes
            </button>
          </div>
          <div className="JokeList-jokes">
            {this.state.jokes.map(j => (
              <div>
                <Joke
                  votes={j.votes}
                  text={j.joke}
                  upvote={() => this.handleVote(j.id, 1)}
                  downvote={() => this.handleVote(j.id, -1)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
}

export default JokeList;
