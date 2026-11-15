import { useState } from 'react';

import { ERROR_CODE, toApiError } from '@/api/errors';
import { putBubble } from '@/api/sheep';
import type { Bubble } from '@/api/types';
import { BubbleHelpModal } from '@/features/bubble/BubbleHelpModal';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { INPUT } from '@/shared/ui/Field';
import { SheetNotice } from '@/shared/ui/SheetNotice';
import { useFlash } from '@/shared/useFlash';

const BUBBLE_MAX = 20;

/** 서버와 같은 셈: 앞뒤 공백을 떼고 코드포인트로 센다 (이모지 1글자, bubble.md) */
const countChars = (text: string) => [...text.trim()].length;

/**
 * 오늘의 한마디 시트 (Figma 174:8531). 내 양 위에 띄울 한마디를 올린다.
 * 위험 키워드가 있으면 서버가 게시를 멈추고(posted:false), 도움 모달을 먼저 보여 준다.
 */
export function BubbleSheet({
    open,
    sheepId,
    onClose,
    onPosted,
}: {
    open: boolean;
    sheepId: number;
    onClose: () => void;
    /** 올라간 한마디를 들판의 내 양에 바로 반영한다 (서버는 본문을 돌려주지 않는다) */
    onPosted: (bubble: Bubble) => void;
}) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const notice = useFlash<string>();

    const count = countChars(text);
    const canPost = count >= 1 && count <= BUBBLE_MAX && !sending;

    async function post(confirm: boolean) {
        setSending(true);
        try {
            const result = await putBubble(sheepId, { text: text.trim(), confirm });
            if (!result.posted) {
                setHelpOpen(true);
                return;
            }
            onPosted({
                text: text.trim(),
                flagged: result.flagged,
                createdAt: new Date().toISOString(),
            });
            setHelpOpen(false);
            setText('');
            onClose();
        } catch (caught) {
            const { code } = toApiError(caught);
            setHelpOpen(false);
            notice.flash(
                code === ERROR_CODE.BUBBLE_TEXT_INVALID
                    ? '한마디는 1~20자로 적어 주세요.'
                    : '올리지 못했어요. 잠시 후 다시 시도해 주세요.',
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <BottomSheet open={open} onClose={onClose} label="오늘의 한마디">
                <h2 className="text-[20px] leading-[1.36] font-semibold tracking-[-0.2px] text-[#0f0f10]">
                    오늘의 한마디
                </h2>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (canPost) post(false);
                    }}
                >
                    <div className="mt-5 flex items-center rounded-[15px] border-[1.5px] border-line bg-cream px-[15px] focus-within:border-[#8b5a2d] focus-within:bg-[rgba(232,220,203,0.45)] focus-within:shadow-[0_0_4px_rgba(139,90,45,0.6)]">
                        <input
                            type="text"
                            aria-label="오늘의 한마디"
                            placeholder="한마디를 적어주세요"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            className={INPUT}
                        />
                        <span
                            className={`ml-2 shrink-0 font-dodum text-[10px] leading-[15px] ${count > BUBBLE_MAX ? 'text-red-600' : 'text-counter'}`}
                        >
                            {count}/{BUBBLE_MAX}
                        </span>
                    </div>
                    <p className="px-1 pt-2 text-[10px] leading-[15px] text-[#97978e]">
                        부담 없이, 지금의 마음을 짧게 남겨보세요.
                    </p>
                    <div className="relative mt-[18px]">
                        <SheetNotice text={notice.notice} />
                        <button
                            type="submit"
                            disabled={!canPost}
                            className="h-14 w-full rounded-[14px] bg-primary text-base font-bold tracking-[-0.2px] text-white disabled:bg-primary-disabled"
                        >
                            들판에 띄우기
                        </button>
                    </div>
                </form>
            </BottomSheet>
            <BubbleHelpModal
                open={helpOpen}
                busy={sending}
                onRevise={() => setHelpOpen(false)}
                onPostAnyway={() => post(true)}
            />
        </>
    );
}
