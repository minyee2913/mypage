// node scripts/fetch-releases.js
// GitHub Actions에서 GITHUB_TOKEN 환경변수로 실행됩니다.

const https = require('https');
const fs = require('fs');
const path = require('path');

// data.ts의 프로젝트 ID와 실제 GitHub 레포 매핑
const REPOS = [
  { id: 'survival-strategy', owner: 'minyee2913',       repo: 'survival_strategy'  },
  { id: 'albedo',             owner: 'sunrinton2025',    repo: 'amazing_something'  },
  { id: 'koroshite',          owner: 'minyee2913',       repo: 'koroshite'          },
  { id: 'bumgeun-rush',       owner: 'minyee2913',       repo: 'beomgeun_rushv2'    },
  { id: 'escape-the-music',   owner: 'zerOpen-is-on-RG', repo: 'escape_the_music'  },
  { id: 'valorant',           owner: 'minyee2913',       repo: 'valorant-addon'     },
];

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

  const out = path.resolve(__dirname, '..', 'public', 'releases.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2));

  // build/ 에도 직접 반영 (npm run build 없이)
  const buildOut = path.resolve(__dirname, '..', 'build', 'releases.json');
  if (fs.existsSync(path.dirname(buildOut))) {
    fs.writeFileSync(buildOut, JSON.stringify(result, null, 2));
    console.log(`\nSaved → public/releases.json, build/releases.json`);
  } else {
    console.log(`\nSaved → public/releases.json`);
  }
}

main();
