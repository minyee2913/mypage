import './App.css';
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Main from './main';
import { LegacyProjectRedirect, ProjectPage, ProjectsIndex } from './project';
import Error404 from './404';
import Repos from './repo';
import Downloads from './downloads';
import { applyMeta, getRouteMeta } from './seo/meta';

/** 클라이언트 라우팅으로 페이지가 바뀔 때 title/description/canonical/JSON-LD 를 갱신 */
function DocumentMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyMeta(getRouteMeta(pathname));
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <DocumentMeta />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/projects' element={<ProjectsIndex />} />
        <Route path='/projects/:slug' element={<ProjectPage />} />
        {/* 이전 주소: /project?sec=unity&pj=ignotus */}
        <Route path='/project' element={<LegacyProjectRedirect />} />
        <Route path='/repositories' element={<Repos />} />
        <Route path='/downloads' element={<Downloads />} />
        <Route path='/*' element={<Error404 />} />
      </Routes>
    </>
  );
}

export default App;
