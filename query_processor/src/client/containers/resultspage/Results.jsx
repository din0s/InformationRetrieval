import "./Results.scss";

import { useCallback, useEffect, useState } from "react";
import SearchForm from "../../components/searchform/SearchForm";
import { useQuery } from "../../useQuery";

const Results = () => {
  const q = useQuery().get("q");
  const [results, setResults] = useState({});

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

  const upvoteResult = (index) => {};

  const downvoteResult = (index) => {};

  return (
    <div className="Results">
      <SearchForm />
      <ul className="Results-list">
        {results.length === 0 && (
          <li key="none">
            <p className="Results-content" children={"No results"} />
          </li>
        )}
        {Object.keys(results).map((index) => {
          const { url, summary } = results[index];
          return (
            <li key={index}>
              <span className="Results-arrows">
                <i
                  className="Results-arrows_up"
                  children={"⏶"}
                  onClick={() => upvoteResult(index)}
                />
                <i
                  className="Results-arrows_down"
                  children={"⏷"}
                  onClick={() => downvoteResult(index)}
                />
              </span>
              <span>
                <a
                  className="Results-link"
                  href={url}
                  children={getDisplayURL(url)}
                />
                <p className="Results-content" children={summary} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Results;
