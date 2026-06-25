import './style.css';
import { useState, useEffect } from 'react';
import { Sleep } from '../API';
import GitHubIcon from '@mui/icons-material/GitHub';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FlagIcon from '@mui/icons-material/Flag';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from 'react-router-dom';
import { projectCategories } from '../project/data';

const titleText = "minyee2913";

let i: NodeJS.Timer;

const featuredProjects = (() => {
  const hasAllImages = (imgs: string[]) => imgs.length >= 3 && imgs.every(Boolean);
  const bySection = (secId: string) =>
    projectCategories
      .find((sec) => sec.id === secId)
      ?.projects
      .filter((pj) => hasAllImages(pj.img))
      .slice(0, 2)
      .map((pj) => ({ secId, project: pj })) ?? [];

  const selected = [...bySection("unity"), ...bySection("minecraft")];

  if (selected.length > 0) return selected;

  // 안전장치: 위 규칙에서 하나도 못 뽑는 경우 이미지가 있는 것만 노출
  return projectCategories
    .flatMap((sec) => sec.projects.map((pj) => ({ secId: sec.id, project: pj })))
    .filter(({ project }) => hasAllImages(project.img));
})();

function Main() {
  const [title, setTitle] = useState('');
  const [show, setShow] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const featuredProject = featuredProjects[featuredIndex] ?? null;

  const NextFeatured = () => {
    if (featuredProjects.length <= 1) return;
    setFeaturedIndex((prev) => (prev + 1) % featuredProjects.length);
  };

  const PrevFeatured = () => {
    if (featuredProjects.length <= 1) return;
    setFeaturedIndex((prev) => (prev - 1 + featuredProjects.length) % featuredProjects.length);
  };

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

    const rotate = setInterval(() => {
      setFeaturedIndex((prev) =>
        featuredProjects.length <= 1 ? prev : (prev + 1) % featuredProjects.length,
      );
    }, 7000);

    return () => {
      clearInterval(rotate);
    };
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
            <p id='tagline' className={show}>Building action systems, roguelike loops, and multiplayer gameplay.</p>
            <div id='terminal-panel' className={show}>
              <p className='terminal-header'>DOS.CONSOLE :: PROFILE v1.3</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>whoami</span>
              </div>
              <p className='terminal-value'>unity-gameplay-backend-dev</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>skills --core</span>
              </div>
              <p className='terminal-value'>Unity | C# | Go | TypeScript | Multiplayer | AI Systems</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>currently_working_on</span>
              </div>
              <p className='terminal-value'>
                {featuredProject ? `${featuredProject.project.name} / ${featuredProject.project.platform ?? 'Game Project'} / in-progress` : 'new gameplay prototypes'}
              </p>
              <div className='terminal-row terminal-last'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-cursor'>_</span>
              </div>
            </div>
            <div className='menu menu-always-open'>
              <Link className="menu-link" to='/project' style={{ textDecoration: "none"}}>
                <div id='project' className='menu-sec'>
                  <AccountTreeIcon sx={{ color: 'white', fontSize: 44 }}></AccountTreeIcon>
                  <span>Projects</span>
                </div>
              </Link>
              <Link className="menu-link" to='/repositories' style={{ textDecoration: "none"}}>
                <div id='repo' className='menu-sec'>
                  <FlagIcon sx={{ color: 'white', fontSize: 44 }}></FlagIcon>
                  <span>Repositories</span>
                </div>
              </Link>
              <a className="menu-link" href='https://particle.minyee2913.net' target='blank' rel='noreferrer'>
                <div id='particle' className='menu-sec'>
                  <img className='menu-icon-img' src='img/vfx.png' alt='Editor' />
                  <span>Editor</span>
                </div>
              </a>
            </div>
        </div>

        {featuredProject ? (
          <div id="featured-card" className="pointer">
            {featuredProjects.length > 1 ? (
              <>
                <button type="button" className="featured-nav-btn left" onClick={PrevFeatured} aria-label="이전 프로젝트">
                  <ChevronLeftIcon sx={{ color: '#f0f0f0', fontSize: 24 }} />
                </button>
                <button type="button" className="featured-nav-btn right" onClick={NextFeatured} aria-label="다음 프로젝트">
                  <ChevronRightIcon sx={{ color: '#f0f0f0', fontSize: 24 }} />
                </button>
              </>
            ) : null}
            <div id="featured-thumb">
              <img
                src={featuredProject.project.img[0]}
                alt={featuredProject.project.name}
              />
            </div>
            <div id="featured-meta">
              <div>
                <p id="featured-project-name">{featuredProject.project.name}</p>
                <p id="featured-platform">{featuredProject.project.platform ?? ""}</p>
                <p id="featured-status">Status: In Development</p>
              </div>
              <div>
                <p id="featured-desc">
                  {(() => {
                    const desc = featuredProject.project.description ?? "";
                    if (desc.length <= 120) return desc;
                    return desc.slice(0, 120) + "...";
                  })()}
                </p>
                <div id="featured-actions">
                  <Link
                    className="featured-action-btn"
                    to={`/project?sec=${encodeURIComponent(featuredProject.secId)}&pj=${encodeURIComponent(featuredProject.project.id)}`}
                  >
                    View Project
                  </Link>
                  {featuredProject.project.youtube ? (
                    <a
                      className="featured-action-btn outlined"
                      href={featuredProject.project.youtube}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch Gameplay
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}

export default Main;
