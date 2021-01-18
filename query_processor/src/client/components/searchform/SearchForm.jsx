import "./SearchForm.scss";

import { useQuery } from "../../useQuery";

const SearchForm = () => {
  const query = useQuery();

  return (
    <div className="SearchForm">
      <a href="/">
        <img
          src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
          alt="Google Logo"
        />
      </a>
      <form method="GET" action="/results">
        <input type="text" name="q" defaultValue={query.get("q")} />
        <input className="SearchForm-button" type="submit" value="Search" />
      </form>
    </div>
  );
};

export default SearchForm;
