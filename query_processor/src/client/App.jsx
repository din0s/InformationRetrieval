import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./containers/homepage/Home";
import Results from "./containers/resultspage/Results";

const App = () => {
  return (
    <div>
      <main>
        <BrowserRouter>
          <Switch>
            <Route path="/results" children={<Results />} />
            <Route exact path="/" children={<Home />} />
          </Switch>
        </BrowserRouter>
      </main>
    </div>
  );
};

export default App;
