import { useEffect, useRef } from 'react';

/** 온라인 상담: 마들렌 카카오 채널 (팀에서 정한 연결처) */
const ONLINE_COUNSEL_URL = 'https://pf.kakao.com/_DAxbYG';

const LINK_ROW =
    'relative flex h-[69px] w-full items-center rounded-[18px] border border-[#eadcc5] bg-[#fffcf4] pr-3 pl-[13px] text-left text-[14px] leading-[17.5px] font-semibold text-primary shadow-[0_12px_17.5px_rgba(66,84,56,0.12)]';

/**
 * 위험 키워드 도움 모달 (Figma 174:7641). 한마디에 위험 키워드가 있어 서버가 게시를 멈췄을 때 뜬다.
 * 한마디 시트(또 하나의 <dialog>) 위에 겹쳐야 해서 BottomSheet처럼 showModal을 쓴다.
 */
export function BubbleHelpModal({
    open,
    busy,
    onRevise,
    onPostAnyway,
}: {
    open: boolean;
    /** 그대로 올리는 중이면 버튼을 잠근다 */
    busy: boolean;
    /** 닫기(X)·Esc·"문장을 고쳐볼게요": 입력으로 돌아간다 */
    onRevise: () => void;
    /** "그래도 이대로 남길게요": confirm:true로 다시 올린다 */
    onPostAnyway: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby="bubble-help-title"
            onClose={onRevise}
            className="m-auto w-[calc(100%-42px)] max-w-[351px] rounded-[28px] bg-[#fff8e9] shadow-[0_22px_30px_rgba(26,25,21,0.27)] backdrop:bg-black/25 backdrop:backdrop-blur-sm"
        >
            <div className="relative px-3 pt-[54px] pb-[25px]">
                <button
                    type="button"
                    onClick={onRevise}
                    aria-label="닫기"
                    className="absolute top-[17px] right-[26px] flex size-6 items-center justify-center"
                >
                    <img src="/assets/icon-close.svg" alt="" width={13.5} height={13.5} />
                </button>

                <h2
                    id="bubble-help-title"
                    className="text-center text-[22px] leading-[33px] font-bold text-[#5c401e]"
                >
                    지금 조금 많이 힘든가요?
                </h2>
                <p className="mt-3.5 text-center text-[11px] leading-[18.7px] font-medium text-[#755d40]">
                    혼자 감당하기 어려운 감정이라면,
                    <br />
                    전문가의 도움을 받아보는 것도 좋은 방법이에요.
                </p>

                <div className="mt-5 flex flex-col gap-2.5">
                    <a href="tel:109" className={LINK_ROW}>
                        <span className="flex size-[34px] items-center justify-center">
                            <img src="/assets/icon-call.svg" alt="" width={23.76} height={25.5} />
                        </span>
                        <span className="ml-3.5 flex-1">24시간 상담전화 109</span>
                        <img src="/assets/icon-arrow.svg" alt="" width={19} height={19} />
                    </a>
                    <a
                        href={ONLINE_COUNSEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_ROW}
                    >
                        <span className="flex size-[34px] items-center justify-center">
                            <img
                                src="/assets/icon-support-agent.svg"
                                alt=""
                                width={26.4}
                                height={25.5}
                            />
                        </span>
                        <span className="ml-3.5 flex-1">온라인 상담 바로가기</span>
                        <img src="/assets/icon-arrow.svg" alt="" width={19} height={19} />
                    </a>
                </div>

                <button
                    type="button"
                    onClick={onRevise}
                    className="mt-5 h-14 w-full rounded-[14px] bg-primary text-base font-bold tracking-[-0.2px] text-white"
                >
                    문장을 고쳐볼게요
                </button>
                <button
                    type="button"
                    disabled={busy}
                    onClick={onPostAnyway}
                    className="mx-auto mt-4 block text-xs leading-[13.5px] font-semibold text-[#93816a] underline disabled:opacity-60"
                >
                    그래도 이대로 남길게요
                </button>
            </div>
        </dialog>
    );
}
