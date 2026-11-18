import { useEffect, useRef } from "react";
import type { IntroStyle } from "../content";

/**
 * 상세 페이지를 열 때 게임 분위기에 맞춘 모션 그래픽.
 * 캔버스 하나에 입자를 그린다: 처음 몇 초는 진하게(등장 연출), 이후에는 옅게 유지.
 * - 동작 줄이기(prefers-reduced-motion) 설정이면 그리지 않는다.
 * - 탭이 숨겨지면 멈춘다. 장식이므로 aria-hidden, 클릭은 통과.
 */

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    max: number;
    size: number;
    color: string;
    spin?: number;
    rot?: number;
    len?: number;
}

interface Style {
    /** 등장 연출 동안 초당 생성 수 / 이후 초당 생성 수 */
    burst: number;
    ambient: number;
    spawn: (w: number, h: number, accent: string) => Particle;
    draw: (ctx: CanvasRenderingContext2D, p: Particle, t: number) => void;
    /** 처음 한 번만 그리는 연출 (예: 베기 섬광) */
    opening?: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, accent: string) => void;
    composite?: GlobalCompositeOperation;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function alphaOf(p: Particle) {
    const k = p.life / p.max;
    // 서서히 나타났다가 사라진다
    return Math.min(1, k * 5) * Math.min(1, (1 - k) * 2.5);
}

const square = (ctx: CanvasRenderingContext2D, p: Particle, a: number) => {
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    const s = Math.round(p.size);
    ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
};

// 빛 점 스프라이트: 색마다 한 번만 그려 두고 drawImage 로 재사용한다 (입자마다 그라디언트를 만들면 느리다)
const spriteCache = new Map<string, HTMLCanvasElement>();
function glowSprite(color: string): HTMLCanvasElement {
    let c = spriteCache.get(color);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.25, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 32, 32);
    spriteCache.set(color, c);
    return c;
}

const glowDot = (ctx: CanvasRenderingContext2D, p: Particle, a: number) => {
    const r = p.size * 3;
    ctx.globalAlpha = a;
    ctx.drawImage(glowSprite(p.color), p.x - r, p.y - r, r * 2, r * 2);
};

let steamSprite: HTMLCanvasElement | null = null;
function getSteamSprite(): HTMLCanvasElement {
    if (steamSprite) return steamSprite;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,244,230,0.22)");
    g.addColorStop(1, "rgba(255,244,230,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    steamSprite = c;
    return c;
}

const STYLES: Record<IntroStyle, Style> = {
    // IGNOTUS: 바닥에서 피어오르는 붉은 저주 불씨 (픽셀 사각형)
    embers: {
        burst: 90,
        ambient: 14,
        composite: "lighter",
        spawn: (w, h) => ({
            x: rand(0, w),
            y: h + 4,
            vx: rand(-12, 12),
            vy: rand(-90, -35),
            life: 0,
            max: rand(2.2, 4.5),
            size: pick([2, 3, 3, 4]),
            color: pick(["#ff3b3b", "#ff5a2a", "#e8343f", "#ff9a3c"]),
        }),
        draw: (ctx, p, t) => {
            p.vx += Math.sin(t * 3 + p.y * 0.02) * 0.6;
            square(ctx, p, alphaOf(p) * (0.6 + 0.4 * Math.sin(t * 20 + p.x)));
        },
    },
    // 발!도!!: 화면을 가르는 베기 섬광 + 흩어지는 불꽃
    slash: {
        burst: 40,
        ambient: 6,
        composite: "lighter",
        spawn: (w, h) => {
            const k = Math.random();
            return {
                x: w * (0.1 + 0.8 * k),
                y: h * (0.75 - 0.5 * k),
                vx: rand(-60, 60),
                vy: rand(-60, 40),
                life: 0,
                max: rand(0.5, 1.4),
                size: pick([2, 2, 3]),
                color: pick(["#fff4d6", "#ffd27a", "#e9a23b"]),
            };
        },
        draw: (ctx, p) => square(ctx, p, alphaOf(p)),
    },
    // 제발 꺼져 용사야!: 보랏빛 마법 입자가 반짝이며 떠오른다
    magic: {
        burst: 70,
        ambient: 10,
        composite: "lighter",
        spawn: (w, h) => ({
            x: rand(0, w),
            y: rand(h * 0.3, h),
            vx: rand(-8, 8),
            vy: rand(-40, -12),
            life: 0,
            max: rand(1.5, 3.5),
            size: rand(1.2, 2.4),
            color: pick(["#c86bd8", "#9b5cff", "#ff7ad9", "#7fd1ff"]),
        }),
        draw: (ctx, p, t) => {
            const a = alphaOf(p) * (0.5 + 0.5 * Math.sin(t * 9 + p.x * 0.1));
            glowDot(ctx, p, a);
        },
    },
    // 하늘오름: 별똥별과 위로 솟는 속도선
    stars: {
        burst: 30,
        ambient: 5,
        composite: "lighter",
        spawn: (w, h) => {
            const streak = Math.random() < 0.45;
            return streak
                ? { x: rand(w * 0.2, w * 1.1), y: rand(-h * 0.1, h * 0.4), vx: -rand(500, 800), vy: rand(220, 360), life: 0, max: rand(0.6, 1.1), size: 1.6, color: "#dfe9ff", len: rand(80, 160) }
                : { x: rand(0, w), y: h + 10, vx: 0, vy: -rand(500, 900), life: 0, max: rand(0.7, 1.3), size: 1, color: "#7fb4ff", len: rand(40, 110) };
        },
        draw: (ctx, p) => {
            const a = alphaOf(p);
            const sp = Math.hypot(p.vx, p.vy) || 1;
            const len = p.len ?? 60;
            const ux = p.vx / sp, uy = p.vy / sp;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.globalAlpha = a * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - ux * len, p.y - uy * len);
            ctx.stroke();
            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - ux * len * 0.35, p.y - uy * len * 0.35);
            ctx.stroke();
        },
    },
    // 내가 찻잔이라니!: 따뜻하게 피어오르는 김
    steam: {
        burst: 26,
        ambient: 5,
        spawn: (w, h) => ({
            x: rand(w * 0.05, w * 0.95),
            y: h + 30,
            vx: rand(-6, 6),
            vy: rand(-55, -30),
            life: 0,
            max: rand(3, 5.5),
            size: rand(18, 34),
            color: "rgba(255, 244, 230, 1)",
        }),
        draw: (ctx, p, t) => {
            p.vx = Math.sin(t * 1.2 + p.size) * 10;
            const grow = 1 + (p.life / p.max) * 1.4;
            const r = p.size * grow;
            ctx.globalAlpha = alphaOf(p);
            ctx.drawImage(getSteamSprite(), p.x - r, p.y - r, r * 2, r * 2);
        },
    },
    // Luminous: 천천히 떠다니는 빛 입자
    motes: {
        burst: 34,
        ambient: 9,
        composite: "lighter",
        spawn: (w, h, accent) => ({
            x: rand(0, w),
            y: rand(0, h),
            vx: rand(-14, 14),
            vy: rand(-22, -4),
            life: 0,
            max: rand(2.5, 5),
            size: rand(1.4, 3),
            color: pick([accent, "#fff3b0", "#bfe8ff"]),
        }),
        draw: (ctx, p, t) => glowDot(ctx, p, alphaOf(p) * (0.6 + 0.4 * Math.sin(t * 4 + p.y))),
    },
    // 마인크래프트: 흩날리는 픽셀 블록
    blocks: {
        burst: 50,
        ambient: 7,
        spawn: (w) => ({
            x: rand(0, w),
            y: -10,
            vx: rand(-15, 15),
            vy: rand(30, 80),
            life: 0,
            max: rand(2.5, 5),
            size: pick([4, 6, 8]),
            color: pick(["#5fa83a", "#7a5232", "#8f8f8f", "#3f7fd6", "#d9c27a"]),
            rot: rand(0, Math.PI),
            spin: rand(-2, 2),
        }),
        draw: (ctx, p) => {
            p.rot = (p.rot ?? 0) + (p.spin ?? 0) / 60;
            ctx.save();
            ctx.globalAlpha = alphaOf(p) * 0.8;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        },
    },
    // 리듬 게임: 음표가 박자감 있게 흔들리며 떠오른다
    notes: {
        burst: 22,
        ambient: 4,
        spawn: (w, h, accent) => ({
            x: rand(0, w),
            y: h + 20,
            vx: 0,
            vy: rand(-80, -40),
            life: 0,
            max: rand(2.5, 4.5),
            size: rand(9, 15),
            color: pick([accent, "#ffffff", accent]),
            rot: rand(-0.3, 0.3),
            spin: Math.random() < 0.5 ? 1 : 2, // 1: 8분음표, 2: 16분 이음표
        }),
        draw: (ctx, p, t) => {
            const s = p.size;
            const x = p.x + Math.sin(t * 6 + p.y * 0.02) * 6;
            ctx.save();
            ctx.globalAlpha = alphaOf(p) * 0.75;
            ctx.translate(x, p.y);
            ctx.rotate(p.rot ?? 0);
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1.5, s * 0.14);
            const heads = p.spin === 2 ? [0, s * 1.1] : [0];
            for (const hx of heads) {
                ctx.beginPath();
                ctx.ellipse(hx, 0, s * 0.42, s * 0.3, -0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hx + s * 0.38, 0);
                ctx.lineTo(hx + s * 0.38, -s * 1.5);
                ctx.stroke();
            }
            ctx.beginPath();
            if (p.spin === 2) ctx.rect(s * 0.38, -s * 1.5, s * 1.1, s * 0.22);
            else ctx.rect(s * 0.38, -s * 1.5, s * 0.5, s * 0.22);
            ctx.fill();
            ctx.restore();
        },
    },
    // 구해줘 홈즈: 협곡 바람에 옆으로 날리는 흙먼지
    wind: {
        burst: 60,
        ambient: 10,
        spawn: (w, h) => ({
            x: -10,
            y: rand(h * 0.15, h),
            vx: rand(160, 340),
            vy: rand(-25, 10),
            life: 0,
            max: rand(1.6, 3.4),
            size: pick([2, 3, 3, 4]),
            color: pick(["#d9a066", "#b9834f", "#f0c890", "#8d6440"]),
        }),
        draw: (ctx, p, t) => {
            p.vy += Math.sin(t * 4 + p.x * 0.01) * 2;
            square(ctx, p, alphaOf(p) * 0.65);
        },
    },
    // 오염된 땅: 탁한 보랏빛·녹색 포자가 천천히 떠다닌다
    smog: {
        burst: 40,
        ambient: 8,
        spawn: (w, h, accent) => ({
            x: rand(0, w),
            y: rand(h * 0.4, h + 10),
            vx: rand(-12, 12),
            vy: rand(-22, -6),
            life: 0,
            max: rand(2.5, 5),
            size: rand(1.4, 2.6),
            color: pick(["#9b6bd1", "#6fbf73", accent, "#7a5c8f"]),
        }),
        draw: (ctx, p, t) => glowDot(ctx, p, alphaOf(p) * (0.4 + 0.3 * Math.sin(t * 2 + p.x))),
        composite: "lighter",
    },
    // 범근러쉬: 오른쪽에서 왼쪽으로 스쳐 가는 속도선
    speed: {
        burst: 36,
        ambient: 6,
        spawn: (w, h, accent) => ({
            x: w + 20,
            y: rand(0, h),
            vx: -rand(900, 1500),
            vy: 0,
            life: 0,
            max: rand(0.5, 1),
            size: pick([1, 1.5, 2]),
            color: pick([accent, "#ffffff"]),
            len: rand(60, 200),
        }),
        draw: (ctx, p) => {
            ctx.globalAlpha = alphaOf(p) * 0.6;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.len ?? 100, p.size);
        },
    },
    // 기본: 강조색 먼지
    dust: {
        burst: 45,
        ambient: 7,
        composite: "lighter",
        spawn: (w, h, accent) => ({
            x: rand(0, w),
            y: rand(h * 0.2, h + 10),
            vx: rand(-10, 10),
            vy: rand(-30, -8),
            life: 0,
            max: rand(2, 4.5),
            size: pick([1.5, 2, 2.5]),
            color: accent,
        }),
        draw: (ctx, p) => square(ctx, p, alphaOf(p) * 0.7),
    },
};

const BURST_SECONDS = 2.4;
const MAX_PARTICLES = 220;

export default function IntroFx({ style, accent }: { style: IntroStyle; accent: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const def = STYLES[style] ?? STYLES.dust;

        // 저사양·절전 환경에서는 등장 연출만 보여 주고 이후 입자는 만들지 않는다
        const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
        const lowPower =
            (nav.hardwareConcurrency ?? 8) <= 4 ||
            (nav.deviceMemory ?? 8) <= 4 ||
            !!nav.connection?.saveData ||
            window.matchMedia?.("(pointer: coarse)").matches;

        let w = 0;
        let h = 0;
        const resize = () => {
            // 입자는 흐릿해도 티가 나지 않으므로 고해상도로 그리지 않는다
            const dpr = 1;
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const parts: Particle[] = [];
        let raf = 0;
        let last = performance.now();
        const start = last;
        let carry = 0;

        const frame = (now: number) => {
            const t = (now - start) / 1000;
            // 등장 연출이 끝나면 30fps 로 줄인다
            if (t > BURST_SECONDS + 1 && now - last < 32) {
                raf = requestAnimationFrame(frame);
                return;
            }
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            const rate = t < BURST_SECONDS ? def.burst : lowPower ? 0 : def.ambient;
            carry += rate * dt;
            while (carry >= 1 && parts.length < MAX_PARTICLES) {
                parts.push(def.spawn(w, h, accent));
                carry -= 1;
            }
            if (carry >= 1) carry = 0;

            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = def.composite ?? "source-over";
            for (let i = parts.length - 1; i >= 0; i--) {
                const p = parts[i];
                p.life += dt;
                if (p.life >= p.max) {
                    parts.splice(i, 1);
                    continue;
                }
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                def.draw(ctx, p, t);
            }
            if (def.opening) {
                ctx.globalCompositeOperation = "lighter";
                def.opening(ctx, w, h, t, accent);
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            // 저사양: 등장 입자가 다 사라지면 그리기를 멈춘다
            if (lowPower && t > BURST_SECONDS && parts.length === 0) return;
            raf = requestAnimationFrame(frame);
        };

        const onVis = () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) {
                last = performance.now();
                raf = requestAnimationFrame(frame);
            }
        };
        document.addEventListener("visibilitychange", onVis);
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [style, accent]);

    return <canvas ref={ref} className="pj-intro-fx" aria-hidden="true" />;
}
