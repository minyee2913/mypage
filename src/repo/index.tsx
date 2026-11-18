import { useEffect, useState } from 'react';
import './style.css';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Repository } from './repository';
import { Link } from 'react-router-dom';

const id = 'minyee2913';

// 공개 저장소 목록은 인증 없이 조회한다. (브라우저 번들에 토큰을 넣지 않는다)
function Repos() {
    const [repos, setRepos] = useState<Repository[]>([]);
    useEffect(()=>{
        fetch(`https://api.github.com/users/${id}/repos?per_page=100&sort=updated`)
        .then(response => response.json())
        .then((data: Repository[]) => {
            if (!Array.isArray(data)) {
                return
            }
            setRepos(data);
        })
        .catch(() => {});
    }, [])

    return (
        <>
            <main id='list'>
                <h1 className='sr-only'>{id}의 GitHub 저장소</h1>
                <div style={{ height: 40 }}></div>
                {repos.length === 0 && (
                    <a href={`https://github.com/${id}?tab=repositories`} id='listlink'>
                        <div className='listItem pointer'>
                            <span id='name'>github.com/{id}</span>
                            <br></br><span id='descrip'>GitHub 저장소 목록 보기</span>
                        </div>
                    </a>
                )}
                {repos.map((itm) => (
                    <a key={itm.id} href={itm.html_url} id='listlink'>
                        <div className='listItem pointer'>
                            <span id='name'>{itm.name}</span><span id='fork'>{itm.fork ? ' [fork]' : ''}</span><span id='lang'>{itm.language}</span>
                            <br></br><span id='descrip'>{itm.description}</span>
                        </div>
                    </a>
                ))}
                <div style={{ height: 50 }}></div>
            </main>
            <Link to='/' aria-label='메인으로'><div id='exit' className='pointer'>
                <ExitToAppIcon sx={{ fontSize: 55 }}></ExitToAppIcon>
            </div></Link>
        </>
    )
}

export default Repos;
