import './App.css';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Main from './main';
import Project from './project';
import Error404 from './404';
import Repos from './repo';

function App() {
  return (
    <Routes>
        <Route path='/' element = {<Main />}/>
        <Route path='/project' element = {<Project />}/>
        <Route path='/repositories' element = {<Repos />}/>
        <Route path='/404' element = {<Error404 />}/>
        <Route path='/*' element = {<Error404 />}/>
      </Routes>

  );
}

export default App;
