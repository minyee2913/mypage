import { useState, useEffect } from 'react';
import { Sleep } from '../API';
import GitHubIcon from '@mui/icons-material/GitHub';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const titleText = "minyee2913";

function Main() {
  const [title, setTitle] = useState('');
  const [show, setShow] = useState('');
  const [openMenu, setOpenMenu] = useState('');

  const MenuBtn = ()=>{
    setOpenMenu(' menu-open');
  }

  useEffect(() => {
    const animateTitle = async () => {
      for (let i = 0; i < titleText.length; i++) {
        setTitle(titleText.slice(0, i + 1));
        await Sleep(200);
      }

      setShow('show-descrip');

      setInterval(async ()=>{
        setTitle(titleText + "_");
        await Sleep(1000);
        setTitle(titleText);
      }, 2000)
    };

    animateTitle();
  }, []);

  return (
    <>
        <div>
            <p id='title'>{title}</p>
            <p id='description' className={'description ' + show}>Game Developer</p>
            <span id='open_menu' className='pointer' onClick={MenuBtn}><ArrowForwardIosIcon sx={{ color: 'white', fontSize: 55 }}></ArrowForwardIosIcon></span>
            <div className={'menu' + openMenu}></div>
        </div>
        <div id='social-tab'>
            <a href='https://open.kakao.com/me/minyee2913' target='blank'><span className='hover-text'>오픈채팅</span><ChatIcon sx={{ color: 'white', fontSize: 36 }} /></a>
            <a href='https://github.com/minyee2913' target='blank'><span className='hover-text'>깃허브</span><GitHubIcon sx={{ color: 'white', fontSize: 36 }} /></a>
            <a href='https://www.youtube.com/channel/UCZQUWTcP51kOFG0TWeHnr_g' target='blank'><span className='hover-text'>유튜브</span><YouTubeIcon sx={{ color: 'white', fontSize: 36 }} /></a>
        </div>
    </>
  );
}

export default Main;
