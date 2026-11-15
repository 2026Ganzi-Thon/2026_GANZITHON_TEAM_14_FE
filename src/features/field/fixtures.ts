import type { Distance, Pasture, PastureSheep, WoolColor } from '@/api/types';

/**
 * 개발 서버에서 `?fixture=이름`을 붙이면 서버·목업 대신 이 값으로 들판 화면을 그린다.
 * 상태별·6마리 화면을 눈으로 확인하려는 용도이고, 배포 빌드에서는 쓰이지 않는다.
 *   예) http://localhost:5173/p/any?fixture=edge
 */
export const FIXTURE_NAMES = ['center', 'walk', 'edge', 'full', 'welcome', 'scarf'] as const;
export type FixtureName = (typeof FIXTURE_NAMES)[number];

export function isFixtureName(value: string | null): value is FixtureName {
    return FIXTURE_NAMES.includes(value as FixtureName);
}

function sheep(
    id: number,
    name: string,
    woolColor: WoolColor,
    distance: Distance,
    extra: Partial<PastureSheep> = {},
): PastureSheep {
    const mine = extra.mine ?? false;
    return {
        id,
        name,
        woolColor,
        distance,
        mine,
        bubble: null,
        wornScarf: null,
        ...(mine ? { pattedToday: false } : { sentScarfToday: false }),
        ...extra,
    };
}

function pasture(sheepList: PastureSheep[], myScarves: Pasture['myScarves'] = []): Pasture {
    return {
        pastureId: 'fixture',
        name: '졸업해도 우리',
        maxSheep: 6,
        mySheepId: 1,
        sheep: sheepList,
        myScarves,
    };
}

const bubble = (text: string) => ({ text, flagged: false, createdAt: '2026-11-14T00:00:00Z' });

const mine = (distance: Distance = 'CENTER', extra: Partial<PastureSheep> = {}) =>
    sheep(1, '구름', 'CREAM', distance, {
        mine: true,
        pattedToday: false,
        bubble: bubble('오늘은 조금 천천히'),
        ...extra,
    });

export function fixtureFor(name: FixtureName): Pasture {
    switch (name) {
        case 'center':
            return pasture([
                mine(),
                sheep(2, '마루', 'PINK', 'CENTER', { bubble: bubble('면접 끝!') }),
                sheep(3, '소금', 'MINT', 'CENTER'),
                sheep(4, '두부', 'SKY', 'CENTER'),
            ]);
        case 'walk':
            return pasture([
                mine(),
                sheep(2, '마루', 'PINK', 'CENTER', { bubble: bubble('면접 끝!') }),
                sheep(3, '소금', 'MINT', 'CENTER'),
                sheep(4, '두부', 'SKY', 'WALK'),
            ]);
        case 'edge':
            return pasture([
                mine(),
                sheep(2, '마루', 'PINK', 'CENTER', { bubble: bubble('면접 끝!') }),
                sheep(3, '소금', 'MINT', 'CENTER'),
                sheep(4, '두부', 'SKY', 'EDGE'),
            ]);
        case 'full':
            return pasture([
                mine('CENTER', { pattedToday: true }),
                sheep(2, '마루', 'PINK', 'CENTER', { bubble: bubble('면접 끝!') }),
                sheep(3, '소금', 'MINT', 'CENTER'),
                sheep(4, '두부', 'SKY', 'WALK'),
                sheep(5, '보리', 'YELLOW', 'EDGE', { wornScarf: 'SKY' }),
                sheep(6, '라떼', 'LAVENDER', 'CENTER', { wornScarf: 'PINK' }),
            ]);
        case 'welcome':
            return pasture(
                [
                    mine('EDGE', { wornScarf: 'SKY' }),
                    sheep(2, '마루', 'PINK', 'CENTER'),
                    sheep(3, '소금', 'MINT', 'CENTER'),
                ],
                [
                    { id: 31, color: 'SKY' },
                    { id: 28, color: 'YELLOW' },
                    { id: 27, color: 'CREAM' },
                ],
            );
        case 'scarf':
            return pasture([
                mine('CENTER', { wornScarf: 'MINT', pattedToday: true }),
                sheep(2, '마루', 'PINK', 'CENTER', { wornScarf: 'SKY' }),
                sheep(3, '소금', 'MINT', 'CENTER', { wornScarf: 'YELLOW' }),
                sheep(4, '두부', 'CREAM', 'CENTER', { wornScarf: 'LAVENDER' }),
            ]);
    }
}
