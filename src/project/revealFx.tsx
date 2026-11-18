import { useEffect, useRef, useState } from "react";
import type { RevealStyle } from "../content";
import BurnReveal from "./burnReveal";

/**
 * 상세 페이지에 처음 들어갈 때 화면을 덮었다가 걷어내는 연출.
 * 각 연출은 "아직 덮고 있는 부분"만 그리고, 다 걷히면 캔버스를 없앤다.
 * 클릭은 통과하고, 동작 줄이기 설정이면 건너뛴다. (burn 은 burnReveal.tsx)
 */

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => boolean;
/** 연출이 페이지에 주는 효과 (예: 임팩트 순간 화면 흔들기) */
interface RevealHooks {
    shake: () => void;
}
type Factory = (w: number, h: number, accent: string, fx: RevealHooks) => Draw;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeIn = (x: number) => x * x * x;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * 발!도!!: 발도 일섬.
 * 기 모으기(칼끝 반짝임) → 0.06초 만에 화면을 가르는 일섬 → 흰 섬광 + 히트스톱 + 불꽃
 * → 화면 흔들림과 함께 두 조각이 기울며 빠르게 갈라진다.
 */
const slash: Factory = (w, h, accent, fx) => {
    const angle = Math.atan2(-h * 0.62, w); // 왼쪽 아래 → 오른쪽 위
    const diag = Math.hypot(w, h);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const T_CHARGE = 0.2; // 기 모으기
    const T_CUT = 0.06; // 일섬
    const T_HIT = T_CHARGE + T_CUT; // 임팩트 순간
    const T_STOP = 0.11; // 히트스톱
    const T_OPEN = 0.55; // 갈라지는 시간
    // 화면 좌표의 베기 선 (중심 기준 회전 좌표계에서 x = -diag/2 ~ diag/2, y = 0)
    const toScreen = (lx: number, ly: number) => ({ x: w / 2 + lx * cos - ly * sin, y: h / 2 + lx * sin + ly * cos });

    interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; hot: boolean }
    const sparks: Spark[] = [];
    let impacted = false;
    let last = 0;

    return (ctx, _w, _h, t) => {
        const dt = Math.min(0.05, Math.max(0, t - last));
        last = t;
        const cut = clamp01((t - T_CHARGE) / T_CUT);
        const openP = clamp01((t - T_HIT - T_STOP) / T_OPEN);
        const open = 1 - Math.pow(1 - openP, 5); // 아주 빠르게 열리고 천천히 멈춘다
        const off = open * diag * 0.5;
        const tilt = open * 0.045;

        // 임팩트: 불꽃을 터뜨리고 페이지를 흔든다 (한 번만)
        if (!impacted && t >= T_HIT) {
            impacted = true;
            fx.shake();
            for (let i = 0; i < 90; i++) {
                const along = rand(-0.48, 0.48) * diag;
                const side = Math.random() < 0.5 ? -1 : 1;
                const sp = rand(250, 900);
                const spread = rand(-0.9, 0.9);
                const p = toScreen(along, 0);
                // 베기 선에 수직인 방향 + 진행 방향으로 조금
                const nx = -sin * side, ny = cos * side;
                sparks.push({
                    x: p.x,
                    y: p.y,
                    vx: (nx + cos * spread) * sp,
                    vy: (ny + sin * spread) * sp,
                    life: 0,
                    max: rand(0.25, 0.7),
                    hot: Math.random() < 0.4,
                });
            }
        }

        // 1) 덮개: 두 조각 (갈라지면서 살짝 기운다)
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(angle);
        const big = diag * 2;
        const dark = "#0d0a07";
        for (const side of [-1, 1] as const) {
            ctx.save();
            ctx.translate(0, side * off);
            ctx.rotate(side * tilt);
            ctx.fillStyle = dark;
            ctx.fillRect(-big / 2, side < 0 ? -big / 2 : 0, big, big / 2);
            // 베인 단면이 잠깐 달아올라 빛난다
            if (impacted && openP < 1) {
                const glow = Math.max(0, 1 - openP * 1.4);
                ctx.globalAlpha = glow;
                ctx.fillStyle = accent;
                ctx.fillRect(-big / 2, side < 0 ? -4 : 0, big, 4);
                ctx.fillStyle = "#fff6dc";
                ctx.fillRect(-big / 2, side < 0 ? -1.5 : 0, big, 1.5);
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }

        // 2) 기 모으기: 칼끝 반짝임
        if (t < T_CHARGE + 0.02) {
            const k = clamp01(t / T_CHARGE);
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.25 + 0.75 * k;
            const L = 8 + 70 * k * k; // 반짝임 십자 길이
            ctx.fillRect(-diag / 2 + 30 - L, -1.5, L * 2, 3);
            ctx.fillRect(-diag / 2 + 30 - 1.5, -L * 0.45, 3, L * 0.9);
            ctx.fillStyle = "#fff";
            ctx.fillRect(-diag / 2 + 26, -4, 8, 8);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        }

        // 3) 일섬: 굵은 빛 + 잔상
        if (cut > 0 && openP < 0.3) {
            const fade = t < T_HIT + T_STOP ? 1 : Math.max(0, 1 - openP / 0.3);
            const len = diag * cut;
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = accent;
            ctx.globalAlpha = fade * 0.18;
            ctx.fillRect(-diag / 2, -46, len, 92); // 넓은 잔광
            ctx.globalAlpha = fade * 0.45;
            ctx.fillRect(-diag / 2, -14, len, 28);
            ctx.globalAlpha = fade;
            ctx.fillRect(-diag / 2, -6, len, 12);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-diag / 2, -2.5, len, 5);
            // 칼날 끝
            if (cut < 1) {
                ctx.fillRect(-diag / 2 + len - 24, -9, 24, 18);
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        }
        ctx.restore();

        // 4) 임팩트 섬광 (히트스톱 동안 화면 전체가 하얗게 번쩍)
        if (impacted) {
            const fl = 1 - clamp01((t - T_HIT) / 0.16);
            if (fl > 0) {
                ctx.globalAlpha = 0.85 * fl * fl;
                ctx.fillStyle = "#fff8e8";
                ctx.fillRect(0, 0, w, h);
                ctx.globalAlpha = 1;
            }
        }

        // 5) 불꽃: 속도 방향으로 늘어진 짧은 선
        if (sparks.length) {
            ctx.globalCompositeOperation = "lighter";
            ctx.lineCap = "round";
            const frozen = t < T_HIT + T_STOP; // 히트스톱 동안은 멈춰 있다
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                if (!frozen) {
                    s.life += dt;
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    s.vx *= 0.9;
                    s.vy = s.vy * 0.9 + 900 * dt;
                }
                if (s.life >= s.max) {
                    sparks.splice(i, 1);
                    continue;
                }
                const a = 1 - s.life / s.max;
                ctx.globalAlpha = a;
                ctx.strokeStyle = s.hot ? "#fffbe8" : accent;
                ctx.lineWidth = s.hot ? 2.5 : 1.8;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        }

        return openP < 1 || sparks.length > 0;
    };
};

/** 제발 꺼져 용사야!: 화면을 덮은 마법 카드 뒷면이 가운데부터 뒤집혀 사라진다 */
const cards: Factory = (w, h, accent) => {
    const cols = Math.max(4, Math.round(w / 92));
    const rows = Math.max(3, Math.round(h / 128));
    const cw = w / cols, ch = h / rows;
    const cx = w / 2, cy = h / 2, maxD = Math.hypot(cx, cy);
    const list: { x: number; y: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const x = c * cw, y = r * ch;
            const d = Math.hypot(x + cw / 2 - cx, y + ch / 2 - cy) / maxD;
            list.push({ x, y, delay: 0.1 + d * 0.75 + rand(0, 0.08) });
        }
    return (ctx, _w, _h, t) => {
        let alive = false;
        for (const k of list) {
            const p = clamp01((t - k.delay) / 0.42);
            if (p >= 1) continue;
            alive = true;
            const sx = Math.abs(Math.cos((p * Math.PI) / 2)); // 뒤집히며 폭이 줄어든다
            const lift = 1 + p * 0.12;
            const ww = cw * sx * lift, hh = ch * lift;
            const x = k.x + (cw - ww) / 2, y = k.y + (ch - hh) / 2 - p * 10;
            ctx.globalAlpha = 1 - easeIn(p) * 0.6;
            ctx.fillStyle = "#1a0f24";
            ctx.fillRect(x + 1, y + 1, ww - 2, hh - 2);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, ww - 8, hh - 8);
            // 가운데 마름모 문양
            if (ww > 16) {
                const mx = x + ww / 2, my = y + hh / 2, s = Math.min(ww, hh) * 0.18;
                ctx.fillStyle = "#3a1d52";
                ctx.beginPath();
                ctx.moveTo(mx, my - s * 1.4);
                ctx.lineTo(mx + s, my);
                ctx.lineTo(mx, my + s * 1.4);
                ctx.lineTo(mx - s, my);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
        return alive;
    };
};

/** 하늘오름: 별이 바깥으로 쏟아지는 워프 → 빛 고리가 퍼지며 열린다 */
const warp: Factory = (w, h, accent) => {
    const cx = w / 2, cy = h * 0.55, diag = Math.hypot(w, h);
    const stars = Array.from({ length: 160 }, () => ({ a: rand(0, Math.PI * 2), d: rand(0.02, 1), s: rand(0.6, 1.8) }));
    return (ctx, _w, _h, t) => {
        const iris = easeIn(clamp01((t - 0.55) / 0.85)) * diag * 1.05;
        // 덮개 + 별 줄기
        ctx.fillStyle = "#04060f";
        ctx.fillRect(0, 0, w, h);
        const speed = easeIn(clamp01(t / 0.9));
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.5 + 0.5 * speed;
        ctx.lineWidth = 1.4;
        for (const [color, big] of [["#dfe9ff", false], [accent, true]] as const) {
            ctx.strokeStyle = color;
            ctx.beginPath();
            for (const s of stars) {
                if ((s.s > 1.3) !== big) continue;
                const r0 = (s.d + speed * 1.6 * s.s) * diag * 0.5;
                const len = 4 + speed * 140 * s.s;
                ctx.moveTo(cx + Math.cos(s.a) * r0, cy + Math.sin(s.a) * r0);
                ctx.lineTo(cx + Math.cos(s.a) * (r0 + len), cy + Math.sin(s.a) * (r0 + len));
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // 가운데부터 뚫린다 (부드러운 가장자리)
        if (iris > 0) {
            ctx.globalCompositeOperation = "destination-out";
            const g = ctx.createRadialGradient(cx, cy, iris * 0.85, cx, cy, iris + 1);
            g.addColorStop(0, "rgba(0,0,0,1)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, iris + 1, 0, Math.PI * 2);
            ctx.fill();
            // 빛 고리
            ctx.globalCompositeOperation = "lighter";
            const ringA = Math.max(0, 1 - iris / diag);
            ctx.beginPath();
            ctx.arc(cx, cy, iris, 0, Math.PI * 2);
            // 번짐(shadowBlur) 대신 넓고 옅은 선 + 얇고 밝은 선 두 겹
            ctx.strokeStyle = accent;
            ctx.globalAlpha = ringA * 0.35;
            ctx.lineWidth = 22;
            ctx.stroke();
            ctx.strokeStyle = "#cfe3ff";
            ctx.globalAlpha = ringA;
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        ctx.globalCompositeOperation = "source-over";
        return iris < diag;
    };
};

/** 내가 찻잔이라니!: 화면에 찬 커피가 거품 띠와 함께 아래로 빠진다 */
const drain: Factory = (w, h) => {
    const bubbles = Array.from({ length: 40 }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(2, 6) }));
    return (ctx, _w, _h, t) => {
        const level = -30 + easeInOut(clamp01((t - 0.15) / 1.25)) * (h + 90);
        const wave = (x: number) => level + Math.sin(x * 0.018 + t * 7) * 12 + Math.sin(x * 0.047 - t * 5) * 5;
        // 커피
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 12) ctx.lineTo(x, wave(x));
        ctx.lineTo(w, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, level, 0, h);
        g.addColorStop(0, "#6b4128");
        g.addColorStop(0.15, "#3d2416");
        g.addColorStop(1, "#1f120a");
        ctx.fillStyle = g;
        ctx.fill();
        // 크레마 거품 띠
        ctx.strokeStyle = "#e9cf9f";
        ctx.lineWidth = 7;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) (x === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, wave(x) + 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // 거품 방울
        ctx.fillStyle = "rgba(233, 207, 159, 0.35)";
        for (const b of bubbles) {
            if (b.y > wave(b.x) + 10) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        return level < h + 40;
    };
};

/** Luminous: 어둠 속 가운데에서 빛살과 함께 빛이 퍼진다 */
const light: Factory = (w, h, accent) => {
    const cx = w * 0.3, cy = h * 0.42, diag = Math.hypot(w, h);
    const rays = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2 + rand(-0.1, 0.1), wdt: rand(0.03, 0.08) }));
    return (ctx, _w, _h, t) => {
        const r = easeInOut(clamp01((t - 0.2) / 1.3)) * diag * 1.2;
        ctx.fillStyle = "#03070c";
        ctx.fillRect(0, 0, w, h);
        // 빛이 닿은 곳은 걷힌다
        ctx.globalCompositeOperation = "destination-out";
        const g = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r + 1);
        g.addColorStop(0, "rgba(0,0,0,1)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        // 빛살과 광원
        ctx.globalCompositeOperation = "lighter";
        const fade = Math.max(0, 1 - Math.max(0, t - 0.7) / 0.6);
        const glow = Math.min(1, t / 0.25) * fade;
        ctx.globalAlpha = 0.11 * glow;
        ctx.fillStyle = accent;
        ctx.beginPath();
        for (const ray of rays) {
            const a = ray.a + t * 0.25;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a - ray.wdt) * diag, cy + Math.sin(a - ray.wdt) * diag);
            ctx.lineTo(cx + Math.cos(a + ray.wdt) * diag, cy + Math.sin(a + ray.wdt) * diag);
            ctx.closePath();
        }
        ctx.fill();
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 + r * 0.12);
        core.addColorStop(0, "rgba(255,255,255,0.9)");
        core.addColorStop(0.3, accent);
        core.addColorStop(1, "transparent");
        ctx.globalAlpha = glow;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, 90 + r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        return t < 1.35;
    };
};

/** 마인크래프트: 흙·돌 블록에 금이 가고 부서져 떨어진다 */
const blocks: Factory = (w, h) => {
    const S = 56;
    const cols = Math.ceil(w / S), rows = Math.ceil(h / S);
    const palettes = [
        ["#79553a", "#6c4a32", "#8b6446", "#5e3f2a"], // 흙
        ["#7d7d7d", "#6e6e6e", "#8a8a8a", "#5f5f5f"], // 돌
    ];
    // 블록 텍스처 두 장을 미리 그린다 (8x8 픽셀)
    const tex = palettes.map((pal) => {
        const c = document.createElement("canvas");
        c.width = c.height = 8;
        const x = c.getContext("2d")!;
        for (let i = 0; i < 64; i++) {
            x.fillStyle = pal[Math.floor(Math.random() * pal.length)];
            x.fillRect(i % 8, Math.floor(i / 8), 1, 1);
        }
        return c;
    });
    const list: { x: number; y: number; tex: HTMLCanvasElement; delay: number; vx: number }[] = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            list.push({ x: c * S, y: r * S, tex: tex[(r * 7 + c * 3) % 5 === 0 ? 1 : Math.random() < 0.35 ? 1 : 0], delay: 0.08 + (r / rows) * 0.5 + rand(0, 0.45), vx: rand(-40, 40) });
    return (ctx, _w, _h, t) => {
        ctx.imageSmoothingEnabled = false;
        let alive = false;
        for (const b of list) {
            const p = clamp01((t - b.delay) / 0.5);
            if (p >= 1) continue;
            alive = true;
            if (p < 0.35) {
                ctx.globalAlpha = 1;
                ctx.drawImage(b.tex, b.x, b.y, S, S);
                // 금 가는 단계
                const crack = Math.floor((p / 0.35) * 4);
                ctx.fillStyle = "rgba(0,0,0,0.55)";
                for (let i = 0; i < crack * 3; i++) ctx.fillRect(b.x + ((i * 23) % S), b.y + ((i * 37) % S), 7, 7);
            } else {
                const q = (p - 0.35) / 0.65;
                const s = S * (1 - q * 0.5);
                ctx.globalAlpha = 1 - q;
                ctx.drawImage(b.tex, b.x + (S - s) / 2 + b.vx * q, b.y + (S - s) / 2 + q * q * 160, s, s);
            }
        }
        ctx.globalAlpha = 1;
        return alive;
    };
};

/** 기본: 강조색 픽셀이 대각선 물결로 사라진다 */
const pixels: Factory = (w, h, accent) => {
    const S = 34;
    const cols = Math.ceil(w / S), rows = Math.ceil(h / S);
    const list: { x: number; y: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) list.push({ x: c * S, y: r * S, delay: 0.08 + ((c + r) / (cols + rows)) * 0.85 + rand(0, 0.12) });
    return (ctx, _w, _h, t) => {
        let alive = false;
        for (const k of list) {
            const p = clamp01((t - k.delay) / 0.3);
            if (p >= 1) continue;
            alive = true;
            const s = S * (1 - easeIn(p));
            ctx.fillStyle = p > 0.05 ? accent : "#0c0c0c";
            ctx.globalAlpha = p > 0.05 ? 0.85 : 1;
            ctx.fillRect(k.x + (S - s) / 2, k.y + (S - s) / 2, s + 0.5, s + 0.5);
        }
        ctx.globalAlpha = 1;
        return alive;
    };
};

/**
 * 구해줘 홈즈: 게임의 점프 궤적처럼 점선 포물선이 그려지고,
 * 화면을 덮은 피자 상자들이 그 방향으로 던져져 중력에 떨어진다.
 */
const toss: Factory = (w, h, accent) => {
    const S = Math.max(90, Math.round(Math.min(w, h) / 6));
    const cols = Math.ceil(w / S), rows = Math.ceil(h / S);
    const G = 2600;
    const T0 = 0.42; // 던지기 시작
    const boxes: { x: number; y: number; vx: number; vy: number; spin: number; delay: number; shade: number }[] = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            boxes.push({
                x: c * S,
                y: r * S,
                vx: rand(250, 720),
                vy: -rand(650, 1150),
                spin: rand(-7, 7),
                delay: T0 + (c / cols) * 0.32 + ((rows - r) / rows) * 0.1 + rand(0, 0.06),
                shade: rand(-12, 12),
            });
    // 궤적 점: 왼쪽 아래에서 오른쪽 위로 (게임처럼 점이 점점 작아진다)
    const dots = Array.from({ length: 15 }, (_, i) => {
        const k = (i + 1) / 15;
        return { x: w * (0.12 + 0.62 * k), y: h * 0.82 - (h * 0.95 * k - h * 0.42 * k * k), s: 24 - i * 1.1 };
    });
    const drawBox = (ctx: CanvasRenderingContext2D, shade: number) => {
        const half = S / 2 - 3;
        ctx.fillStyle = `hsl(32, 48%, ${44 + shade * 0.3}%)`;
        ctx.fillRect(-half, -half, half * 2, half * 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(-half, half * 0.55, half * 2, half * 0.45); // 옆면 그림자
        ctx.strokeStyle = "#5a3a1c";
        ctx.lineWidth = 3;
        ctx.strokeRect(-half, -half, half * 2, half * 2);
        ctx.fillStyle = "#d8402f"; // 가게 스티커
        ctx.beginPath();
        ctx.arc(0, -half * 0.15, half * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffe2a8";
        ctx.fillRect(-half * 0.5, half * 0.3, half, 4);
    };
    return (ctx, _w, _h, t) => {
        let alive = false;
        // 바닥: 아직 던져지지 않은 상자
        for (const b of boxes) {
            const dt = t - b.delay;
            let x = b.x + S / 2, y = b.y + S / 2, rot = 0;
            if (dt > 0) {
                x += b.vx * dt;
                y += b.vy * dt + 0.5 * G * dt * dt;
                rot = b.spin * dt;
                if (y - S > h || x - S > w) continue;
            }
            alive = true;
            ctx.save();
            ctx.translate(x, y);
            if (rot) ctx.rotate(rot);
            drawBox(ctx, b.shade);
            ctx.restore();
        }
        // 궤적 점: 당기는 동안 하나씩 나타났다가, 던지면 사라진다
        const show = clamp01(t / 0.32);
        const fade = 1 - clamp01((t - T0) / 0.25);
        if (fade > 0) {
            alive = true;
            const n = Math.ceil(show * dots.length);
            for (let i = 0; i < n; i++) {
                const d = dots[i];
                ctx.globalAlpha = fade * 0.95;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(d.x - d.s / 2 - 2, d.y - d.s / 2 - 2, d.s + 4, d.s + 4);
                ctx.fillStyle = accent;
                ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
            }
            ctx.globalAlpha = 1;
        }
        return alive;
    };
};

/**
 * 생존 전략!: 맵 가운데 타이머처럼 시곗바늘이 한 바퀴 돌며 덮개를 걷어 내고,
 * 시간이 다 되는 순간 붉은 섬광과 함께 화면이 흔들린다 (불꽃의 거인 등장).
 */
const clock: Factory = (w, h, accent, fx) => {
    const cx = w / 2, cy = h / 2, R = Math.hypot(w, h);
    const ring = Math.min(w, h) * 0.22;
    const T_SWEEP = 0.95, T_START = 0.18;
    let hit = false;
    return (ctx, _w, _h, t) => {
        const p = easeInOut(clamp01((t - T_START) / T_SWEEP));
        const a0 = -Math.PI / 2;
        const a = a0 + p * Math.PI * 2;
        // 남은 시간만큼의 부채꼴만 덮는다
        if (p < 1) {
            ctx.fillStyle = "#120707";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, R, a, a0 + Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            // 눈금
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 60; i++) {
                const ta = a0 + (i / 60) * Math.PI * 2;
                if (ta < a) continue;
                const l = i % 5 === 0 ? 18 : 8;
                ctx.moveTo(cx + Math.cos(ta) * ring, cy + Math.sin(ta) * ring);
                ctx.lineTo(cx + Math.cos(ta) * (ring + l), cy + Math.sin(ta) * (ring + l));
            }
            ctx.stroke();
            // 바늘
            ctx.strokeStyle = accent;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
            ctx.stroke();
            ctx.strokeStyle = "#fff2e0";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fill();
        }
        // 시간 종료: 붉은 섬광 + 흔들림
        const tEnd = T_START + T_SWEEP;
        if (!hit && t >= tEnd) {
            hit = true;
            fx.shake();
        }
        const fl = hit ? 1 - clamp01((t - tEnd) / 0.45) : 0;
        if (fl > 0) {
            ctx.globalAlpha = fl * fl * 0.7;
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.6);
            g.addColorStop(0, "#ffb070");
            g.addColorStop(0.4, accent);
            g.addColorStop(1, "rgba(80,0,0,0.6)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
        }
        return p < 1 || fl > 0;
    };
};

/**
 * KOROSHITE: 일격에 화면이 깨지고, 파편이 회전하며 떨어진다.
 */
const shatter: Factory = (w, h, accent, fx) => {
    const ix = w * 0.56, iy = h * 0.46;
    const R = Math.hypot(Math.max(ix, w - ix), Math.max(iy, h - iy)) + 40;
    const N = 16;
    const angles = Array.from({ length: N }, (_, i) => (i / N) * Math.PI * 2 + rand(-0.12, 0.12));
    const radii = [0, 70, 190, 380, 640, R * 1.2];
    const T_HIT = 0.14;
    interface Shard { pts: [number, number][]; cx: number; cy: number; vx: number; vy: number; spin: number; delay: number; tone: number }
    const shards: Shard[] = [];
    for (let k = 0; k < radii.length - 1; k++)
        for (let i = 0; i < N; i++) {
            const a1 = angles[i], a2 = angles[(i + 1) % N] + (i === N - 1 ? Math.PI * 2 : 0);
            const r1 = radii[k] * rand(0.92, 1.08), r2 = radii[k + 1] * rand(0.92, 1.08);
            const raw: [number, number][] = [
                [Math.cos(a1) * r1, Math.sin(a1) * r1],
                [Math.cos(a1) * r2, Math.sin(a1) * r2],
                [Math.cos(a2) * r2, Math.sin(a2) * r2],
                [Math.cos(a2) * r1, Math.sin(a2) * r1],
            ];
            const mx = raw.reduce((s, p) => s + p[0], 0) / 4, my = raw.reduce((s, p) => s + p[1], 0) / 4;
            const d = Math.hypot(mx, my) || 1;
            shards.push({
                pts: raw.map(([x, y]) => [x - mx, y - my]),
                cx: ix + mx,
                cy: iy + my,
                vx: (mx / d) * rand(80, 260),
                vy: (my / d) * rand(40, 180) - rand(60, 200),
                spin: rand(-3, 3),
                delay: T_HIT + 0.12 + (k / radii.length) * 0.28 + rand(0, 0.08),
                tone: rand(0, 1),
            });
        }
    let hit = false;
    return (ctx, _w, _h, t) => {
        if (!hit && t >= T_HIT) {
            hit = true;
            fx.shake();
        }
        let alive = false;
        for (const s of shards) {
            const dt = Math.max(0, t - s.delay);
            const x = s.cx + s.vx * dt;
            const y = s.cy + s.vy * dt + 0.5 * 2200 * dt * dt;
            if (y - 300 > h) continue;
            alive = true;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(s.spin * dt);
            ctx.beginPath();
            s.pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
            ctx.closePath();
            ctx.fillStyle = s.tone > 0.5 ? "#101014" : "#16161c";
            ctx.fill();
            if (hit) {
                ctx.strokeStyle = dt > 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.restore();
        }
        // 충격 지점 섬광
        if (hit) {
            const fl = 1 - clamp01((t - T_HIT) / 0.25);
            if (fl > 0) {
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = fl;
                ctx.fillStyle = accent;
                ctx.beginPath();
                ctx.arc(ix, iy, 30 + (1 - fl) * 120, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(ix, iy, 14 + (1 - fl) * 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
            }
        }
        return alive;
    };
};

/** Albedo: 미지의 행성을 훑는 빛줄기가 위에서 아래로 지나가며 화면을 밝힌다 */
const scan: Factory = (w, h, accent) => {
    return (ctx, _w, _h, t) => {
        const y = -60 + easeInOut(clamp01((t - 0.12) / 1.0)) * (h + 160);
        // 아직 훑지 않은 아래쪽 덮개 + 격자
        ctx.fillStyle = "#050a14";
        ctx.fillRect(0, y, w, h - y);
        ctx.strokeStyle = "rgba(120,200,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let gx = 0; gx < w; gx += 48) {
            ctx.moveTo(gx, Math.max(0, y));
            ctx.lineTo(gx, h);
        }
        for (let gy = Math.ceil(y / 48) * 48; gy < h; gy += 48) {
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
        }
        ctx.stroke();
        // 빛줄기
        ctx.globalCompositeOperation = "lighter";
        const g = ctx.createLinearGradient(0, y - 140, 0, y + 6);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.85, accent);
        g.addColorStop(1, "#ffffff");
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = g;
        ctx.fillRect(0, y - 140, w, 146);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, y - 2, w, 3);
        ctx.globalCompositeOperation = "source-over";
        return y < h + 100;
    };
};

/**
 * 버튼을 눌렀더니…: 가운데 빨간 버튼이 '딸깍' 눌리고,
 * 마법진이 돌며 퍼져 판타지 세계로 넘어간다.
 */
const portal: Factory = (w, h, accent, fx) => {
    const cx = w / 2, cy = h / 2, diag = Math.hypot(w, h);
    const T_PRESS = 0.32;
    let pressed = false;
    return (ctx, _w, _h, t) => {
        const iris = easeIn(clamp01((t - T_PRESS - 0.08) / 0.8)) * diag * 0.62;
        ctx.fillStyle = "#0c0716";
        ctx.fillRect(0, 0, w, h);
        if (!pressed && t >= T_PRESS) {
            pressed = true;
            fx.shake();
        }
        // 버튼
        if (iris < 40) {
            const down = t < 0.2 ? 0 : Math.min(1, (t - 0.2) / (T_PRESS - 0.2));
            ctx.fillStyle = "#4a1018";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 16, 62, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e23a3a";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 4 + down * 10, 54, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ff8080";
            ctx.beginPath();
            ctx.ellipse(cx - 12, cy - 2 + down * 10, 18, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (iris > 0) {
            // 구멍
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(cx, cy, iris, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            // 마법진 테두리: 두 겹 원 + 도는 룬 눈금
            const rot = t * 2.2;
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, iris, 0, Math.PI * 2);
            ctx.stroke();
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cx, cy, iris + 18, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = accent;
            for (let i = 0; i < 24; i++) {
                const a = rot + (i / 24) * Math.PI * 2;
                ctx.save();
                ctx.translate(cx + Math.cos(a) * (iris + 9), cy + Math.sin(a) * (iris + 9));
                ctx.rotate(a);
                ctx.fillRect(-2, -5, 4, i % 3 === 0 ? 10 : 5);
                ctx.restore();
            }
        }
        return iris < diag * 0.6;
    };
};

/** ECHO: 가운데에서 메아리처럼 동심원이 퍼지고, 마지막 파동이 화면을 연다 */
const ripple: Factory = (w, h, accent) => {
    const cx = w / 2, cy = h / 2, diag = Math.hypot(w, h);
    return (ctx, _w, _h, t) => {
        const r = easeIn(clamp01((t - 0.5) / 0.8)) * diag * 0.6;
        ctx.fillStyle = "#081012";
        ctx.fillRect(0, 0, w, h);
        if (r > 0) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
        }
        // 앞서 퍼지는 메아리 고리 3개
        ctx.strokeStyle = accent;
        for (let i = 0; i < 4; i++) {
            const start = i * 0.16;
            const k = clamp01((t - start) / 1.1);
            if (k <= 0 || k >= 1) continue;
            const rr = r + 20 + easeInOut(k) * diag * 0.55;
            ctx.globalAlpha = (1 - k) * 0.9;
            ctx.lineWidth = 4 - i * 0.6;
            ctx.beginPath();
            ctx.arc(cx, cy, rr, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        return r < diag * 0.6 || t < 1.3;
    };
};

/** 범근러쉬: 가로 띠들이 속도선을 남기며 왼쪽으로 질주해 빠져나간다 */
const dash: Factory = (w, h, accent) => {
    const H = 26;
    const rows = Math.ceil(h / H);
    const list = Array.from({ length: rows }, (_, r) => ({ y: r * H, delay: 0.08 + (Math.abs(r - rows / 2) / rows) * 0.35 + rand(0, 0.12), tone: rand(0, 1) }));
    return (ctx, _w, _h, t) => {
        let alive = false;
        for (const b of list) {
            const p = easeIn(clamp01((t - b.delay) / 0.55));
            if (p >= 1) continue;
            alive = true;
            const x = -p * (w + 260);
            ctx.fillStyle = b.tone > 0.7 ? "#1c1c1c" : "#121212";
            ctx.fillRect(x, b.y, w + 2, H + 0.5);
            // 띠 끝의 속도선
            if (p > 0) {
                ctx.fillStyle = accent;
                ctx.globalAlpha = 0.9;
                ctx.fillRect(x + w, b.y + H * 0.35, 30 + p * 240, 3);
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = 0.6;
                ctx.fillRect(x + w + 10, b.y + H * 0.7, 20 + p * 120, 2);
                ctx.globalAlpha = 1;
            }
        }
        return alive;
    };
};

/** 리듬 게임: 이퀄라이저 막대가 박자에 맞춰 튀다가 차례로 떨어진다 */
const beat: Factory = (w, h, accent) => {
    const N = Math.max(10, Math.round(w / 64));
    const bw = w / N;
    const BPM_GAP = 0.15;
    const bars = Array.from({ length: N }, (_, i) => ({ phase: rand(0, Math.PI * 2), delay: 0.5 + (((i * 7) % N) / N) * 0.45 }));
    return (ctx, _w, _h, t) => {
        let alive = false;
        const pulse = Math.max(0, 1 - ((t % BPM_GAP) / BPM_GAP) * 1.6); // 박자마다 튄다
        for (let i = 0; i < N; i++) {
            const b = bars[i];
            const p = easeIn(clamp01((t - b.delay) / 0.35));
            if (p >= 1) continue;
            alive = true;
            const wob = t < b.delay ? (0.08 + 0.1 * Math.abs(Math.sin(b.phase + t * 9))) * pulse : 0;
            const top = h * wob + p * (h + 20);
            const x = i * bw;
            ctx.fillStyle = "#0b0b12";
            ctx.fillRect(x, top, bw + 0.5, h - top + 20);
            ctx.fillStyle = accent;
            ctx.fillRect(x + 3, top, bw - 6, 6);
            ctx.globalAlpha = 0.25;
            ctx.fillRect(x + bw / 2 - 1, top + 6, 2, h);
            ctx.globalAlpha = 1;
        }
        return alive;
    };
};

/** 오염된 땅을 정화하는 게임: 탁한 타일이 모서리부터 밝게 정화되며 사라진다 */
const purify: Factory = (w, h, accent) => {
    const S = 48;
    const cols = Math.ceil(w / S), rows = Math.ceil(h / S);
    const list: { x: number; y: number; delay: number; tone: number }[] = [];
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const d = Math.hypot(c / cols, (rows - r) / rows) / Math.SQRT2; // 왼쪽 아래부터
            list.push({ x: c * S, y: r * S, delay: 0.1 + d * 0.95 + rand(0, 0.1), tone: rand(0, 1) });
        }
    return (ctx, _w, _h, t) => {
        let alive = false;
        for (const k of list) {
            const p = clamp01((t - k.delay) / 0.38);
            if (p >= 1) continue;
            alive = true;
            if (p <= 0) {
                ctx.fillStyle = k.tone > 0.66 ? "#2b1d33" : k.tone > 0.33 ? "#24202c" : "#1d2420";
                ctx.fillRect(k.x, k.y, S + 0.5, S + 0.5);
                ctx.fillStyle = "rgba(150, 90, 190, 0.18)";
                ctx.fillRect(Math.round(k.x + 6 + k.tone * 20), k.y + 8, 10, 10);
            } else {
                // 정화되는 순간 밝게 번쩍이며 작아진다
                const s = S * (1 - easeIn(p));
                ctx.globalAlpha = 1 - p * 0.4;
                ctx.fillStyle = p < 0.1 ? "#ffffff" : accent;
                ctx.fillRect(k.x + (S - s) / 2, k.y + (S - s) / 2, s, s);
                ctx.globalAlpha = 1;
            }
        }
        return alive;
    };
};

/** 가장자리가 부드러워 절반 해상도로 그려도 티가 나지 않는 연출 */
const SOFT = new Set<string>(["light", "warp", "drain", "scan"]);

const FACTORIES: Record<Exclude<RevealStyle, "burn">, Factory> = {
    slash,
    cards,
    warp,
    drain,
    light,
    blocks,
    pixels,
    toss,
    clock,
    shatter,
    scan,
    portal,
    ripple,
    dash,
    beat,
    purify,
};

function CanvasReveal({ style, accent }: { style: Exclude<RevealStyle, "burn">; accent: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setDone(true);
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // 짧은 전환 연출이라 고해상도로 그릴 필요가 없다. 가장자리가 부드러운 연출은 절반 해상도로 그린다
        const dpr = SOFT.has(style) ? 0.5 : 1;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // 임팩트 순간 뒤에 드러나는 페이지(배경·내용)까지 함께 흔든다
        const page = canvas.closest(".pj-page");
        const shake = () => {
            const frames = [
                { transform: "translate(0, 0)" },
                { transform: "translate(-14px, 8px)" },
                { transform: "translate(12px, -9px)" },
                { transform: "translate(-9px, 5px)" },
                { transform: "translate(6px, -4px)" },
                { transform: "translate(-3px, 2px)" },
                { transform: "translate(0, 0)" },
            ];
            page?.querySelectorAll(".pj-page-grid, .pj-hero-bg").forEach((el) => el.animate(frames, { duration: 420, easing: "ease-out" }));
        };
        const draw = FACTORIES[style](w, h, accent, { shake });
        let raf = 0;
        const start = performance.now();
        const frame = (now: number) => {
            const t = (now - start) / 1000;
            ctx.clearRect(0, 0, w, h);
            const alive = draw(ctx, w, h, t);
            if (alive && t < 4) raf = requestAnimationFrame(frame);
            else setDone(true);
        };
        // 첫 프레임을 바로 그려서 덮개가 늦게 나타나지 않게 한다
        draw(ctx, w, h, 0);
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [style, accent]);

    if (done) return null;
    return <canvas ref={ref} className="pj-reveal" aria-hidden="true" />;
}

export default function RevealFx({ style, accent }: { style: RevealStyle; accent: string }) {
    if (style === "burn") return <BurnReveal />;
    return <CanvasReveal style={style} accent={accent} />;
}
