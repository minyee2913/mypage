import './App.css';
import { Link, Route, Switch } from 'react-router-dom';
import Main from './main';

function App() {
  return (
    <div>
      <Route path='/'>
        <Main></Main>
      </Route>
    </div>
  );
}

export default App;
