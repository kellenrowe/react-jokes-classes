import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import useLocalStorage from "./useLocalStorage";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useLocalStorage("jokes", []);
  const [isLoading, setIsLoading] = useState(true);

  /* at mount, get jokes */
  useEffect(
    function getJokesOnMount() {
      /* retrieve jokes from API */
      async function getJokes() {
        try {
          // load jokes one at a time, adding not-yet-seen jokes
          let newJokes = [...jokes];
          console.log("newJokes = ", newJokes);
          console.log("jokes = ", jokes);

          let seenJokes = new Set();

          while (newJokes.length < numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com", {
              headers: { Accept: "application/json" },
            });
            let { ...joke } = res.data;

            if (!seenJokes.has(joke.id)) {
              seenJokes.add(joke.id);
              newJokes.push({ ...joke, votes: 0, locked: false });
            } else {
              console.log("duplicate found!");
            }
          }
          setJokes(newJokes);
          setIsLoading(false);
        } catch (err) {
          console.error(err);
        }
      }
      if (isLoading && jokes.length < numJokesToGet) getJokes();
      setIsLoading(false);
    },
    [isLoading, numJokesToGet]
  );

  /* empty joke list, set to loading state to true */
  function generateNewJokes() {
    setJokes(jokes.filter((j) => j.locked));
    setIsLoading(true);
  }

  /* change vote for this id by delta (+1 or -1) */
  function vote(id, delta) {
    setJokes((jokes) =>
      jokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    );
  }

  function toggleLock(id) {
    setJokes((jokes) =>
      jokes.map((j) => (j.id === id ? { ...j, locked: !j.locked } : j))
    );
  }

  /* Either loading spinner or list of sorted jokes. */
  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {sortedJokes.map((j) => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
          locked={j.locked}
          toggleLock={toggleLock}
        />
      ))}
    </div>
  );
}

export default JokeList;
