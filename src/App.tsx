import './App.css';
import { Route, Switch } from 'react-router-dom';
import Main from './main';
import Project from './project';
import Error404 from './404';
import Repos from './repo';

function App() {
  return (
    <Switch>
        <Route exact path='/'>
          <Main></Main>
        </Route>
        <Route path='/project'>
          <Project></Project>
        </Route>
        <Route path='/repositories'>
          <Repos></Repos>
        </Route>
        <Route path='/404'>
          <Error404></Error404>
        </Route>
        <Route path='/*'>
          <Error404></Error404>
        </Route>
    </Switch>
  );
}

export default App;
