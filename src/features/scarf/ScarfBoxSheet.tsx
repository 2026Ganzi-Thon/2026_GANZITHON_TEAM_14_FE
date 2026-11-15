import { useState } from 'react';

import { wearScarf } from '@/api/sheep';
import type { Scarf, WoolColor } from '@/api/types';
import { ScarfArt } from '@/features/field/ScarfArt';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { SheetNotice } from '@/shared/ui/SheetNotice';
import { useFlash } from '@/shared/useFlash';

const WOOL_NAME: Record<WoolColor, string> = {
    CREAM: '크림',
    PINK: '분홍',
    YELLOW: '노랑',
    MINT: '민트',
    SKY: '하늘',
    LAVENDER: '라벤더',
};

const TILE =
    'relative grid aspect-square cursor-pointer place-items-center rounded-2xl has-focus-visible:outline-2 has-focus-visible:outline-primary';
const TILE_ON =
    'border-2 border-[#8b5a2d] bg-[rgba(232,220,203,0.45)] shadow-[0_0_4px_rgba(139,90,45,0.6)]';
const TILE_OFF = 'border border-line bg-[#fffcf4]';

/**
 * 목도리 함 시트 (Figma 183:9604). 받은 목도리 중 하나를 두르거나 벗는다.
 * 돌아옴 환영의 목도리 고르기는 WelcomeModal(FE-A)이 따로 맡는다.
 * 열 때마다 지금 두른 목도리가 선택되도록, 부모가 열 때 key를 바꿔 새로 그린다.
 */
export function ScarfBoxSheet({
    open,
    sheepId,
    scarves,
    wornColor,
    onClose,
    onWorn,
}: {
    open: boolean;
    sheepId: number;
    /** 들판 조회의 myScarves. 같은 색은 최근 것 하나만 온다 */
    scarves: Scarf[];
    wornColor: WoolColor | null;
    onClose: () => void;
    /** 서버가 돌려준 지금 두른 색을 들판의 내 양에 반영한다 */
    onWorn: (color: WoolColor | null) => void;
}) {
    const [selectedId, setSelectedId] = useState<number | null>(
        () => scarves.find(({ color }) => color === wornColor)?.id ?? null,
    );
    const [saving, setSaving] = useState(false);
    const notice = useFlash<string>();

    async function save() {
        setSaving(true);
        try {
            const { wornScarf } = await wearScarf(sheepId, selectedId);
            onWorn(wornScarf);
            onClose();
        } catch {
            notice.flash('두르지 못했어요. 잠시 후 다시 시도해 주세요.');
        } finally {
            setSaving(false);
        }
    }

    const options: { id: number | null; color: WoolColor | null }[] = [
        { id: null, color: null },
        ...scarves,
    ];

    return (
        <BottomSheet open={open} onClose={onClose} label="목도리 함">
            <p className="font-batang text-[14px] leading-7 font-bold text-leaf">
                친구들이 건넨 따뜻한 마음
            </p>
            <h2 className="text-[20px] leading-[1.36] font-semibold tracking-[-0.2px] text-[#0f0f10]">
                어떤 목도리를 두를까요?
            </h2>

            <div role="radiogroup" aria-label="두를 목도리" className="mt-5 grid grid-cols-3 gap-2">
                {options.map(({ id, color }) => (
                    <label
                        key={id ?? 'off'}
                        className={`${TILE} ${id === selectedId ? TILE_ON : TILE_OFF}`}
                    >
                        <input
                            type="radio"
                            name="scarf-box"
                            aria-label={color ? `${WOOL_NAME[color]} 목도리` : '벗어두기'}
                            checked={id === selectedId}
                            onChange={() => setSelectedId(id)}
                            className="sr-only"
                        />
                        {color ? (
                            <ScarfArt color={color} className="w-[72px]" />
                        ) : (
                            <span className="flex flex-col items-center gap-3.5">
                                <img
                                    src="/assets/icon-block.svg"
                                    alt=""
                                    width={33.33}
                                    height={33.33}
                                />
                                <span className="text-xs leading-[17.5px] font-medium text-primary">
                                    벗어두기
                                </span>
                            </span>
                        )}
                    </label>
                ))}
            </div>
            {scarves.length === 0 && (
                <p className="mt-3 text-center text-xs text-primary">아직 받은 목도리가 없어요</p>
            )}

            <div className="relative mt-4">
                <SheetNotice text={notice.notice} />
                <button
                    type="button"
                    disabled={saving}
                    onClick={save}
                    className="h-14 w-full rounded-[14px] bg-primary text-base font-bold tracking-[-0.2px] text-white disabled:bg-primary-disabled"
                >
                    목도리 두르기
                </button>
            </div>
        </BottomSheet>
    );
}
