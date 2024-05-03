import './style.css';
import { useState, useEffect } from 'react';
import { Sleep } from '../API';
import GitHubIcon from '@mui/icons-material/GitHub';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FlagIcon from '@mui/icons-material/Flag';
import { Link } from 'react-router-dom';

const titleText = "minyee2913";

let i: NodeJS.Timer;

function Main() {
  const [title, setTitle] = useState('');
  const [show, setShow] = useState('');
  const [openMenu, setOpenMenu] = useState('');

  const MenuBtn = ()=>{
    setOpenMenu(' menu-open');
  }

  const MenuClose = ()=>{
    setOpenMenu('');
  }

  useEffect(() => {
    if (i !== undefined) {
      clearInterval(i);
    }

    const animateTitle = async () => {
      for (let i = 0; i < titleText.length; i++) {
        setTitle(titleText.slice(0, i + 1));
        await Sleep(200);
      }

      setShow('show-descrip');

      i = setInterval(async ()=>{
        setTitle(titleText + "_");
        await Sleep(1000);
        setTitle(titleText);
      }, 2000)
    };

    animateTitle();
  }, []);

  return (
    <div id='base'>
        <div id='social-tab'>
            <a href='https://open.kakao.com/me/minyee2913' target='blank'><span className='hover-text'>오픈채팅</span><ChatIcon sx={{ color: 'white', fontSize: 36 }} /></a>
            <a href='https://github.com/minyee2913' target='blank'><span className='hover-text'>깃허브</span><GitHubIcon sx={{ color: 'white', fontSize: 36 }} /></a>
            <a href='https://www.youtube.com/channel/UCZQUWTcP51kOFG0TWeHnr_g' target='blank'><span className='hover-text'>유튜브</span><YouTubeIcon sx={{ color: 'white', fontSize: 36 }} /></a>
        </div>
        <div>
            <p id='title'>{title}</p>
            <p id='description' className={'description ' + show}>Game Developer</p>
            <span id='open_menu' className='pointer' onClick={MenuBtn}><ArrowForwardIosIcon sx={{ color: 'white', fontSize: 55 }}></ArrowForwardIosIcon></span>
            <div className={'menu' + openMenu}>
              <Link to='/project' style={{ textDecoration: "none"}}><div id='project' className='menu-sec'>
                <AccountTreeIcon sx={{ color: 'white', fontSize: 70 }}></AccountTreeIcon><span>Projects</span>
              </div></Link>
              <Link to='/repositories' style={{ textDecoration: "none"}}><div id='repo' className='menu-sec'>
                <FlagIcon sx={{ color: 'white', fontSize: 70 }}></FlagIcon><span>Repositories</span>
              </div></Link>
              <span id='close_menu' className='pointer' onClick={MenuClose}><ArrowBackIosIcon sx={{ color: 'white', fontSize: 55 }}></ArrowBackIosIcon></span>
            </div>
        </div>
    </div>
  );
}

export default Main;
