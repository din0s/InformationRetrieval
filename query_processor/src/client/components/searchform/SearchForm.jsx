import "./SearchForm.scss";

import { useQuery } from "../../useQuery";

const SearchForm = () => {
  const query = useQuery();

  return (
    <div className="SearchForm">
      <a href="/">
        <img src="logo.png" alt="Logo" />
      </a>
      <form method="GET" action="/results">
        <input type="text" name="q" defaultValue={query.get("q")} />
        <input className="SearchForm-button" type="submit" value="Search" />
      </form>
    </div>
  );
};

export default SearchForm;
