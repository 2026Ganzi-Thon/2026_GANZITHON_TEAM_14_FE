import { useState } from 'react';

import type { PastureSheep, Scarf } from '@/api/types';
import { BubbleSheet } from '@/features/bubble/BubbleSheet';
import { InviteSheet } from '@/features/invite/InviteSheet';
import { ScarfBoxSheet } from '@/features/scarf/ScarfBoxSheet';
import { TabBar, type TabKey } from '@/shared/ui/TabBar';

/**
 * 들판 화면용 탭바: 탭을 누르면 해당 시트를 연다. FE-A 들판 화면은 이것만 붙이면 된다.
 * 화면 아래에 떠 있도록 fixed로 둔다 (Figma: 아래에서 48px, 좌우 24px).
 */
export function FieldTabBar({
    pastureId,
    mine,
    scarves,
    onMineChange,
}: {
    pastureId: string;
    /** 내 양. 한마디·목도리 시트가 쓴다 */
    mine: PastureSheep | undefined;
    /** 들판 조회의 myScarves */
    scarves: Scarf[];
    /** 한마디·목도리 결과를 들판의 내 양에 바로 반영한다 */
    onMineChange: (patch: Partial<PastureSheep>) => void;
}) {
    const [sheet, setSheet] = useState<Exclude<TabKey, 'home'> | null>(null);
    // 목도리 함을 열 때마다 새로 그려서, 지금 두른 목도리가 선택된 채로 시작한다
    const [scarfOpenCount, setScarfOpenCount] = useState(0);

    function handleSelect(tab: TabKey) {
        if (tab === 'scarf') setScarfOpenCount((count) => count + 1);
        setSheet(tab === 'home' ? null : tab);
    }

    const close = () => setSheet(null);

    return (
        <>
            <div className="fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),48px)] mx-auto max-w-[393px] px-6">
                <TabBar active={sheet ?? 'home'} onSelect={handleSelect} />
            </div>
            <InviteSheet pastureId={pastureId} open={sheet === 'invite'} onClose={close} />
            {mine && (
                <>
                    <BubbleSheet
                        open={sheet === 'bubble'}
                        sheepId={mine.id}
                        onClose={close}
                        onPosted={(bubble) => onMineChange({ bubble })}
                    />
                    <ScarfBoxSheet
                        key={scarfOpenCount}
                        open={sheet === 'scarf'}
                        sheepId={mine.id}
                        scarves={scarves}
                        wornColor={mine.wornScarf}
                        onClose={close}
                        onWorn={(wornScarf) => onMineChange({ wornScarf })}
                    />
                </>
            )}
        </>
    );
}
