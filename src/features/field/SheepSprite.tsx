import { useEffect, useRef } from 'react';

import type { PastureSheep } from '@/api/types';
import {
    sheepImageSrc,
    sheepPatSrc,
    type ScarfShape,
    type SheepPose,
} from '@/features/field/assets';
import type { SheepPlacement } from '@/features/field/layout';
import { WornScarf } from '@/features/field/ScarfArt';

interface SheepSpriteProps {
    placement: SheepPlacement;
    /** 지금 쓰다듬는 중(통통 튀는 반응) */
    patting: boolean;
    /** "쓰다듬어 주세요" 안내를 보일지 (내 양, 오늘 아직 안 쓰다듬음) */
    showHint: boolean;
    onTap: (sheep: PastureSheep) => void;
}

/**
 * 양 그림별 목도리 모양과 자리 (그림 너비·높이에 대한 %).
 * 서 있는 양·앉은 양·풀 뜯는 양은 디자인 예시(Figma 256:1610)에서 잰 값이다.
 * 가장자리 그림은 전용 목도리가 없어 앉은 양 모양을 맞춰 쓴다.
 */
const SCARF_PLACEMENT: Record<
    SheepPose,
    { shape: ScarfShape; left: number; top: number; width: number }
> = {
    side: { shape: 'stand', left: 47.8, top: 47.4, width: 52.2 },
    lie: { shape: 'sit', left: 29.7, top: 57.5, width: 59.5 },
    graze: { shape: 'graze', left: 35, top: 52, width: 40 },
    edge: { shape: 'sit', left: 22, top: 58, width: 60 },
};

/**
 * 쓰다듬는 그림(정면)은 전용 목도리가 없어 서 있는 양 모양을 턱 아래에 둔다.
 * 그 모양은 오른쪽이 5.5도쯤 처져 있어서 반대로 돌려 좌우 높이를 맞춘다.
 */
const PAT_SCARF_PLACEMENT = {
    shape: 'stand',
    left: 30,
    top: 54,
    width: 46,
    rotate: -5.5,
} as const;

/**
 * 양 한 마리: 그림 + 이름표 + 말풍선 (+ 목도리, 쓰다듬기 안내).
 * 내 양을 탭하면 쓰다듬기, 친구 양을 탭하면 다가가기(FE-B 시트)로 이어진다.
 */
export function SheepSprite({ placement, patting, showHint, onTap }: SheepSpriteProps) {
    const { sheep, pose, x, y, widthPercent, opacity } = placement;
    const bounceRef = useRef<HTMLDivElement>(null);

    // 통통 튀는 반응. 움직임 줄이기 설정이면 건너뛴다.
    useEffect(() => {
        if (!patting) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;
        const animation = bounceRef.current?.animate(
            [
                { transform: 'translateY(0) scale(1, 1)' },
                { transform: 'translateY(-16px) scale(0.97, 1.04)', offset: 0.3 },
                { transform: 'translateY(0) scale(1.04, 0.95)', offset: 0.55 },
                { transform: 'translateY(-8px) scale(1, 1)', offset: 0.75 },
                { transform: 'translateY(0) scale(1, 1)' },
            ],
            { duration: 800, easing: 'ease-out' },
        );
        return () => animation?.cancel();
    }, [patting]);

    // 쓰다듬는 동안(내 양)은 웃는 얼굴 그림으로 바꾼다
    const showPat = patting && sheep.mine;
    const src = showPat ? sheepPatSrc(sheep.woolColor) : sheepImageSrc(sheep.woolColor, pose);
    const scarf = sheep.wornScarf ? (showPat ? PAT_SCARF_PLACEMENT : SCARF_PLACEMENT[pose]) : null;

    return (
        <div
            className="absolute transition-[left,top,opacity] duration-700 ease-in-out"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${widthPercent}%`,
                opacity,
                transform: 'translate(-50%, -50%)',
                // 아래쪽 양이 위로 보이게 하고, 말풍선이 있는 양은 다른 양에 가려지지 않게 한다
                zIndex: Math.round(y) + (sheep.bubble ? 100 : 0),
            }}
        >
            <button
                type="button"
                onClick={() => onTap(sheep)}
                aria-label={sheep.mine ? `내 양 ${sheep.name} 쓰다듬기` : `${sheep.name} 양`}
                className="block w-full cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-primary"
            >
                <div ref={bounceRef} className="relative">
                    <img src={src} alt="" draggable={false} className="block w-full select-none" />
                    {scarf && sheep.wornScarf && <WornScarf color={sheep.wornScarf} {...scarf} />}
                </div>
            </button>

            {sheep.bubble && (
                <p className="pointer-events-none absolute bottom-[88%] left-1/2 w-max max-w-[150px] -translate-x-1/2 rounded-2xl bg-white px-3 py-2 text-xs leading-none shadow-sm">
                    {sheep.bubble.text}
                </p>
            )}

            {showHint && (
                <p className="pointer-events-none absolute bottom-[4%] left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap text-black/55">
                    쓰다듬어 주세요
                </p>
            )}

            <p className="pointer-events-none absolute top-full left-1/2 mt-[3px] -translate-x-1/2 translate-y-0 rounded-full bg-white px-2 py-[3px] text-[10px] leading-[12px] font-medium whitespace-nowrap">
                {sheep.name}
            </p>
        </div>
    );
}
