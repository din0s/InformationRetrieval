import "./Results.scss";

import { useCallback, useEffect, useState } from "react";
import SearchForm from "../../components/searchform/SearchForm";
import { useQuery } from "../../useQuery";

const Results = () => {
  const q = useQuery().get("q");
  const [results, setResults] = useState({});
  const [positives, setPositives] = useState([]);
  const [negatives, setNegatives] = useState([]);

  const fetchData = useCallback(async () => {
    const response = await fetch("/api/results?" + new URLSearchParams({ q }));
    const json = await response.json();
    setResults(json.result);
  }, [q]);

  useEffect(() => fetchData(), [fetchData]);

  const getDisplayURL = (url) => {
    const result = url.replace(/https?:\/\//, "").replace("www.", "");
    const index = result.lastIndexOf("/") + 1;
    return result.substring(0, index);
  };

  const modifyList = (_id, list) => {
    if (!list.includes(_id)) {
      return [...list, _id];
    } else {
      return removeFromList(_id, list);
    }
  };

  const removeFromList = (_id, list) => {
    return list.filter((i) => i !== _id);
  };

  const upvoteResult = (_id) => {
    setPositives((p) => modifyList(_id, p));
    setNegatives((n) => removeFromList(_id, n));
  };

  const downvoteResult = (_id) => {
    setNegatives((n) => modifyList(_id, n));
    setPositives((p) => removeFromList(_id, p));
  };

  const postFeedback = async () => {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: q,
        positives,
        negatives,
      }),
    });

    const json = await res.json();
    setResults(json.result);
    setPositives([]);
    setNegatives([]);
  };

  return (
    <div className="Results">
      <span>
        <SearchForm />
        {(positives.length !== 0 || negatives.length !== 0) && (
          <button onClick={postFeedback}>Update query</button>
        )}
      </span>
      <ul className="Results-list">
        {results.length === 0 && (
          <li key="none">
            <p className="Results-content" children={"No results"} />
          </li>
        )}
        {Object.keys(results).map((index) => {
          const { _id, url, title, summary } = results[index];
          const isUp = positives.includes(_id);
          const isDown = negatives.includes(_id);

          return (
            <li key={_id}>
              <div className="Results-arrows">
                <i
                  className={`Results-arrows_up${isUp ? "_pressed" : ""}`}
                  children={"⏶"}
                  onClick={() => upvoteResult(_id)}
                />
                <i
                  className={`Results-arrows_down${isDown ? "_pressed" : ""}`}
                  children={"⏷"}
                  onClick={() => downvoteResult(_id)}
                />
              </div>
              <div className="Results-item">
                <a
                  className="Results-link"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p children={getDisplayURL(url)} />
                  <h4 children={title} />
                </a>
                <p className="Results-content" children={summary} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Results;
