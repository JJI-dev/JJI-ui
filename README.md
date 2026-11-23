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
| `RevealScope` | ne `/work/[slug]`, mo `/work/[slug]`, career `/project/[slug]` (스크롤 등장 애니메이션) |

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

## RevealScope (스크롤 등장 애니메이션)

레이아웃은 사이트마다 자유롭게, 움직임만 공통으로 씁니다. 감싼 범위 안의 제목·문단·목록·이미지를 자동으로 찾아
화면에 들어올 때 천천히 등장시킵니다 (글: 아래에서 올라오며 / 이미지: 가림막이 걷히며 확대→제자리, 순서대로 시간차).

```tsx
import { RevealScope } from '@jji/ui'

<RevealScope extraSelector=".p">           {/* 사이트 전용 클래스 추가 가능 */}
  <h1>제목</h1>                              {/* 자동 */}
  <div data-reveal>메타 정보 박스</div>       {/* div 등은 직접 지정 */}
  <div data-reveal="image">대표 이미지 박스</div>
  <div data-reveal="none">움직이지 않을 영역</div>
  {mdxContent}                               {/* MDX 내부도 자동, 기존 .reveal 클래스도 인식 */}
</RevealScope>
```

속도 조정: `--jji-rv-duration`(글, 기본 1.4s), `--jji-rv-image-duration`(이미지, 1.8s), `--jji-rv-distance`(80px)

## WorkFeed (works.json 형식)

ne·mo가 `/works.json`으로 작업 목록을 내보내고, jji.kr 포트폴리오가 가져와 목록을 만듭니다.

```ts
import type { WorkFeed } from '@jji/ui'
// { site, siteUrl, updatedAt, items: [{ id, slug, title, category, year, client, summary, thumbnail(절대주소), url(상세 절대주소), tbu }] }
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

## 개발 도구: jji-dev (dev 서버 자동 재시작)

각 사이트 `package.json`의 dev 스크립트를 `jji-dev`로 감쌉니다.

```json
"dev": "jji-dev next dev",
"ui:update": "npm uninstall @jji/ui && npm install github:JJI-dev/JJI-ui#semver:^0"
```

`npm run dev`로 켜두면 아래가 바뀔 때 dev 서버가 알아서 재시작됩니다.
- `node_modules/@jji/ui` (공통 패키지 업데이트, `npm run sync`)
- `package.json`, `package-lock.json`, `.env*`, `next.config.*`

일반 소스(`src/`) 수정은 재시작 없이 Next가 바로 반영합니다.

## 수정 → 반영 흐름

### 로컬에서 바로 보기 (배포 전)
이 레포(jji-ui)에서:
```bash
npm run dev      # 저장할 때마다 빌드 → 옆 폴더 사이트들에 복사 → 각 사이트 dev 서버 자동 재시작
# 또는 한 번만: npm run sync
```

### 배포용으로 확정
1. 이 레포에서 `package.json` 버전 올리기 → `npm run build`
2. 커밋 (**dist 포함**) → `git tag v0.3.1 && git push && git push --tags`
3. **각 사이트 폴더(ne, mo, space)에서** `npm run ui:update` → 최신 0.x 태그로 설치, lock 갱신
4. 각 사이트 커밋·배포

※ 사이트 `.npmrc`의 `allow-git=root`가 있어야 GitHub 설치가 허용됩니다 (npm 12+).
