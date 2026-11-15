import { useState } from 'react';

import type { PastureSheep } from '@/api/types';

/** 받침 있는 이름이면 '이', 없으면 '가' (두부가 / 구름이). 한글이 아니면 '가' */
function subjectParticle(name: string) {
    const code = name.charCodeAt(name.length - 1) - 0xac00;
    if (code < 0 || code > 11171) return '가';
    return code % 28 === 0 ? '가' : '이';
}

const CARD =
    'flex min-h-[62px] w-full items-center gap-3 rounded-[18px] border border-line bg-[#fff9ef] py-2.5 pr-2.5 pl-[21px] text-left shadow-[0_12px_17.5px_rgba(66,84,56,0.12)] backdrop-blur-[12px]';

function Chevron({ up = false }: { up?: boolean }) {
    return (
        <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className={`size-3 shrink-0 stroke-current ${up ? 'rotate-180' : ''}`}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
    );
}

function Banner({ friend, onSelect }: { friend: PastureSheep; onSelect: () => void }) {
    return (
        <button type="button" onClick={onSelect} className={CARD}>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-[14px] leading-[17.5px] font-semibold text-black">
                    {friend.name}
                    {subjectParticle(friend.name)} 조금 멀리 갔어요
                </span>
                <span className="text-[11px] leading-[13.75px] font-medium text-primary">
                    천천히 안부를 건네볼까요?
                </span>
            </span>
            <img src="/assets/icon-arrow.svg" alt="" width={19} height={19} className="shrink-0" />
        </button>
    );
}

/**
 * 멀어짐 배너 (Figma 187:10479): 가장자리(EDGE)에 간 친구를 알린다. 누르면 다가가기 시트를 연다.
 * 여러 장이 쌓이면 들판 위쪽 양·말풍선을 가려서, 평소엔 접어 두고 필요할 때 펼친다.
 * 들판 화면(FE-A)은 이걸 import해서 제목 아래에 붙인다. 너비는 부모를 꽉 채운다.
 */
export function ReachOutBanner({
    sheep,
    onSelect,
}: {
    sheep: PastureSheep[];
    onSelect: (sheep: PastureSheep) => void;
}) {
    const [open, setOpen] = useState(false);
    const edgeFriends = sheep.filter(({ mine, distance }) => !mine && distance === 'EDGE');
    if (edgeFriends.length === 0) return null;

    const [first, ...rest] = edgeFriends;

    if (rest.length === 0) return <Banner friend={first} onSelect={() => onSelect(first)} />;

    if (open) {
        return (
            <div className="flex flex-col gap-2">
                {edgeFriends.map((friend) => (
                    <Banner key={friend.id} friend={friend} onSelect={() => onSelect(friend)} />
                ))}
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-expanded="true"
                    className="mx-auto flex h-8 items-center gap-1 rounded-full border border-line bg-[#fff9ef]/90 px-3.5 text-[11px] font-medium text-primary"
                >
                    접기
                    <Chevron up />
                </button>
            </div>
        );
    }

    // 접힘: 한 장으로 요약하고, 뒤에 카드가 겹쳐 보인다 (알림 2개면 1장, 3개 이상이면 2장).
    // 누르면 펼친다
    const twoBehind = rest.length >= 2;
    return (
        <div className={`relative ${twoBehind ? 'pb-3' : 'pb-1.5'}`}>
            {twoBehind && (
                <span
                    aria-hidden
                    className="absolute inset-x-6 bottom-0 h-8 rounded-[14px] border border-line bg-[#fff9ef]/70"
                />
            )}
            <span
                aria-hidden
                className={`absolute inset-x-3 h-8 rounded-[16px] border border-line bg-[#fff9ef]/85 ${twoBehind ? 'bottom-1.5' : 'bottom-0'}`}
            />
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-expanded="false"
                className={`relative ${CARD}`}
            >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="truncate text-[14px] leading-[17.5px] font-semibold text-black">
                        {first.name} 외 {rest.length}명이 조금 멀리 갔어요
                    </span>
                    <span className="text-[11px] leading-[13.75px] font-medium text-primary">
                        눌러서 모두 보기
                    </span>
                </span>
                <span className="mr-1 text-primary">
                    <Chevron />
                </span>
            </button>
        </div>
    );
}
