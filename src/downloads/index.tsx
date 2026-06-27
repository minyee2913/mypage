import { useEffect, useState } from 'react';
import './style.css';
import { projectCategories } from '../project/data';
import { Pj } from '../project/dataStructure';
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
    secId: string;
    release: Release | null;
    loading: boolean;
    directLinks: DirectLink[];
    noBuild: boolean;
}

// github.com/{owner}/{repo}
function parseGithubUrl(url: string): { owner: string; repo: string } | null {
    const m = url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (!m) return null;
    return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

// github.com/{owner}/{repo}/releases/download/...
function parseGithubReleaseUrl(url: string): { owner: string; repo: string } | null {
    const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/releases\/download\//);
    if (!m) return null;
    return { owner: m[1], repo: m[2] };
}

function getGithubRepo(pj: Pj): { owner: string; repo: string } | null {
    if (pj.github) return parseGithubUrl(pj.github);
    if (pj.download) return parseGithubReleaseUrl(pj.download);
    return null;
}

function getDirectLinks(pj: Pj): DirectLink[] {
    const links: DirectLink[] = [];
    if (pj.playstore) links.push({ label: 'Google Play', url: pj.playstore });
    if (pj.download) {
        const filename = pj.download.split('/').pop() ?? '다운로드';
        links.push({ label: filename, url: pj.download });
    }
    return links;
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
    const [items, setItems] = useState<ProjectEntry[]>([]);

    useEffect(() => {
        const entries: ProjectEntry[] = [];

        for (const category of projectCategories) {
            for (const pj of category.projects) {
                const repo = getGithubRepo(pj);
                const directLinks = getDirectLinks(pj);
                const noBuild = !repo && directLinks.length === 0;

                entries.push({
                    projectName: pj.name,
                    projectId: pj.id,
                    secId: category.id,
                    release: null,
                    loading: repo !== null,
                    directLinks,
                    noBuild,
                });
            }
        }

        setItems(entries);

        if (!entries.some(e => e.loading)) return;

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
            <div id='dl-page'>
                <div id='dl-header'>
                    <p id='dl-title'>DOWNLOADS</p>
                    <p id='dl-sub'>각 프로젝트의 최신 빌드 파일을 받아보세요.</p>
                </div>
                <div id='dl-list'>
                    {projectCategories.map(category => {
                        const categoryItems = items.filter(item => item.secId === category.id);
                        if (categoryItems.length === 0) return null;

                        return (
                            <div key={category.id} className='dl-section'>
                                <div className='dl-section-header'>
                                    <img src={category.img} className='dl-section-icon' alt={category.name} />
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
                                                        to={`/project?sec=${encodeURIComponent(item.secId)}&pj=${encodeURIComponent(item.projectId)}`}
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
            </div>
            <Link to='/'><div id='dl-exit' className='pointer'>
                <ExitToAppIcon sx={{ fontSize: 55 }} />
            </div></Link>
        </>
    );
}

export default Downloads;
