# @jji/ui

JJI 사이트 공통 UI 컴포넌트. 현재 사용처:

| 사이트 | 페이지 | 설정 |
|---|---|---|
| space-frontend | `/log/[slug]` | `hero="top"`, `toc={false}`, 조회수 |
| space-frontend | `/life/[slug]` | `hero="inline"`, `toc`, 조회수 |
| ne-frontend | `/blog/[slug]` | `hero="inline"`, `toc`, 목록 링크 |

## 설치

```bash
npm install github:JJI-dev/JJI-ui#v0.1.0
```

루트 `layout.tsx`에서 스타일을 한 번 불러옵니다 (사이트 `globals.css`보다 먼저).

```tsx
import '@jji/ui/styles.css'
import './globals.css'
```

## PostDetail

```tsx
import { PostDetail } from '@jji/ui'

<PostDetail
  post={{ id, slug, title, category, date, thumbnail, tags }}
  posts={allPosts}            // 이전/다음, 목록 서랍
  basePath="/blog"
  hero="inline"               // 'top' | 'inline' | 'none'
  toc                         // 오른쪽 목차 (h2 기준)
  metaExtra={<span>조회 {views}</span>}
  backLink={{ href: '/blog', label: '← 목록으로' }}
>
  <MDXRemote source={content} />
</PostDetail>
```

`children`(MDX 본문)의 제목·문단·목록·이미지 스타일과 스크롤 애니메이션은 컴포넌트가 처리합니다.
MDX `components` 매핑은 필요 없습니다.

## 사이트별 톤 조정

`styles.css`는 사이트의 CSS 변수(`--black`, `--gray-*`, `--px`, `--header-h`, `--accent`)를 그대로 따릅니다.
추가로 바꾸고 싶으면 사이트 `globals.css`에서:

```css
.jji-pd {
  --jji-accent: var(--black);              /* 진행바·카테고리 색 (기본: --accent) */
  --jji-pd-category-color: var(--gray-400);
  --jji-pd-category-font: var(--font-category);
  --jji-pd-radius: 0px;                    /* 썸네일 모서리 */
  --jji-pd-max: 760px;                     /* 본문 너비 */
}
```

## 수정 → 배포 흐름

1. 이 레포에서 `src/` 수정
2. `npm run build` → `dist/` 갱신 (**dist도 커밋**: GitHub 설치 시 빌드 없이 사용)
3. `package.json` 버전 올리고 커밋 → 태그 (`git tag v0.1.1 && git push --tags`)
4. 각 사이트에서 `npm install github:JJI-dev/JJI-ui#v0.1.1`

로컬에서 바로 확인하고 싶을 땐 사이트 폴더에서:

```bash
rm -rf node_modules/@jji/ui/dist && cp -R ../jji-ui/dist node_modules/@jji/ui/dist
```

(심볼릭 링크 `npm link`는 React가 두 벌 로드되어 오류가 날 수 있어 비추천)
