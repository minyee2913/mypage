import type { ReactNode } from "react";
import { GLOSSARY, GLOSSARY_TERMS } from "../content/glossary";
import { hideTip, showTip } from "./tooltip";

/**
 * 설명 문장 렌더링:
 * - **강조** → 강조색 굵은 글씨 (채용 담당자가 훑어볼 때 핵심이 보이도록)
 * - 용어집(GLOSSARY)에 있는 기술 용어 → 점선 밑줄 + 툴팁 (문장마다 첫 등장만)
 */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TERM_RE = new RegExp(GLOSSARY_TERMS.map(escapeRe).join("|"), "g");
const isWordChar = (c: string | undefined) => !!c && /[A-Za-z0-9_]/.test(c);

export function Term({ term, children }: { term: string; children?: ReactNode }) {
    const tip = GLOSSARY[term];
    if (!tip) return <>{children ?? term}</>;
    return (
        <span
            className="pj-term"
            tabIndex={0}
            data-tip={tip}
            onMouseEnter={(e) => showTip(e.currentTarget, tip)}
            onMouseLeave={hideTip}
            onFocus={(e) => showTip(e.currentTarget, tip)}
            onBlur={hideTip}
        >
            {children ?? term}
        </span>
    );
}

function withTerms(text: string, used: Set<string>, keyBase: string): ReactNode[] {
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of Array.from(text.matchAll(TERM_RE))) {
        const term = m[0];
        const at = m.index ?? 0;
        // 영문 용어는 단어 중간에서 잡히지 않게 (예: "URPGlitch" 의 URP)
        if (/^[A-Za-z]/.test(term) && (isWordChar(text[at - 1]) || isWordChar(text[at + term.length]))) continue;
        if (used.has(term)) continue;
        used.add(term);
        if (at > last) out.push(text.slice(last, at));
        out.push(<Term key={`${keyBase}-${at}`} term={term} />);
        last = at + term.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export function Rich({ text }: { text: string }) {
    const used = new Set<string>();
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? (
                    <strong key={i} className="pj-em">
                        {withTerms(part, used, `e${i}`)}
                    </strong>
                ) : (
                    withTerms(part, used, `t${i}`)
                ),
            )}
        </>
    );
}
