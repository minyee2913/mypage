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
import {
  PROJECTS_PATH,
  SITE,
  STATUS_LABEL_EN,
  formatReleaseTargetEn,
  getCoverImage,
  getFeaturedProjects,
  getLink,
  projectPath,
  projectSummary,
} from '../content';

const titleText = SITE.name;
const IS_SERVER = typeof window === 'undefined';

let i: NodeJS.Timer;

const featuredProjects = getFeaturedProjects();

const socialIcon: Record<string, JSX.Element> = {
  'KakaoTalk Open Chat': <ChatIcon sx={{ color: 'white', fontSize: 36 }} />,
  GitHub: <GitHubIcon sx={{ color: 'white', fontSize: 36 }} />,
  YouTube: <YouTubeIcon sx={{ color: 'white', fontSize: 36 }} />,
};
const socialOrder = ['KakaoTalk Open Chat', 'GitHub', 'YouTube'];

function Main() {
  // 프리렌더 HTML 에는 완성된 텍스트를 넣고, 브라우저에서는 기존 타이핑 애니메이션을 그대로 재생한다.
  const [title, setTitle] = useState(IS_SERVER ? titleText : '');
  const [show, setShow] = useState(IS_SERVER ? 'show-descrip' : '');
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

  const releaseEn = featuredProject ? formatReleaseTargetEn(featuredProject) : undefined;
  const statusText = featuredProject?.status
    ? STATUS_LABEL_EN[featuredProject.status] + (releaseEn ? ` (Release: ${releaseEn})` : '')
    : null;
  const cover = featuredProject ? getCoverImage(featuredProject) : undefined;
  const video = featuredProject ? getLink(featuredProject, 'youtube') : undefined;

  return (
    <main id='base'>
        <nav id='social-tab' aria-label='연락처 및 소셜 링크'>
            {socialOrder.map((name) => {
              const s = SITE.social.find((x) => x.name === name);
              if (!s) return null;
              return (
                <a key={s.name} href={s.url} target='_blank' rel='noreferrer' aria-label={s.label}>
                  <span className='hover-text'>{s.label}</span>{socialIcon[s.name]}
                </a>
              );
            })}
        </nav>
        <div id='main-content'>
            <h1 id='title' aria-label={titleText}>{title}</h1>
            <p id='description' className={'description ' + show}>{SITE.author.jobTitle}</p>
            <p id='tagline' className={show}>{SITE.author.tagline}</p>
            <div id='terminal-panel' className={show}>
              <p className='terminal-header'>DOS.CONSOLE :: PROFILE v1.3</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>whoami</span>
              </div>
              <p className='terminal-value'>unity-gameplay-backend-dev</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>about</span>
              </div>
              <p className='terminal-value'>{SITE.author.about}</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>skills --core</span>
              </div>
              <p className='terminal-value'>{SITE.author.skills.join(' | ')}</p>
              <div className='terminal-row'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-line'>featured_project</span>
              </div>
              <p className='terminal-value'>
                {featuredProject
                  ? [featuredProject.title, featuredProject.platform ?? 'Game Project', statusText].filter(Boolean).join(' / ')
                  : 'new gameplay prototypes'}
              </p>
              <div className='terminal-row terminal-last'>
                <span className='terminal-prompt'>C:\DEV\ME&gt;</span>
                <span className='terminal-cursor'>_</span>
              </div>
            </div>
        </div>
        <nav className='menu menu-always-open' aria-label='메뉴'>
          <Link className="menu-link" to={PROJECTS_PATH} style={{ textDecoration: "none"}}>
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
          <a className="menu-link" href='https://particle.minyee2913.net' target='_blank' rel='noreferrer'>
            <div id='particle' className='menu-sec'>
              <img className='menu-icon-img' src='/img/vfx.png' alt='' />
              <span>Editor</span>
            </div>
          </a>
        </nav>

        {featuredProject ? (
          <section id="featured-card" className="pointer" aria-label="대표 프로젝트">
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
              <img src={cover} alt={`${featuredProject.title} 스크린샷`} />
            </div>
            <div id="featured-meta">
              <div>
                <h2 id="featured-project-name">{featuredProject.title}</h2>
                <p id="featured-platform">{featuredProject.platform ?? ""}</p>
                {statusText ? <p id="featured-status">Status: {statusText}</p> : null}
              </div>
              <div>
                <p id="featured-desc">
                  {(() => {
                    const desc = projectSummary(featuredProject);
                    if (desc.length <= 120) return desc;
                    return desc.slice(0, 120) + "...";
                  })()}
                </p>
                <div id="featured-actions">
                  <Link className="featured-action-btn" to={projectPath(featuredProject)}>
                    View Project
                  </Link>
                  {video ? (
                    <a className="featured-action-btn outlined" href={video} target="_blank" rel="noreferrer">
                      Watch Gameplay
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}
    </main>
  );
}

export default Main;
