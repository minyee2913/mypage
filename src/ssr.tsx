/**
 * 빌드 타임 프리렌더용 엔트리 (scripts/prerender.mjs 가 esbuild 로 번들해서 사용).
 * 브라우저 번들에는 포함되지 않는다.
 */
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}

export * from './content';
export { validateProjects, SECRET_PATTERNS } from './content/validate';
export { buildLlmsTxt, buildProjectsJson, buildSitemap, markdownPath, projectToMarkdown } from './content/export';
export { getRouteMeta, renderHeadTags } from './seo/meta';
