import { useMemo } from 'react';

import type { Pasture, PastureSheep } from '@/api/types';
import { FIELD_BG_SRC } from '@/features/field/assets';
import { layoutSheep } from '@/features/field/layout';
import { SheepSprite } from '@/features/field/SheepSprite';
import { FieldTabBar } from '@/features/fieldNav/FieldTabBar';
import { PastureTitle } from '@/features/fieldNav/PastureTitle';

interface FieldScreenProps {
    pastureId: string;
    pasture: Pasture;
    /** 쓰다듬는 중인 내 양 (통통 튀는 반응) */
    patting: boolean;
    /** 잠깐 보이는 안내·오류 문구 */
    notice: string | null;
    /** 내 양을 탭: 쓰다듬기 */
    onPat: () => void;
    /** 친구 양을 탭 또는 멀어짐 배너를 탭: 다가가기 시트 (FE-B) */
    onReachOut: (sheep: PastureSheep) => void;
}

/** 이름 뒤에 붙는 '이/가'. 받침이 있으면 '이'. */
function withSubjectParticle(name: string) {
    const last = name.charCodeAt(name.length - 1);
    const isHangul = last >= 0xac00 && last <= 0xd7a3;
    const hasBatchim = isHangul && (last - 0xac00) % 28 !== 0;
    return `${name}${hasBatchim ? '이' : '가'}`;
}

/**
 * 들판 메인 화면 (S5). 들판 조회 응답 하나로 그린다.
 * 위쪽 들판 이름(나의 들판 시트)과 아래 탭바(초대 등 시트)는 FE-B의 fieldNav 컴포넌트를 그대로 붙인다.
 */
export function FieldScreen({
    pastureId,
    pasture,
    patting,
    notice,
    onPat,
    onReachOut,
}: FieldScreenProps) {
    const placements = useMemo(() => layoutSheep(pasture.sheep), [pasture.sheep]);
    const edgeFriends = pasture.sheep.filter((item) => !item.mine && item.distance === 'EDGE');

    return (
        <main
            className="relative isolate mx-auto h-dvh w-full max-w-[393px] overflow-hidden bg-cover bg-top"
            style={{ backgroundImage: `url(${FIELD_BG_SRC})` }}
        >
            {/* 양(z-index 최대 200)보다 위에 둔다 */}
            <div className="absolute top-[calc(env(safe-area-inset-top,0px)+44px)] left-6 z-[300]">
                <PastureTitle pastureId={pastureId} name={pasture.name ?? '이름 없는 들판'} />
            </div>

            {edgeFriends.length > 0 && (
                <button
                    type="button"
                    onClick={() => onReachOut(edgeFriends[0])}
                    className="absolute top-[calc(env(safe-area-inset-top,0px)+120px)] right-6 left-6 z-[300] flex cursor-pointer items-center justify-between rounded-[20px] bg-cream px-6 py-[15px] text-left shadow-sm focus-visible:outline-2 focus-visible:outline-primary"
                >
                    <span>
                        <span className="block text-sm leading-[18px] font-bold">
                            {edgeFriends.length === 1
                                ? withSubjectParticle(edgeFriends[0].name)
                                : `${edgeFriends[0].name} 외 ${edgeFriends.length - 1}마리가`}{' '}
                            조금 멀리 갔어요
                        </span>
                        <span className="mt-1.5 block text-xs leading-none text-primary">
                            천천히 안부를 건네볼까요?
                        </span>
                    </span>
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="size-6 shrink-0 stroke-primary"
                        fill="none"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 12h16M14 6l6 6-6 6" />
                    </svg>
                </button>
            )}

            {placements.map((placement) => (
                <SheepSprite
                    key={placement.sheep.id}
                    placement={placement}
                    patting={patting && placement.sheep.mine}
                    showHint={
                        placement.sheep.mine && placement.sheep.pattedToday === false && !patting
                    }
                    onTap={placement.sheep.mine ? onPat : onReachOut}
                />
            ))}

            {notice && (
                <p
                    role="status"
                    className="absolute right-6 bottom-[calc(max(env(safe-area-inset-bottom),48px)+80px)] left-6 z-[300] rounded-2xl bg-primary/90 px-4 py-3 text-center text-sm text-cream"
                >
                    {notice}
                </p>
            )}

            <div className="relative z-[300]">
                <FieldTabBar pastureId={pastureId} />
            </div>
        </main>
    );
}
