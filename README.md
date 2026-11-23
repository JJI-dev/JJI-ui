# @jji/ui

JJI 사이트 공통 UI 컴포넌트. 현재 사용처:

| 사이트 | 페이지 | 설정 |
|---|---|---|
| space-frontend | `/log/[slug]` | `hero="top"`, `toc={false}`, 조회수 |
| space-frontend | `/life/[slug]` | `hero="inline"`, `toc`, 조회수 |
| ne-frontend | `/blog/[slug]` | `hero="inline"`, `toc`, 목록 링크 |
| mo-frontend | `/blog/[slug]` | `hero="inline"`, `toc`, 헤더 숨김 끔 |

| 컴포넌트 | 사용처 |
|---|---|
| `PostDetail` | 위 표 (글 상세) |
| `CategoryGrid` + `GridTile` | ne `/work`, ne `/blog`, mo `/blog` (목록) |

## 설치

```bash
npm install github:JJI-dev/JJI-ui#v0.2.0
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

## CategoryGrid / GridTile

왼쪽 세로 카테고리 + 오른쪽 검색 + 3열 목록. 카테고리·검색은 목록 영역 안에서 sticky라 목록이 끝나면 함께 올라갑니다.
페이지의 `<main>`에는 상단 padding을 주지 않습니다 (목록 시작 위치는 컴포넌트가 계산).

```tsx
import { CategoryGrid, GridTile, formatDate } from '@jji/ui'

<CategoryGrid
  categories={['All', 'Article', 'Study']}       // 첫 번째 = 전체
  items={posts}
  getKey={p => p.id}
  matches={(p, c) => p.category === c}
  getSearchText={p => p.title}                    // 아이콘 옆 입력창 검색
  // onSearchClick={() => setSpotlight(true)}     // 또는 외부 검색 열기
  renderItem={p => (
    <GridTile
      href={`/blog/${p.slug}`}
      thumbnail={p.thumbnail}
      metaLeft={[['TITLE', p.title], ['DATE', formatDate(p.date)]]}
      metaRight={[['CATEGORY', p.category]]}
      // badge="TBU"                                // 준비 중 표시 (클릭 불가)
    />
  )}
/>
```

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
.jji-cg {
  --jji-cg-font: var(--font-en);           /* 카테고리 폰트 (기본: --font-category) */
  --jji-cg-size: 64px;                     /* 카테고리 크기 */
  --jji-cg-grid-top: 40vh;                 /* 목록 시작 위치 */
  --jji-tile-ratio: 3 / 4;                 /* 타일 비율 */
}
```

## 수정 → 배포 흐름

1. 이 레포에서 `src/` 수정
2. `npm run build` → `dist/` 갱신 (**dist도 커밋**: GitHub 설치 시 빌드 없이 사용)
3. `package.json` 버전 올리고 커밋 → 태그 (`git tag v0.1.1 && git push --tags`)
4. 각 사이트에서 버전 교체 (npm 12는 lock에 남은 이전 git 버전 갱신을 거부하므로 제거 후 설치)
   ```bash
   npm uninstall @jji/ui && npm install github:JJI-dev/JJI-ui#v0.2.1
   ```
   각 사이트 `.npmrc`의 `allow-git=root`가 있어야 GitHub 설치가 허용됩니다.

로컬에서 바로 확인하고 싶을 땐 사이트 폴더에서:

```bash
rm -rf node_modules/@jji/ui/dist && cp -R ../jji-ui/dist node_modules/@jji/ui/dist
```

(심볼릭 링크 `npm link`는 React가 두 벌 로드되어 오류가 날 수 있어 비추천)
