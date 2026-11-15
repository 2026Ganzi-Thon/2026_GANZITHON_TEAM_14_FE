import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { toApiError } from '@/api/errors';
import { getPasture } from '@/api/pastures';
import { patSheep, wearScarf } from '@/api/sheep';
import type { Pasture, PastureSheep, WoolColor } from '@/api/types';
import { DemoPanel } from '@/features/demo/DemoPanel';
import { FieldScreen } from '@/features/field/FieldScreen';
import { fixtureFor, isFixtureName, type FixtureName } from '@/features/field/fixtures';
import { WelcomeModal } from '@/features/field/WelcomeModal';
import { ReachOutSheet } from '@/features/reachOut/ReachOutSheet';

const NOTICE_MS = 3000;
const PAT_MS = 900;

interface FieldPageProps {
    pastureId: string;
    /** PasturePage가 멤버 확인을 하면서 받아 둔 들판 조회 응답 */
    pasture: Pasture;
}

/**
 * 들판 메인 화면의 데이터 연결부.
 * 받은 들판을 그리고, 내 양을 쓰다듬고, 오랜만에 돌아온 양을 환영한다.
 * 개발 서버에서는 `?fixture=이름`으로 상태별 화면을 볼 수 있다. (fixtures.ts)
 */
export function FieldPage({ pastureId, pasture }: FieldPageProps) {
    const [params] = useSearchParams();
    const requested = import.meta.env.DEV ? params.get('fixture') : null;
    const fixture = isFixtureName(requested) ? requested : null;
    // 들판이나 fixture가 바뀌면 상태를 새로 시작한다
    return (
        <FieldContent
            key={`${pastureId}:${fixture ?? 'live'}`}
            pastureId={pastureId}
            initial={pasture}
            fixture={fixture}
        />
    );
}

function FieldContent({
    pastureId,
    initial,
    fixture,
}: {
    pastureId: string;
    initial: Pasture;
    fixture: FixtureName | null;
}) {
    const [pasture, setPasture] = useState<Pasture>(() =>
        fixture ? fixtureFor(fixture) : initial,
    );
    const [patting, setPatting] = useState(false);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [welcomeClosed, setWelcomeClosed] = useState(false);
    // 다가가기 시트를 연 친구. id로 둬서 목도리를 보낸 뒤 바뀐 값이 시트에 바로 보이게 한다
    const [reachOutId, setReachOutId] = useState<number | null>(null);
    const [searchParams] = useSearchParams();
    const isDemo = searchParams.get('demo') === '1';

    // 앱으로 다시 돌아오면(탭 전환 등) 거리가 바뀌었을 수 있어 다시 불러온다.
    // 실패하면 보던 화면을 그대로 둔다.
    useEffect(() => {
        if (fixture) return;
        let cancelled = false;
        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            getPasture(pastureId)
                .then((next) => {
                    if (!cancelled) setPasture(next);
                })
                .catch(() => {});
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [pastureId, fixture]);

    useEffect(() => {
        if (!patting) return;
        const timer = setTimeout(() => setPatting(false), PAT_MS);
        return () => clearTimeout(timer);
    }, [patting]);

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), NOTICE_MS);
        return () => clearTimeout(timer);
    }, [notice]);

    const mine = pasture.sheep.find((item) => item.mine);

    /** 내 양의 값을 바꾼다 (서버 응답을 화면에 바로 반영) */
    const updateMine = (patch: Partial<PastureSheep>) =>
        setPasture((current) =>
            mine
                ? {
                      ...current,
                      sheep: current.sheep.map((item) =>
                          item.id === mine.id ? { ...item, ...patch } : item,
                      ),
                  }
                : current,
        );

    /** 데모 되감기·목도리 보내기 결과를 그 양에만 반영한다 */
    const updateSheep = (sheepId: number, patch: Partial<PastureSheep>) =>
        setPasture((current) => ({
            ...current,
            sheep: current.sheep.map((item) =>
                item.id === sheepId ? { ...item, ...patch } : item,
            ),
        }));

    const pat = async () => {
        if (!mine || patting) return;
        setPatting(true);
        try {
            const result = fixture
                ? { distance: 'CENTER' as const, pattedToday: true }
                : await patSheep(mine.id);
            updateMine({ distance: result.distance, pattedToday: result.pattedToday });
        } catch (caught) {
            setPatting(false);
            setNotice(toApiError(caught).message);
        }
    };

    /** 돌아옴 환영에서 "들판으로 돌아가기". 목도리를 골랐다면 두르고 쓰다듬는다. */
    const returnToField = async (scarfId?: number) => {
        if (!mine) return;
        setBusy(true);
        try {
            let worn: WoolColor | null | undefined;
            if (scarfId !== undefined) {
                if (!fixture) await wearScarf(mine.id, scarfId);
                worn = pasture.myScarves.find((scarf) => scarf.id === scarfId)?.color;
            }
            const result = fixture
                ? { distance: 'CENTER' as const, pattedToday: true }
                : await patSheep(mine.id);
            updateMine({
                distance: result.distance,
                pattedToday: result.pattedToday,
                ...(worn !== undefined && { wornScarf: worn }),
            });
            setWelcomeClosed(true);
            setPatting(true);
        } catch (caught) {
            setNotice(toApiError(caught).message);
        } finally {
            setBusy(false);
        }
    };

    // 서버가 '돌아옴'을 알려 주지 않아서, 들어왔을 때 내 양이 가장자리면 환영한다
    const showWelcome = mine?.distance === 'EDGE' && !welcomeClosed;

    return (
        <div className="relative mx-auto h-dvh w-full max-w-[393px]">
            <FieldScreen
                pastureId={pastureId}
                pasture={pasture}
                patting={patting}
                notice={notice}
                onPat={pat}
                onReachOut={({ id }) => setReachOutId(id)}
                onMineChange={updateMine}
            />
            <ReachOutSheet
                sheep={pasture.sheep.find(({ id }) => id === reachOutId) ?? null}
                onClose={() => setReachOutId(null)}
                onScarfSent={(sheepId) => updateSheep(sheepId, { sentScarfToday: true })}
            />
            {isDemo && (
                <DemoPanel
                    sheep={pasture.sheep}
                    onRewound={(sheepId, distance) => updateSheep(sheepId, { distance })}
                />
            )}
            {showWelcome && mine && (
                <WelcomeModal
                    scarves={pasture.myScarves}
                    sheepColor={mine.woolColor}
                    wornColor={mine.wornScarf}
                    busy={busy}
                    onReturn={returnToField}
                    onClose={() => setWelcomeClosed(true)}
                />
            )}
        </div>
    );
}
