import { useEffect, useRef, useState } from "react";

/**
 * 종이가 불타며 페이지가 드러나는 등장 연출 (IGNOTUS).
 * - 화면을 덮은 낡은 종이에 몇 군데 불이 붙고, 노이즈 모양으로 번지는 불길이 종이를 태워 없앤다.
 * - 픽셀 아트 게임에 맞춰 낮은 해상도 격자로 계산하고 확대할 때 보간하지 않는다.
 * - 동작 줄이기 설정이면 그리지 않는다. 끝나면 캔버스를 없앤다.
 */

const CELL = 6; // 격자 한 칸 = 화면 6px
const BURN_SECONDS = 1.55; // 마지막 칸이 불붙는 시각
const START_DELAY = 0.12;
const EDGE = 0.1; // 불붙기 직전 빛나는 띠 (초)
const CHAR = 0.1; // 탄 뒤 검게 남는 시간 (초)
const SCORCH = 0.4; // 불이 오기 전 그을리는 구간 (초)

function hash(x: number, y: number, seed: number) {
    let h = x * 374761393 + y * 668265263 + seed * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function valueNoise(x: number, y: number, seed: number) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const s = (t: number) => t * t * (3 - 2 * t);
    const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed);
    const c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
    const u = s(xf), v = s(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, seed: number) {
    let sum = 0, amp = 0.5, f = 1;
    for (let i = 0; i < 4; i++) {
        sum += amp * valueNoise(x * f, y * f, seed + i * 17);
        amp *= 0.5;
        f *= 2;
    }
    return sum; // 0 ~ 약 0.94
}

export default function BurnReveal() {
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

        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = w;
        canvas.height = h;
        const gw = Math.ceil(w / CELL), gh = Math.ceil(h / CELL);

        // 셀마다 불붙는 시각을 미리 계산: 가장 가까운 발화점까지 거리 + 노이즈
        const seed = Math.floor(Math.random() * 1000);
        const sparks = Array.from({ length: 4 }, (_, i) => ({
            x: gw * (0.15 + 0.7 * Math.random()),
            y: gh * (i < 2 ? 0.25 + 0.5 * Math.random() : Math.random()),
            delay: i * 0.12 + Math.random() * 0.1,
        }));
        const burnAt = new Float32Array(gw * gh);
        const tone = new Float32Array(gw * gh);
        const diag = Math.hypot(gw, gh);
        let maxT = 0;
        for (let y = 0; y < gh; y++) {
            for (let x = 0; x < gw; x++) {
                let best = Infinity;
                for (const s of sparks) {
                    const d = Math.hypot(x - s.x, (y - s.y) * 1.15) / diag + s.delay * 0.35;
                    if (d < best) best = d;
                }
                const n = fbm(x / 14, y / 14, seed);
                const t = best + (n - 0.45) * 0.42;
                burnAt[y * gw + x] = t;
                tone[y * gw + x] = fbm(x / 5, y / 5, seed + 99);
                if (t > maxT) maxT = t;
            }
        }
        let minT = Infinity;
        for (let i = 0; i < burnAt.length; i++) if (burnAt[i] < minT) minT = burnAt[i];
        for (let i = 0; i < burnAt.length; i++) burnAt[i] = ((burnAt[i] - minT) / (maxT - minT)) * BURN_SECONDS;

        const small = document.createElement("canvas");
        small.width = gw;
        small.height = gh;
        const sctx = small.getContext("2d")!;
        const img = sctx.createImageData(gw, gh);
        const px = img.data;

        let raf = 0;
        const start = performance.now();
        const frame = (now: number) => {
            const t = (now - start) / 1000 - START_DELAY;
            let alive = false;
            for (let i = 0; i < burnAt.length; i++) {
                const d = burnAt[i] - t; // 불붙기까지 남은 시간
                const o = i * 4;
                if (d > EDGE) {
                    // 종이: 낡은 양피지 색 + 얼룩, 불이 가까우면 그을림
                    const k = tone[i];
                    let r = 222 + (k - 0.5) * 34, g = 204 + (k - 0.5) * 34, b = 160 + (k - 0.5) * 30;
                    if (d < SCORCH) {
                        const s = 1 - (d - EDGE) / (SCORCH - EDGE);
                        r -= 120 * s; g -= 135 * s; b -= 120 * s;
                    }
                    px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255;
                    alive = true;
                } else if (d > 0) {
                    // 타오르는 띠: 바깥은 붉은 주황, 불붙기 직전은 밝은 노랑
                    const s = d / EDGE;
                    px[o] = 255;
                    px[o + 1] = 210 - 130 * s;
                    px[o + 2] = 90 - 80 * s;
                    px[o + 3] = 255;
                    alive = true;
                } else if (d > -CHAR) {
                    // 타고 남은 검은 가장자리가 흩어진다
                    const s = 1 + d / CHAR;
                    px[o] = 40; px[o + 1] = 16; px[o + 2] = 8; px[o + 3] = 230 * s * s;
                    alive = true;
                } else {
                    px[o + 3] = 0;
                }
            }
            sctx.putImageData(img, 0, 0);
            ctx.clearRect(0, 0, w, h);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(small, 0, 0, gw * CELL, gh * CELL);
            if (alive || t < 0) raf = requestAnimationFrame(frame);
            else setDone(true);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, []);

    if (done) return null;
    return <canvas ref={ref} className="pj-burn-reveal" aria-hidden="true" />;
}
