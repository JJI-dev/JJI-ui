import * as react from 'react';
import { ReactNode, HTMLAttributes } from 'react';

interface PostSummary {
    id: string | number;
    slug: string;
    title: string;
    category?: string;
    /** 날짜 원본 문자열 ('2025-12-01', '2026. 3. 23.' 등) */
    date?: string;
    thumbnail?: string;
    tags?: string[];
    /** hero='cover' 배경색 (예: '#B31B1B') */
    color?: string;
    /** hero='cover' 글자색 (기본: 배경 밝기에 따라 검정/흰색 자동) */
    textColor?: string;
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
    hero?: 'top' | 'inline' | 'cover' | 'none';
    /** 날짜 표시 (기본 true). false여도 데이터의 date는 그대로 유지 */
    showDate?: boolean;
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
declare function PostDetail({ post, posts, basePath, children, hero, showDate, toc: showToc, hideHeaderOnScroll, headerSelector, metaExtra, backLink, labels: labelsProp, formatDate, }: PostDetailProps): react.JSX.Element;

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

interface WorkFeedItem {
    id: string;
    slug: string;
    title: string;
    category: string;
    year?: string;
    client?: string;
    summary?: string;
    /** 절대 주소 */
    thumbnail?: string;
    /** 상세 페이지 절대 주소 */
    url: string;
    /** 준비 중(상세 없음) */
    tbu?: boolean;
}
interface WorkFeed {
    /** 'ne' | 'mo' ... */
    site: string;
    siteUrl: string;
    updatedAt: string;
    items: WorkFeedItem[];
}

interface RevealScopeProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    /** 렌더링 태그 (기본 div) */
    as?: 'div' | 'section' | 'article' | 'main';
    /** 자동 대상 선택자 교체 */
    selector?: string;
    /** 기본 선택자에 추가 (예: '.p, .card') */
    extraSelector?: string;
    /** 시간차 간격 초 (기본 0.12) */
    stagger?: number;
}
declare function RevealScope({ children, as, selector, extraSelector, stagger, ...rest }: RevealScopeProps): react.DetailedReactHTMLElement<{
    defaultChecked?: boolean | undefined;
    defaultValue?: string | number | readonly string[] | undefined;
    suppressContentEditableWarning?: boolean | undefined;
    suppressHydrationWarning?: boolean | undefined;
    accessKey?: string | undefined;
    autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters" | undefined | (string & {});
    autoFocus?: boolean | undefined;
    className?: string | undefined;
    contentEditable?: (boolean | "true" | "false") | "inherit" | "plaintext-only" | undefined;
    contextMenu?: string | undefined;
    dir?: string | undefined;
    draggable?: (boolean | "true" | "false") | undefined;
    enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send" | undefined;
    hidden?: boolean | undefined;
    id?: string | undefined;
    lang?: string | undefined;
    nonce?: string | undefined;
    slot?: string | undefined;
    spellCheck?: (boolean | "true" | "false") | undefined;
    style?: react.CSSProperties | undefined;
    tabIndex?: number | undefined;
    title?: string | undefined;
    translate?: "yes" | "no" | undefined;
    radioGroup?: string | undefined;
    role?: react.AriaRole | undefined;
    about?: string | undefined;
    content?: string | undefined;
    datatype?: string | undefined;
    inlist?: any;
    prefix?: string | undefined;
    property?: string | undefined;
    rel?: string | undefined;
    resource?: string | undefined;
    rev?: string | undefined;
    typeof?: string | undefined;
    vocab?: string | undefined;
    autoCorrect?: string | undefined;
    autoSave?: string | undefined;
    color?: string | undefined;
    itemProp?: string | undefined;
    itemScope?: boolean | undefined;
    itemType?: string | undefined;
    itemID?: string | undefined;
    itemRef?: string | undefined;
    results?: number | undefined;
    security?: string | undefined;
    unselectable?: "on" | "off" | undefined;
    inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" | undefined;
    is?: string | undefined;
    exportparts?: string | undefined;
    part?: string | undefined;
    "aria-activedescendant"?: string | undefined;
    "aria-atomic"?: (boolean | "true" | "false") | undefined;
    "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
    "aria-braillelabel"?: string | undefined;
    "aria-brailleroledescription"?: string | undefined;
    "aria-busy"?: (boolean | "true" | "false") | undefined;
    "aria-checked"?: boolean | "false" | "mixed" | "true" | undefined;
    "aria-colcount"?: number | undefined;
    "aria-colindex"?: number | undefined;
    "aria-colindextext"?: string | undefined;
    "aria-colspan"?: number | undefined;
    "aria-controls"?: string | undefined;
    "aria-current"?: boolean | "false" | "true" | "page" | "step" | "location" | "date" | "time" | undefined;
    "aria-describedby"?: string | undefined;
    "aria-description"?: string | undefined;
    "aria-details"?: string | undefined;
    "aria-disabled"?: (boolean | "true" | "false") | undefined;
    "aria-dropeffect"?: "none" | "copy" | "execute" | "link" | "move" | "popup" | undefined;
    "aria-errormessage"?: string | undefined;
    "aria-expanded"?: (boolean | "true" | "false") | undefined;
    "aria-flowto"?: string | undefined;
    "aria-grabbed"?: (boolean | "true" | "false") | undefined;
    "aria-haspopup"?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined;
    "aria-hidden"?: (boolean | "true" | "false") | undefined;
    "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling" | undefined;
    "aria-keyshortcuts"?: string | undefined;
    "aria-label"?: string | undefined;
    "aria-labelledby"?: string | undefined;
    "aria-level"?: number | undefined;
    "aria-live"?: "off" | "assertive" | "polite" | undefined;
    "aria-modal"?: (boolean | "true" | "false") | undefined;
    "aria-multiline"?: (boolean | "true" | "false") | undefined;
    "aria-multiselectable"?: (boolean | "true" | "false") | undefined;
    "aria-orientation"?: "horizontal" | "vertical" | undefined;
    "aria-owns"?: string | undefined;
    "aria-placeholder"?: string | undefined;
    "aria-posinset"?: number | undefined;
    "aria-pressed"?: boolean | "false" | "mixed" | "true" | undefined;
    "aria-readonly"?: (boolean | "true" | "false") | undefined;
    "aria-relevant"?: "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals" | undefined;
    "aria-required"?: (boolean | "true" | "false") | undefined;
    "aria-roledescription"?: string | undefined;
    "aria-rowcount"?: number | undefined;
    "aria-rowindex"?: number | undefined;
    "aria-rowindextext"?: string | undefined;
    "aria-rowspan"?: number | undefined;
    "aria-selected"?: (boolean | "true" | "false") | undefined;
    "aria-setsize"?: number | undefined;
    "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
    "aria-valuemax"?: number | undefined;
    "aria-valuemin"?: number | undefined;
    "aria-valuenow"?: number | undefined;
    "aria-valuetext"?: string | undefined;
    dangerouslySetInnerHTML?: {
        __html: string | TrustedHTML;
    } | undefined;
    onCopy?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onCopyCapture?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onCut?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onCutCapture?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onPaste?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onPasteCapture?: react.ClipboardEventHandler<HTMLElement> | undefined;
    onCompositionEnd?: react.CompositionEventHandler<HTMLElement> | undefined;
    onCompositionEndCapture?: react.CompositionEventHandler<HTMLElement> | undefined;
    onCompositionStart?: react.CompositionEventHandler<HTMLElement> | undefined;
    onCompositionStartCapture?: react.CompositionEventHandler<HTMLElement> | undefined;
    onCompositionUpdate?: react.CompositionEventHandler<HTMLElement> | undefined;
    onCompositionUpdateCapture?: react.CompositionEventHandler<HTMLElement> | undefined;
    onFocus?: react.FocusEventHandler<HTMLElement> | undefined;
    onFocusCapture?: react.FocusEventHandler<HTMLElement> | undefined;
    onBlur?: react.FocusEventHandler<HTMLElement> | undefined;
    onBlurCapture?: react.FocusEventHandler<HTMLElement> | undefined;
    onChange?: react.FormEventHandler<HTMLElement> | undefined;
    onChangeCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onBeforeInput?: react.InputEventHandler<HTMLElement> | undefined;
    onBeforeInputCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onInput?: react.FormEventHandler<HTMLElement> | undefined;
    onInputCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onReset?: react.FormEventHandler<HTMLElement> | undefined;
    onResetCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onSubmit?: react.FormEventHandler<HTMLElement> | undefined;
    onSubmitCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onInvalid?: react.FormEventHandler<HTMLElement> | undefined;
    onInvalidCapture?: react.FormEventHandler<HTMLElement> | undefined;
    onLoad?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onError?: react.ReactEventHandler<HTMLElement> | undefined;
    onErrorCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onKeyDown?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onKeyDownCapture?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onKeyPress?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onKeyPressCapture?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onKeyUp?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onKeyUpCapture?: react.KeyboardEventHandler<HTMLElement> | undefined;
    onAbort?: react.ReactEventHandler<HTMLElement> | undefined;
    onAbortCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onCanPlay?: react.ReactEventHandler<HTMLElement> | undefined;
    onCanPlayCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onCanPlayThrough?: react.ReactEventHandler<HTMLElement> | undefined;
    onCanPlayThroughCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onDurationChange?: react.ReactEventHandler<HTMLElement> | undefined;
    onDurationChangeCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onEmptied?: react.ReactEventHandler<HTMLElement> | undefined;
    onEmptiedCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onEncrypted?: react.ReactEventHandler<HTMLElement> | undefined;
    onEncryptedCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onEnded?: react.ReactEventHandler<HTMLElement> | undefined;
    onEndedCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadedData?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadedDataCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadedMetadata?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadedMetadataCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadStart?: react.ReactEventHandler<HTMLElement> | undefined;
    onLoadStartCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onPause?: react.ReactEventHandler<HTMLElement> | undefined;
    onPauseCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onPlay?: react.ReactEventHandler<HTMLElement> | undefined;
    onPlayCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onPlaying?: react.ReactEventHandler<HTMLElement> | undefined;
    onPlayingCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onProgress?: react.ReactEventHandler<HTMLElement> | undefined;
    onProgressCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onRateChange?: react.ReactEventHandler<HTMLElement> | undefined;
    onRateChangeCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onSeeked?: react.ReactEventHandler<HTMLElement> | undefined;
    onSeekedCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onSeeking?: react.ReactEventHandler<HTMLElement> | undefined;
    onSeekingCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onStalled?: react.ReactEventHandler<HTMLElement> | undefined;
    onStalledCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onSuspend?: react.ReactEventHandler<HTMLElement> | undefined;
    onSuspendCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onTimeUpdate?: react.ReactEventHandler<HTMLElement> | undefined;
    onTimeUpdateCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onVolumeChange?: react.ReactEventHandler<HTMLElement> | undefined;
    onVolumeChangeCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onWaiting?: react.ReactEventHandler<HTMLElement> | undefined;
    onWaitingCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onAuxClick?: react.MouseEventHandler<HTMLElement> | undefined;
    onAuxClickCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onClick?: react.MouseEventHandler<HTMLElement> | undefined;
    onClickCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onContextMenu?: react.MouseEventHandler<HTMLElement> | undefined;
    onContextMenuCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onDoubleClick?: react.MouseEventHandler<HTMLElement> | undefined;
    onDoubleClickCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onDrag?: react.DragEventHandler<HTMLElement> | undefined;
    onDragCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragEnd?: react.DragEventHandler<HTMLElement> | undefined;
    onDragEndCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragEnter?: react.DragEventHandler<HTMLElement> | undefined;
    onDragEnterCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragExit?: react.DragEventHandler<HTMLElement> | undefined;
    onDragExitCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragLeave?: react.DragEventHandler<HTMLElement> | undefined;
    onDragLeaveCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragOver?: react.DragEventHandler<HTMLElement> | undefined;
    onDragOverCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDragStart?: react.DragEventHandler<HTMLElement> | undefined;
    onDragStartCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onDrop?: react.DragEventHandler<HTMLElement> | undefined;
    onDropCapture?: react.DragEventHandler<HTMLElement> | undefined;
    onMouseDown?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseDownCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseEnter?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseLeave?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseMove?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseMoveCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseOut?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseOutCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseOver?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseOverCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseUp?: react.MouseEventHandler<HTMLElement> | undefined;
    onMouseUpCapture?: react.MouseEventHandler<HTMLElement> | undefined;
    onSelect?: react.ReactEventHandler<HTMLElement> | undefined;
    onSelectCapture?: react.ReactEventHandler<HTMLElement> | undefined;
    onTouchCancel?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchCancelCapture?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchEnd?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchEndCapture?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchMove?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchMoveCapture?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchStart?: react.TouchEventHandler<HTMLElement> | undefined;
    onTouchStartCapture?: react.TouchEventHandler<HTMLElement> | undefined;
    onPointerDown?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerDownCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerMove?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerMoveCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerUp?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerUpCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerCancel?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerCancelCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerEnter?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerLeave?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerOver?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerOverCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerOut?: react.PointerEventHandler<HTMLElement> | undefined;
    onPointerOutCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onGotPointerCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onGotPointerCaptureCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onLostPointerCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onLostPointerCaptureCapture?: react.PointerEventHandler<HTMLElement> | undefined;
    onScroll?: react.UIEventHandler<HTMLElement> | undefined;
    onScrollCapture?: react.UIEventHandler<HTMLElement> | undefined;
    onWheel?: react.WheelEventHandler<HTMLElement> | undefined;
    onWheelCapture?: react.WheelEventHandler<HTMLElement> | undefined;
    onAnimationStart?: react.AnimationEventHandler<HTMLElement> | undefined;
    onAnimationStartCapture?: react.AnimationEventHandler<HTMLElement> | undefined;
    onAnimationEnd?: react.AnimationEventHandler<HTMLElement> | undefined;
    onAnimationEndCapture?: react.AnimationEventHandler<HTMLElement> | undefined;
    onAnimationIteration?: react.AnimationEventHandler<HTMLElement> | undefined;
    onAnimationIterationCapture?: react.AnimationEventHandler<HTMLElement> | undefined;
    onTransitionEnd?: react.TransitionEventHandler<HTMLElement> | undefined;
    onTransitionEndCapture?: react.TransitionEventHandler<HTMLElement> | undefined;
    ref: react.RefObject<HTMLElement>;
}, HTMLElement>;

export { CategoryGrid, type CategoryGridProps, GridTile, type GridTileProps, PostDetail, type PostDetailLabels, type PostDetailProps, type PostSummary, RevealScope, type RevealScopeProps, type TileMeta, type WorkFeed, type WorkFeedItem, formatDate };
