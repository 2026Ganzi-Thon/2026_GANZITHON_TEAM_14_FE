import type { WoolColor } from '@/api/types';

/** 양 그림 종류. 거리 단계와 양마다 번갈아 골라 쓴다. */
export type SheepPose = 'side' | 'lie' | 'graze' | 'edge';

const FIELD_ASSETS = '/assets/field';

export const FIELD_BG_SRC = `${FIELD_ASSETS}/field-bg.webp`;

/**
 * 양 그림 파일 경로. 디자인 파일(Design System > Character_source)에서 내보낸 6색 × 4종이다.
 *  - side: 서 있는 옆모습 (산책 중, 내 양)
 *  - lie: 웅크려 쉬는 모습 (가운데)
 *  - graze: 풀 뜯는 모습 (가운데)
 *  - edge: 작게 웅크린 정면 모습 (가장자리)
 */
export function sheepImageSrc(color: WoolColor, pose: SheepPose): string {
    return `${FIELD_ASSETS}/sheep-${pose}-${color.toLowerCase()}.webp`;
}

/** 쓰다듬기 반응 그림 (웃는 얼굴, 반짝이). 색마다 한 장씩 있다. */
export function sheepPatSrc(color: WoolColor): string {
    return `${FIELD_ASSETS}/sheep-pat-${color.toLowerCase()}.webp`;
}

/** 목도리 그림(펼친 모양). 받은 목도리 고르기에 쓴다. */
export function scarfSrc(color: WoolColor): string {
    return `${FIELD_ASSETS}/scarf-${color.toLowerCase()}.webp`;
}

/** 양이 두른 목도리 모양. 디자인의 '목도리 에셋' 벡터 3종 (Figma 256:1610) */
export type ScarfShape = 'stand' | 'sit' | 'graze';

/** 두른 목도리 모양 파일. 색이 없는 모양이라 CSS mask로 쓰고 SCARF_COLOR로 칠한다. */
export function scarfShapeSrc(shape: ScarfShape): string {
    return `${FIELD_ASSETS}/scarf-shape-${shape}.svg`;
}

/** 두른 목도리 색 (Figma '목도리 에셋'에 적힌 값) */
export const SCARF_COLOR: Record<WoolColor, string> = {
    CREAM: '#fff8e9',
    PINK: '#f3b8cf',
    YELLOW: '#f5d98e',
    MINT: '#a8dcc5',
    SKY: '#aecaf0',
    LAVENDER: '#c9b5eb',
};
