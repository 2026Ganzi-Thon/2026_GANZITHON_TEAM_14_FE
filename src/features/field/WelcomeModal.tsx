import { useEffect, useRef, useState } from 'react';

import type { Scarf, WoolColor } from '@/api/types';
import { sheepPatSrc } from '@/features/field/assets';
import { ScarfArt } from '@/features/field/ScarfArt';

const WOOL_NAME: Record<WoolColor, string> = {
    CREAM: '크림',
    PINK: '분홍',
    YELLOW: '노랑',
    MINT: '민트',
    SKY: '하늘',
    LAVENDER: '라벤더',
};

interface WelcomeModalProps {
    scarves: Scarf[];
    /** 내 양의 털 색. 맨 위 웃는 양 그림에 쓴다 */
    sheepColor: WoolColor;
    /** 지금 두르고 있는 목도리 색. 처음 선택으로 쓴다 */
    wornColor: WoolColor | null;
    /** 돌아가는 중이면 버튼을 잠근다 */
    busy: boolean;
    /** scarfId가 있으면 그 목도리를 두르고 돌아가고, 없으면 지금 모습 그대로 돌아간다 */
    onReturn: (scarfId?: number) => void;
    /** 닫기(X): 돌아가지 않고 들판만 본다. 양을 쓰다듬으면 그때 돌아온다 */
    onClose: () => void;
}

/**
 * 오랜만에 접속했을 때의 돌아옴 환영 (Figma '오랜만에 접속 시').
 * 가장자리까지 갔던 내 양이 돌아오기 전에, 그동안 받은 목도리를 고른다.
 */
export function WelcomeModal({
    scarves,
    sheepColor,
    wornColor,
    busy,
    onReturn,
    onClose,
}: WelcomeModalProps) {
    const [selectedId, setSelectedId] = useState<number | null>(
        () => (scarves.find((scarf) => scarf.color === wornColor) ?? scarves[0])?.id ?? null,
    );
    const primaryRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        primaryRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    const hasScarves = scarves.length > 0;

    return (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/25 px-[21px] backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="welcome-title"
                className="relative w-full rounded-[28px] bg-cream px-3 pt-[56px] pb-6 text-center"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="absolute top-[22px] right-[22px] grid size-8 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary"
                >
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="size-6 stroke-black"
                        fill="none"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>

                <img
                    src={sheepPatSrc(sheepColor)}
                    alt=""
                    className="mx-auto -mt-4 mb-4 h-[100px] w-auto select-none"
                />
                <h2
                    id="welcome-title"
                    className="font-batang text-xl leading-none font-bold text-primary"
                >
                    다들 기다리고 있었어요!
                </h2>
                <p className="mt-3 text-xs leading-none text-primary">
                    {hasScarves
                        ? '친구들이 건넨 목도리가 도착했어요'
                        : '들판이 그대로 기다리고 있었어요'}
                </p>

                {hasScarves && (
                    <div
                        role="radiogroup"
                        aria-label="두를 목도리"
                        className="mt-6 flex justify-center gap-2 px-0.5"
                    >
                        {scarves.map(({ id, color }) => {
                            const selected = id === selectedId;
                            return (
                                <label
                                    key={id}
                                    className={`relative grid h-[100px] w-[100px] cursor-pointer place-items-center rounded-2xl border has-focus-visible:outline-2 has-focus-visible:outline-primary ${selected ? 'border-2 border-primary bg-line/60' : 'border-line bg-white'}`}
                                >
                                    <input
                                        type="radio"
                                        name="scarf"
                                        aria-label={`${WOOL_NAME[color]} 목도리`}
                                        checked={selected}
                                        onChange={() => setSelectedId(id)}
                                        className="sr-only"
                                    />
                                    <ScarfArt color={color} className="w-[72px]" />
                                </label>
                            );
                        })}
                    </div>
                )}

                <button
                    ref={primaryRef}
                    type="button"
                    disabled={busy}
                    onClick={() => onReturn(selectedId ?? undefined)}
                    className="mt-6 h-14 w-full cursor-pointer rounded-2xl bg-primary text-base font-bold text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:bg-primary-disabled"
                >
                    들판으로 돌아가기
                </button>
                {hasScarves && (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onReturn()}
                        className="mt-5 cursor-pointer text-xs leading-none text-primary underline disabled:cursor-default disabled:opacity-60"
                    >
                        지금 모습 그대로 돌아갈게요
                    </button>
                )}
            </div>
        </div>
    );
}
