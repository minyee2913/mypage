import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root') as HTMLElement;
Modal.setAppElement(container);

// #root 에는 빌드 때 프리렌더한 HTML(크롤러/JS 미실행 환경용)이 들어 있다.
// 기존 애니메이션을 그대로 재생하기 위해 hydrate 대신 새로 렌더링해서 교체한다.
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
