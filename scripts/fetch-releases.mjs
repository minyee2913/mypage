// node scripts/fetch-releases.mjs [--dry-run]
// GitHub Actions에서 GITHUB_TOKEN 환경변수로 실행됩니다. (npm ci 필요: esbuild 로 src/content 를 읽음)

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadContent } from './lib/load-ssr.mjs';

// 프로젝트 ID ↔ GitHub 저장소 매핑은 src/content 의 github / download 링크에서 만든다.
const content = await loadContent();
const REPOS = content.projects
  .map((p) => ({ id: p.id, repo: content.getGithubRepo(p) }))
  .filter((x) => x.repo)
  .map((x) => ({ id: x.id, owner: x.repo.owner, repo: x.repo.repo }));

if (process.argv.includes('--dry-run')) {
  for (const r of REPOS) console.log(`${r.id.padEnd(20)} ${r.owner}/${r.repo}`);
  process.exit(0);
}

function fetchJSON(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'User-Agent': 'minyee2913-releases-fetcher',
        'Accept': 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.warn('GITHUB_TOKEN not set — unauthenticated (60 req/hr limit)');

  const result = {};

  for (const { id, owner, repo } of REPOS) {
    try {
      const { status, data } = await fetchJSON(
        `https://api.github.com/repos/${owner}/${repo}/releases?per_page=1`,
        token
      );
      if (status === 200 && Array.isArray(data) && data[0]) {
        const r = data[0];
        result[id] = {
          tag_name: r.tag_name,
          name: r.name,
          published_at: r.published_at,
          html_url: r.html_url,
          assets: r.assets.map(a => ({
            id: a.id,
            name: a.name,
            size: a.size,
            browser_download_url: a.browser_download_url,
          })),
        };
        console.log(`✓ ${id}: ${r.tag_name} (${r.assets.length} assets)`);
      } else {
        console.log(`- ${id}: no release (HTTP ${status})`);
      }
    } catch (e) {
      console.error(`✗ ${id}: ${e.message}`);
    }
  }

  const out = path.join(ROOT, 'public', 'releases.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2));

  // build/ 에도 직접 반영 (npm run build 없이)
  const buildOut = path.join(ROOT, 'build', 'releases.json');
  if (fs.existsSync(path.dirname(buildOut))) {
    fs.writeFileSync(buildOut, JSON.stringify(result, null, 2));
    console.log(`\nSaved → public/releases.json, build/releases.json`);
  } else {
    console.log(`\nSaved → public/releases.json`);
  }
}

await main();
