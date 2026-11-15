import type { WoolColor } from '@/api/types';
import { SCARF_COLOR, scarfShapeSrc, scarfSrc, type ScarfShape } from '@/features/field/assets';

/** 펼친 목도리 그림 한 장. 받은 목도리 고르기에 쓴다. */
export function ScarfArt({ color, className }: { color: WoolColor; className?: string }) {
    return <img src={scarfSrc(color)} alt="" draggable={false} className={className} />;
}

/** 목도리 모양별 가로:세로 (Figma 벡터 크기) */
const SHAPE_RATIO: Record<ScarfShape, string> = {
    stand: '60 / 44',
    sit: '66 / 32',
    graze: '56 / 47',
};

/**
 * 양이 두른 목도리. 디자인의 목도리 벡터를 mask로 쓰고 목도리 색으로 칠해서 양 그림 위에 겹친다.
 * 자리(left·top·width)는 양 그림에 대한 %로 받는다.
 */
export function WornScarf({
    color,
    shape,
    left,
    top,
    width,
    rotate = 0,
}: {
    color: WoolColor;
    shape: ScarfShape;
    left: number;
    top: number;
    width: number;
    /** 기울기 보정 (도). 정면 그림에 얹을 때 좌우 높이를 맞춘다 */
    rotate?: number;
}) {
    const mask = `url(${scarfShapeSrc(shape)}) center / contain no-repeat`;
    return (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute block"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                aspectRatio: SHAPE_RATIO[shape],
                transform: rotate ? `rotate(${rotate}deg)` : undefined,
                backgroundColor: SCARF_COLOR[color],
                mask,
                WebkitMask: mask,
            }}
        />
    );
}
