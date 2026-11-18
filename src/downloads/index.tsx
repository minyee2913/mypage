import { useEffect, useState } from 'react';
import './style.css';
import { CATEGORIES, getGithubRepo, getLink, getProjectsByCategory, projectPath } from '../content';
import type { Project } from '../content';
import { Link } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface ReleaseAsset {
    id: number;
    name: string;
    size: number;
    browser_download_url: string;
}

interface Release {
    tag_name: string;
    name: string;
    published_at: string;
    assets: ReleaseAsset[];
    html_url: string;
}

interface DirectLink {
    label: string;
    url: string;
}

interface ProjectEntry {
    projectName: string;
    projectId: string;
    projectPath: string;
    secId: string;
    release: Release | null;
    loading: boolean;
    directLinks: DirectLink[];
    noBuild: boolean;
}

function getDirectLinks(pj: Project): DirectLink[] {
    const links: DirectLink[] = [];
    const playstore = getLink(pj, 'playstore');
    const itch = getLink(pj, 'itch');
    const download = getLink(pj, 'download');
    if (playstore) links.push({ label: 'Google Play', url: playstore });
    if (itch) links.push({ label: 'itch.io', url: itch });
    if (download) {
        const filename = download.split('/').pop() ?? '다운로드';
        links.push({ label: filename, url: download });
    }
    return links;
}

// 프리렌더 HTML 에도 프로젝트 목록이 들어가도록 초기 상태를 동기적으로 만든다.
function buildEntries(): ProjectEntry[] {
    const entries: ProjectEntry[] = [];
    for (const category of CATEGORIES) {
        for (const pj of getProjectsByCategory(category.id)) {
            const repo = getGithubRepo(pj);
            const directLinks = getDirectLinks(pj);
            entries.push({
                projectName: pj.title,
                projectId: pj.id,
                projectPath: projectPath(pj),
                secId: category.id,
                release: null,
                loading: repo !== null,
                directLinks,
                noBuild: !repo && directLinks.length === 0,
            });
        }
    }
    return entries;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function Downloads() {
    const [items, setItems] = useState<ProjectEntry[]>(buildEntries);

    useEffect(() => {
        if (!buildEntries().some(e => e.loading)) return;

        // GitHub API 직접 호출 없음 — Actions가 생성한 정적 파일 읽기
        fetch('/releases.json')
            .then(r => r.ok ? r.json() : {})
            .then((releaseMap: Record<string, Release>) => {
                setItems(prev =>
                    prev.flatMap(item => {
                        if (!item.loading) return [item];

                        const release = releaseMap[item.projectId] ?? null;

                        if (!release || release.assets.length === 0) {
                            return item.directLinks.length > 0
                                ? [{ ...item, loading: false, release: null }]
                                : [{ ...item, loading: false, release: null, noBuild: true }];
                        }
                        return [{ ...item, loading: false, release }];
                    })
                );
            })
            .catch(() => {
                setItems(prev =>
                    prev.flatMap(item => {
                        if (!item.loading) return [item];
                        return item.directLinks.length > 0
                            ? [{ ...item, loading: false }]
                            : [{ ...item, loading: false, noBuild: true }];
                    })
                );
            });
    }, []);

    return (
        <>
            <main id='dl-page'>
                <div id='dl-header'>
                    <h1 id='dl-title'>DOWNLOADS</h1>
                    <p id='dl-sub'>각 프로젝트의 최신 빌드 파일을 받아보세요.</p>
                </div>
                <div id='dl-list'>
                    {CATEGORIES.map(category => {
                        const categoryItems = items.filter(item => item.secId === category.id);
                        if (categoryItems.length === 0) return null;

                        return (
                            <div key={category.id} className='dl-section'>
                                <div className='dl-section-header'>
                                    <img src={category.icon} className='dl-section-icon' alt='' />
                                    <span className='dl-section-name'>{category.name}</span>
                                </div>
                                <div className='dl-section-cards'>
                                    {categoryItems.map(item => {
                                        const hasAssets = item.release && item.release.assets.length > 0;

                                        return (
                                            <div key={item.projectId} className='dl-card'>
                                                <div className='dl-card-top'>
                                                    <span className='dl-proj-name'>{item.projectName}</span>
                                                    {item.release && (
                                                        <span className='dl-tag'>{item.release.tag_name}</span>
                                                    )}
                                                    {!item.loading && item.noBuild && (
                                                        <span className='dl-no-build'>빌드 없음</span>
                                                    )}
                                                    <Link
                                                        to={item.projectPath}
                                                        className='dl-proj-link'
                                                        target='_blank'
                                                        rel='noreferrer'
                                                    >
                                                        프로젝트 →
                                                    </Link>
                                                </div>

                                                {item.loading ? (
                                                    <p className='dl-status'>불러오는 중...</p>
                                                ) : !item.noBuild && (
                                                    <>
                                                        {item.release && (
                                                            <p className='dl-date'>{formatDate(item.release.published_at)}</p>
                                                        )}

                                                        <div className='dl-assets'>
                                                            {hasAssets && item.release!.assets.map(asset => (
                                                                <a
                                                                    key={asset.id}
                                                                    href={asset.browser_download_url}
                                                                    className='dl-asset-btn'
                                                                    target='_blank'
                                                                    rel='noreferrer'
                                                                >
                                                                    <span className='dl-asset-name'>{asset.name}</span>
                                                                    <span className='dl-asset-size'>{formatBytes(asset.size)}</span>
                                                                </a>
                                                            ))}
                                                            {!hasAssets && item.directLinks.map(link => (
                                                                <a
                                                                    key={link.url}
                                                                    href={link.url}
                                                                    className='dl-asset-btn'
                                                                    target='_blank'
                                                                    rel='noreferrer'
                                                                >
                                                                    <span className='dl-asset-name'>{link.label}</span>
                                                                </a>
                                                            ))}
                                                        </div>

                                                        {item.release && (
                                                            <a
                                                                href={item.release.html_url}
                                                                className='dl-release-link'
                                                                target='_blank'
                                                                rel='noreferrer'
                                                            >
                                                                릴리즈 페이지 →
                                                            </a>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
            <Link to='/' aria-label='메인으로'><div id='dl-exit' className='pointer'>
                <ExitToAppIcon sx={{ fontSize: 55 }} />
            </div></Link>
        </>
    );
}

export default Downloads;
