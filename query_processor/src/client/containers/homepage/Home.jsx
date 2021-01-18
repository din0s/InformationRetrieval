import "./Home.scss";

import SearchForm from "../../components/searchform/SearchForm";

const Home = () => {
  return <div className="Home" children={<SearchForm />} />;
};

export default Home;
