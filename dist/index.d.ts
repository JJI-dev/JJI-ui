import * as react from 'react';
import { ReactNode } from 'react';

interface PostSummary {
    id: string | number;
    slug: string;
    title: string;
    category?: string;
    /** 날짜 원본 문자열 ('2025-12-01', '2026. 3. 23.' 등) */
    date?: string;
    thumbnail?: string;
    tags?: string[];
}
interface PostDetailLabels {
    toc?: string;
    tocEmpty?: string;
    drawer?: string;
    copied?: string;
    copyFailed?: string;
}
interface PostDetailProps {
    post: PostSummary;
    /** 이전/다음 글, 목록 서랍에 쓰이는 전체 목록 (표시 순서대로) */
    posts: PostSummary[];
    /** 상세 경로 prefix — '/log', '/life', '/blog' */
    basePath: string;
    /** MDX 본문 */
    children?: ReactNode;
    /** 썸네일 위치 (기본 'inline') */
    hero?: 'top' | 'inline' | 'none';
    /** 오른쪽 목차 표시 (기본 true) */
    toc?: boolean;
    /** 스크롤 시 사이트 헤더 숨김 (기본 true) */
    hideHeaderOnScroll?: boolean;
    /** 숨길 헤더 선택자 (기본 'header') */
    headerSelector?: string;
    /** 날짜 옆에 붙는 추가 메타 (예: 조회수) */
    metaExtra?: ReactNode;
    /** 본문 아래 '목록으로' 링크 */
    backLink?: {
        href: string;
        label: string;
    };
    labels?: PostDetailLabels;
    formatDate?: (raw?: string) => string;
}
declare function PostDetail({ post, posts, basePath, children, hero, toc: showToc, hideHeaderOnScroll, headerSelector, metaExtra, backLink, labels: labelsProp, formatDate, }: PostDetailProps): react.JSX.Element;

interface CategoryGridProps<T> {
    /** 표시 순서대로. 첫 번째(또는 allCategory)는 '전체' */
    categories: readonly string[];
    items: T[];
    getKey: (item: T) => string | number;
    renderItem: (item: T, index: number) => ReactNode;
    /** 카테고리 매칭 (기본: 전체 카테고리면 모두 통과, 아니면 통과 안 함) */
    matches?: (item: T, category: string) => boolean;
    /** '전체' 카테고리 이름 (기본: categories[0]) */
    allCategory?: string;
    initialCategory?: string;
    onCategoryChange?: (category: string) => void;
    /** 검색 버튼 클릭 시 외부 검색 열기 (예: SpotlightSearch) */
    onSearchClick?: () => void;
    /** onSearchClick이 없을 때: 아이콘 옆 입력창으로 목록 필터 */
    getSearchText?: (item: T) => string;
    searchPlaceholder?: string;
    /** 검색 버튼 숨김 */
    hideSearch?: boolean;
    emptyText?: ReactNode;
}
declare function CategoryGrid<T>({ categories, items, getKey, renderItem, matches, allCategory, initialCategory, onCategoryChange, onSearchClick, getSearchText, searchPlaceholder, hideSearch, emptyText, }: CategoryGridProps<T>): react.JSX.Element;
type TileMeta = [label: string, value: ReactNode];
interface GridTileProps {
    href?: string;
    thumbnail?: string;
    alt?: string;
    /** 왼쪽 정보 (예: TITLE, YEAR) */
    metaLeft?: TileMeta[];
    /** 오른쪽 정보 (예: CATEGORY, CLIENT) */
    metaRight?: TileMeta[];
    /** 가운데 배지 (예: 'TBU') — 지정 시 클릭 불가 */
    badge?: string;
}
declare function GridTile({ href, thumbnail, alt, metaLeft, metaRight, badge }: GridTileProps): react.JSX.Element;

/**
 * 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
 * 입력: '2025-12-01' | '2026. 3. 23.' | '2026.04.23' 등 (space-frontend formatDate 기준)
 */
declare function formatDate(raw?: string): string;

export { CategoryGrid, type CategoryGridProps, GridTile, type GridTileProps, PostDetail, type PostDetailLabels, type PostDetailProps, type PostSummary, type TileMeta, formatDate };
