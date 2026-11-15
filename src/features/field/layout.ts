import type { PastureSheep } from '@/api/types';
import type { SheepPose } from '@/features/field/assets';

/** Figma 화면 너비. 양 그림 크기는 이 너비 기준 px로 적고 화면 너비에 맞춰 늘린다. */
export const DESIGN_WIDTH = 393;

/** 양 그림 가운데 점의 위치 (화면 너비·높이에 대한 %, Figma 393×852 기준) */
type Slot = readonly [x: number, y: number];

/** 들판 가운데 원 안. 첫 칸은 내 양 자리(왼쪽 아래)다. */
const CENTER_SLOTS: readonly Slot[] = [
    [30, 67],
    [25, 46],
    [64, 39],
    [62, 58],
    [84, 70],
    [46, 78],
];

/** 원 밖(산책 중·가장자리). 오른쪽 위부터 채운다. */
const OUTER_SLOTS: readonly Slot[] = [
    [84, 33],
    [16, 31],
    [50, 30],
    [88, 45],
    [10, 44],
    [88, 56],
];

/** 그림별 크기 (Figma 393 기준 px) */
const POSE_WIDTH: Record<SheepPose, number> = {
    side: 112,
    lie: 107,
    graze: 118,
    edge: 85,
};
/** 산책 중은 옆모습을 작게 쓴다 */
const WALK_WIDTH = 87;
/** 가장자리는 선명도 80% */
const EDGE_OPACITY = 0.8;

export interface SheepPlacement {
    sheep: PastureSheep;
    pose: SheepPose;
    /** 가운데 점의 위치 (%) */
    x: number;
    y: number;
    /** 화면 너비에 대한 그림 너비 (%) */
    widthPercent: number;
    opacity: number;
}

/**
 * 거리 단계에 따라 양을 어디에 어떤 그림으로 놓을지 정한다.
 * - CENTER: 원 안. 내 양이 첫 자리, 나머지는 응답 순서대로. 그림은 양 id로 정해 흔들리지 않는다.
 * - WALK: 원 밖, 크기 축소, 선명도 유지
 * - EDGE: 원 밖, 크기 축소, 선명도 80%
 * 돌려주는 순서는 받은 순서 그대로다 (화면에서 key가 바뀌지 않게).
 */
export function layoutSheep(sheep: readonly PastureSheep[]): SheepPlacement[] {
    const placements = new Map<number, SheepPlacement>();
    let center = 0;
    let outer = 0;

    // 내 양을 먼저 놓아야 가운데 첫 자리를 차지한다
    const mineFirst = [...sheep].sort((a, b) => Number(b.mine) - Number(a.mine));

    for (const item of mineFirst) {
        if (item.distance === 'CENTER') {
            const [x, y] = CENTER_SLOTS[center++ % CENTER_SLOTS.length];
            const pose: SheepPose = item.mine ? 'side' : item.id % 2 === 0 ? 'graze' : 'lie';
            placements.set(item.id, toPlacement(item, pose, x, y, POSE_WIDTH[pose], 1));
            continue;
        }
        const [x, y] = OUTER_SLOTS[outer++ % OUTER_SLOTS.length];
        placements.set(
            item.id,
            item.distance === 'WALK'
                ? toPlacement(item, 'side', x, y, WALK_WIDTH, 1)
                : toPlacement(item, 'edge', x, y, POSE_WIDTH.edge, EDGE_OPACITY),
        );
    }

    return sheep.map((item) => placements.get(item.id)!);
}

function toPlacement(
    sheep: PastureSheep,
    pose: SheepPose,
    x: number,
    y: number,
    widthPx: number,
    opacity: number,
): SheepPlacement {
    return { sheep, pose, x, y, widthPercent: (widthPx / DESIGN_WIDTH) * 100, opacity };
}
