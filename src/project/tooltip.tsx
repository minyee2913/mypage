import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * 용어 툴팁 레이어. 스크롤 영역(overflow) 안에서 잘리지 않도록 화면 고정 위치에 하나만 띄우고,
 * 화면 가장자리를 넘지 않게 위치를 맞춘다.
 */
// 서버 렌더링에서는 레이아웃 효과가 의미가 없으므로 useEffect 로 대체 (경고 방지)
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Tip {
    text: string;
    left: number;
    top: number;
    bottom: number;
}

let setTip: ((t: Tip | null) => void) | null = null;

export function showTip(el: HTMLElement, text: string) {
    const r = el.getBoundingClientRect();
    setTip?.({ text, left: r.left, top: r.top, bottom: r.bottom });
}

export function hideTip() {
    setTip?.(null);
}

export function TooltipLayer() {
    const [tip, set] = useState<Tip | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        setTip = set;
        // 스크롤하면 기준 위치가 어긋나므로 닫는다
        const close = () => set(null);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            setTip = null;
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, []);

    useIsoLayoutEffect(() => {
        if (!tip || !ref.current) {
            setPos(null);
            return;
        }
        const { width, height } = ref.current.getBoundingClientRect();
        const margin = 8;
        const x = Math.min(Math.max(margin, tip.left), window.innerWidth - width - margin);
        let y = tip.bottom + 6;
        if (y + height > window.innerHeight - margin) y = tip.top - height - 6;
        setPos({ x, y: Math.max(margin, y) });
    }, [tip]);

    if (!tip) return null;
    return (
        <div
            ref={ref}
            className="pj-tooltip"
            role="tooltip"
            style={{ left: pos?.x ?? -9999, top: pos?.y ?? -9999, visibility: pos ? "visible" : "hidden" }}
        >
            {tip.text}
        </div>
    );
}
