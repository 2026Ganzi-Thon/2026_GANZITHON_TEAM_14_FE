import { useMemo } from 'react';

import type { Pasture, PastureSheep } from '@/api/types';
import { FIELD_BG_SRC } from '@/features/field/assets';
import { layoutSheep } from '@/features/field/layout';
import { SheepSprite } from '@/features/field/SheepSprite';
import { FieldTabBar } from '@/features/fieldNav/FieldTabBar';
import { PastureTitle } from '@/features/fieldNav/PastureTitle';
import { ReachOutBanner } from '@/features/reachOut/ReachOutBanner';

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

    return (
        <main
            className="relative isolate mx-auto h-dvh w-full max-w-[393px] overflow-hidden bg-cover bg-top"
            style={{ backgroundImage: `url(${FIELD_BG_SRC})` }}
        >
            {/* 양(z-index 최대 200)보다 위에 둔다 */}
            <div className="absolute top-[calc(env(safe-area-inset-top,0px)+44px)] left-6 z-[300]">
                <PastureTitle pastureId={pastureId} name={pasture.name ?? '이름 없는 들판'} />
            </div>

            {/* 멀어짐 배너(FE-B reachOut): 가장자리 친구마다 한 장. Figma처럼 제목 아래 18px */}
            <div className="absolute top-[calc(env(safe-area-inset-top,0px)+123px)] right-6 left-6 z-[300]">
                <ReachOutBanner sheep={pasture.sheep} onSelect={onReachOut} />
            </div>

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
