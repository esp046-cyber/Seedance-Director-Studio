/* Zero-dependency asset generator. Run: node scripts/generate-icons.js
   Also loaded in-browser: StudioAssets.browserPack() returns one ZIP Blob.
   Artwork is original and independent; no official logos are reproduced.
   Node uses built-in fs/path/zlib. Browser uses Canvas and the same raster source.
   Generated install previews are representative UI illustrations; deployed
   screenshot files can be replaced with actual browser captures at the same sizes. */
(function (global) {
  "use strict";
  const NODE = typeof module !== "undefined" && !!module.exports;
  const COLORS = {
    bg: [8, 10, 15, 255],
    card: [17, 21, 32, 255],
    raised: [24, 30, 43, 255],
    line: [48, 56, 73, 255],
    gold: [229, 169, 60, 255],
    cyan: [0, 194, 255, 255],
    white: [242, 243, 247, 255],
    muted: [164, 175, 194, 255],
  };
  const FONT = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
    "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };
  class Raster {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.p = new Uint8ClampedArray(w * h * 4);
      this.rect(0, 0, w, h, COLORS.bg);
    }
    pixel(x, y, c) {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
      const i = (y * this.w + x) * 4;
      this.p[i] = c[0];
      this.p[i + 1] = c[1];
      this.p[i + 2] = c[2];
      this.p[i + 3] = c[3] ?? 255;
    }
    rect(x, y, w, h, c) {
      const x0 = Math.max(0, Math.floor(x)),
        x1 = Math.min(this.w, Math.ceil(x + w)),
        y0 = Math.max(0, Math.floor(y)),
        y1 = Math.min(this.h, Math.ceil(y + h));
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * this.w + xx) * 4;
          this.p.set(c, i);
        }
    }
    circle(cx, cy, r, c, stroke = 0) {
      for (
        let y = Math.max(0, Math.floor(cy - r));
        y < Math.min(this.h, Math.ceil(cy + r + 1));
        y++
      )
        for (
          let x = Math.max(0, Math.floor(cx - r));
          x < Math.min(this.w, Math.ceil(cx + r + 1));
          x++
        ) {
          const d = Math.hypot(x - cx, y - cy);
          if (d <= r && (!stroke || d >= r - stroke)) this.pixel(x, y, c);
        }
    }
    line(x1, y1, x2, y2, c, width = 1) {
      const dx = x2 - x1,
        dy = y2 - y1,
        steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) * 1.5));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        this.circle(x1 + dx * t, y1 + dy * t, width / 2, c);
      }
    }
    polygon(points, c) {
      const ys = points.map((p) => p[1]),
        min = Math.max(0, Math.floor(Math.min(...ys))),
        max = Math.min(this.h - 1, Math.ceil(Math.max(...ys)));
      for (let y = min; y <= max; y++) {
        const cuts = [];
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const a = points[i],
            b = points[j];
          if (a[1] > y !== b[1] > y)
            cuts.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
        }
        cuts.sort((a, b) => a - b);
        for (let n = 0; n + 1 < cuts.length; n += 2)
          this.rect(cuts[n], y, cuts[n + 1] - cuts[n] + 1, 1, c);
      }
    }
    text(value, x, y, scale = 2, c = COLORS.white) {
      for (const ch of value.toUpperCase()) {
        const glyph = FONT[ch] || FONT[" "];
        for (let row = 0; row < 7; row++)
          for (let col = 0; col < 5; col++)
            if (glyph[row][col] === "1")
              this.rect(x + col * scale, y + row * scale, scale, scale, c);
        x += 6 * scale;
      }
    }
    frame(x, y, w, h, c = COLORS.line, width = 1) {
      this.rect(x, y, w, width, c);
      this.rect(x, y + h - width, w, width, c);
      this.rect(x, y, width, h, c);
      this.rect(x + w - width, y, width, h, c);
    }
  }
  function icon(n, maskable = false) {
    const scale = n < 96 ? 4 : 2,
      size = n * scale,
      r = new Raster(size, size),
      k = size / 512,
      cx = 256 * k,
      cy = 256 * k,
      rad = (maskable ? 158 : 188) * k;
    r.circle(cx, cy, rad, COLORS.card);
    r.circle(cx, cy, rad, COLORS.gold, 5 * k);
    r.circle(cx, cy, rad * 0.84, [80, 65, 43, 255], 2 * k);
    r.polygon(
      [
        [cx - rad * 0.3, cy - rad * 0.5],
        [cx + rad * 0.54, cy],
        [cx - rad * 0.3, cy + rad * 0.5],
      ],
      COLORS.gold,
    );
    const base = cy + rad * 0.58;
    r.line(cx - rad * 0.72, base, cx + rad * 0.72, base, COLORS.cyan, 4 * k);
    r.line(
      cx + rad * 0.1,
      base,
      cx + rad * 0.1,
      cy - rad * 0.66,
      COLORS.cyan,
      5 * k,
    );
    r.polygon(
      [
        [cx + rad * 0.05, cy - rad * 0.62],
        [cx + rad * 0.1, cy - rad * 0.84],
        [cx + rad * 0.15, cy - rad * 0.62],
      ],
      COLORS.cyan,
    );
    for (const [x, h] of [
      [-0.6, 0.26],
      [-0.43, 0.43],
      [0.4, 0.45],
      [0.58, 0.3],
    ])
      r.frame(
        cx + rad * x,
        base - rad * h,
        rad * 0.12,
        rad * h,
        COLORS.cyan,
        3 * k,
      );
    if (!maskable)
      r.circle(cx + rad * 0.76, cy - rad * 0.76, 14 * k, COLORS.gold);
    return downsample(r, n, n);
  }
  function downsample(src, w, h) {
    const out = new Raster(w, h),
      sx = src.w / w,
      sy = src.h / h;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let sum = [0, 0, 0, 0],
          count = 0;
        for (let yy = Math.floor(y * sy); yy < Math.floor((y + 1) * sy); yy++)
          for (
            let xx = Math.floor(x * sx);
            xx < Math.floor((x + 1) * sx);
            xx++
          ) {
            const i = (yy * src.w + xx) * 4;
            for (let k = 0; k < 4; k++) sum[k] += src.p[i + k];
            count++;
          }
        out.pixel(
          x,
          y,
          sum.map((v) => Math.round(v / count)),
        );
      }
    return out;
  }
  function emblem(r, x, y, size) {
    const src = icon(size);
    for (let yy = 0; yy < size; yy++)
      for (let xx = 0; xx < size; xx++) {
        const i = (yy * size + xx) * 4;
        r.pixel(x + xx, y + yy, src.p.subarray(i, i + 4));
      }
  }
  function skyline(r, x, y, w, h) {
    const heights = [0.25, 0.38, 0.5, 0.78, 0.36, 0.57, 0.28];
    for (let i = 0; i < heights.length; i++) {
      const bx = x + (w * i) / 8,
        bw = w * 0.075,
        bh = h * heights[i];
      r.rect(bx, y - bh, bw, bh, COLORS.card);
      r.frame(bx, y - bh, bw, bh, COLORS.gold, 1);
      for (let j = 1; j < 4; j++)
        r.line(
          bx + (bw * j) / 4,
          y - bh + 12,
          bx + (bw * j) / 4,
          y - 8,
          COLORS.line,
          1,
        );
    }
    r.polygon(
      [
        [x + w * 0.4, y],
        [x + w * 0.4, y - h * 0.76],
        [x + w * 0.415, y - h * 0.76],
        [x + w * 0.425, y - h],
        [x + w * 0.435, y - h * 0.76],
        [x + w * 0.45, y - h * 0.76],
        [x + w * 0.45, y],
      ],
      COLORS.cyan,
    );
    r.line(x - 16, y, x + w, y, COLORS.gold, 2);
  }
  function og() {
    const r = new Raster(1200, 630);
    for (let y = 0; y < 630; y += 32)
      r.line(750, y, 1199, y, [20, 24, 32, 255], 1);
    for (let x = 760; x < 1200; x += 32)
      r.line(x, 0, x, 630, [20, 24, 32, 255], 1);
    r.line(64, 64, 1136, 64, COLORS.gold, 2);
    r.text("DUBAI / AI CINEMA / 2027", 64, 104, 2, COLORS.gold);
    r.text("SEEDANCE", 60, 204, 8);
    r.text("DIRECTOR STUDIO", 60, 290, 7);
    r.text("FROM FIRST IDEA TO FINAL FRAME.", 64, 394, 3, COLORS.gold);
    r.text("PROMPT. PLAN. CREATE. REFINE.", 64, 460, 2, COLORS.muted);
    r.circle(978, 294, 170, COLORS.gold, 1);
    r.circle(978, 294, 125, [70, 58, 37, 255], 1);
    skyline(r, 835, 492, 330, 285);
    r.text(
      "INDEPENDENT CREATOR COMPANION / OFFLINE-READY / NO AFFILIATION",
      64,
      566,
      2,
      COLORS.muted,
    );
    return r;
  }
  function preview(w, h) {
    const r = new Raster(w, h),
      mobile = w < h;
    if (mobile) {
      emblem(r, 32, 30, 64);
      r.text("DIRECTOR", 116, 38, 4);
      r.text("SEEDANCE STUDIO", 116, 77, 2, COLORS.muted);
      r.line(0, 124, w, 124, COLORS.line, 2);
      r.text("ONLINE", w - 114, 53, 2, COLORS.cyan);
      r.rect(30, 158, w - 60, 490, COLORS.card);
      r.frame(30, 158, w - 60, 490);
      r.text("DUBAI / AI CINEMA / 2027", 62, 198, 3, COLORS.gold);
      r.text("EVERY GREAT FILM", 62, 276, 6);
      r.text("STARTS WITH", 62, 340, 6);
      r.text("INTENT.", 62, 404, 6, COLORS.gold);
      r.text("YOUR OFFLINE DIRECTOR DESK.", 62, 485, 3, COLORS.muted);
      r.rect(62, 549, 392, 56, COLORS.gold);
      r.text("OPEN PROMPT STUDIO", 82, 569, 3, COLORS.bg);
      r.text("STORY FIRST.", 32, 702, 5);
      r.text("TECHNOLOGY IN SERVICE.", 32, 756, 4, COLORS.gold);
      const cards = [
        ["01 / NARRATIVE", "A STORY WORTH TELLING"],
        ["02 / VISUAL CRAFT", "CONTROL THE FRAME"],
        ["03 / SOUND & RHYTHM", "MAKE SILENCE SPEAK"],
      ];
      cards.forEach((c, i) => {
        r.rect(30, 825 + i * 125, w - 60, 105, COLORS.card);
        r.text(c[0], 54, 848 + i * 125, 2, COLORS.gold);
        r.text(c[1], 54, 882 + i * 125, 3);
      });
      r.rect(0, h - 84, w, 84, COLORS.raised);
      ["OVERVIEW", "STUDIO", "PLAN", "LEXICON", "READY"].forEach((v, i) =>
        r.text(
          v,
          18 + i * 148,
          h - 48,
          2,
          i === 0 ? COLORS.gold : COLORS.muted,
        ),
      );
    } else {
      emblem(r, 32, 20, 44);
      r.text("DIRECTOR", 92, 23, 3);
      r.text("SEEDANCE STUDIO", 94, 52, 1, COLORS.muted);
      r.text("ONLINE / LOCAL-FIRST", 997, 36, 2, COLORS.cyan);
      r.line(0, 84, w, 84, COLORS.line, 1);
      ["OVERVIEW", "STUDIO", "PRODUCTION", "GLOSSARY", "READINESS"].forEach(
        (v, i) =>
          r.text(
            v,
            275 + i * 155,
            107,
            2,
            i === 0 ? COLORS.gold : COLORS.muted,
          ),
      );
      r.rect(32, 158, w - 64, 373, COLORS.card);
      r.frame(32, 158, w - 64, 373);
      r.text("DUBAI / AI CINEMA / 2027", 64, 194, 2, COLORS.gold);
      r.text("EVERY GREAT FILM", 64, 245, 5);
      r.text("STARTS WITH INTENT.", 64, 300, 5);
      r.text(
        "YOUR INDEPENDENT OFFLINE AI CINEMA WORKSPACE.",
        64,
        372,
        2,
        COLORS.muted,
      );
      r.rect(64, 426, 300, 55, COLORS.gold);
      r.text("OPEN PROMPT STUDIO", 83, 446, 2, COLORS.bg);
      r.circle(1010, 339, 139, COLORS.gold, 1);
      r.circle(1010, 339, 108, [86, 66, 36, 255], 1);
      skyline(r, 906, 463, 242, 232);
      r.text("1 BILLION SUMMIT DUBAI", 65, 568, 2);
      r.text("AI AWARD 2027", 540, 568, 2, COLORS.gold);
      r.text("BYTEPLUS SEEDANCE", 926, 568, 2, COLORS.cyan);
      r.text(
        "INDEPENDENT CREATOR COMPANION / NO AFFILIATION OR ENDORSEMENT",
        65,
        614,
        1,
        COLORS.muted,
      );
      r.text("PROMPT. PLAN. CREATE. REFINE.", 65, 661, 3, COLORS.gold);
    }
    return r;
  }
  const crcTable = (() => {
    const a = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      a[n] = c >>> 0;
    }
    return a;
  })();
  function crc32(b) {
    let c = 0xffffffff;
    for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function concat(parts) {
    const total = parts.reduce((a, b) => a + b.length, 0),
      out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      out.set(part, offset);
      offset += part.length;
    }
    return out;
  }
  function u32be(v) {
    return new Uint8Array([
      (v >>> 24) & 255,
      (v >>> 16) & 255,
      (v >>> 8) & 255,
      v & 255,
    ]);
  }
  function chunk(name, data) {
    const key = new TextEncoder().encode(name),
      body = concat([key, data]);
    return concat([u32be(data.length), body, u32be(crc32(body))]);
  }
  function pngNode(r) {
    const zlib = require("node:zlib"),
      header = new Uint8Array(13);
    header.set(u32be(r.w), 0);
    header.set(u32be(r.h), 4);
    header[8] = 8;
    header[9] = 6;
    const raw = new Uint8Array((r.w * 4 + 1) * r.h);
    for (let y = 0; y < r.h; y++)
      raw.set(
        r.p.subarray(y * r.w * 4, (y + 1) * r.w * 4),
        y * (r.w * 4 + 1) + 1,
      );
    return concat([
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", header),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", new Uint8Array()),
    ]);
  }
  async function pngBrowser(r) {
    const canvas = document.createElement("canvas");
    canvas.width = r.w;
    canvas.height = r.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Canvas unavailable");
    ctx.putImageData(new ImageData(r.p, r.w, r.h), 0, 0);
    const blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(Error("PNG encoding failed"))),
        "image/png",
      ),
    );
    return new Uint8Array(await blob.arrayBuffer());
  }
  function ico(entries) {
    const head = new Uint8Array(6 + 16 * entries.length),
      view = new DataView(head.buffer);
    view.setUint16(2, 1, true);
    view.setUint16(4, entries.length, true);
    let offset = head.length;
    entries.forEach((e, i) => {
      const p = 6 + i * 16;
      head[p] = e.n === 256 ? 0 : e.n;
      head[p + 1] = head[p];
      view.setUint16(p + 4, 1, true);
      view.setUint16(p + 6, 32, true);
      view.setUint32(p + 8, e.bytes.length, true);
      view.setUint32(p + 12, offset, true);
      offset += e.bytes.length;
    });
    return concat([head, ...entries.map((e) => e.bytes)]);
  }
  function specs() {
    const a = [
      ...[72, 96, 128, 144, 152, 192, 384, 512].map((n) => ({
        name: "icons/icon-" + n + ".png",
        draw: () => icon(n),
      })),
      ...[192, 512].map((n) => ({
        name: "icons/icon-maskable-" + n + ".png",
        draw: () => icon(n, true),
      })),
      ...[16, 32].map((n) => ({
        name: "icons/favicon-" + n + "x" + n + ".png",
        draw: () => icon(n),
      })),
      { name: "apple-touch-icon.png", draw: () => icon(180) },
      { name: "icons/og-image.png", draw: og },
      {
        name: "screenshots/screenshot-wide.png",
        draw: () => preview(1280, 720),
      },
      {
        name: "screenshots/screenshot-narrow.png",
        draw: () => preview(750, 1334),
      },
    ];
    return a;
  }
  function zip(files) {
    const locals = [],
      central = [];
    let offset = 0;
    for (const f of files) {
      const name = new TextEncoder().encode(f.name),
        data = f.bytes,
        crc = crc32(data),
        local = new Uint8Array(30 + name.length),
        v = new DataView(local.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0x800, true);
      v.setUint16(12, 33, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, data.length, true);
      v.setUint32(22, data.length, true);
      v.setUint16(26, name.length, true);
      local.set(name, 30);
      locals.push(local, data);
      const c = new Uint8Array(46 + name.length),
        cv = new DataView(c.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x800, true);
      cv.setUint16(14, 33, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      c.set(name, 46);
      central.push(c);
      offset += local.length + data.length;
    }
    const directory = concat(central),
      end = new Uint8Array(22),
      ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, directory.length, true);
    ev.setUint32(16, offset, true);
    return concat([...locals, directory, end]);
  }
  async function browserPack() {
    const files = [];
    for (const item of specs()) {
      files.push({ name: item.name, bytes: await pngBrowser(item.draw()) });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const entries = [];
    for (const n of [16, 32, 48])
      entries.push({ n, bytes: await pngBrowser(icon(n)) });
    files.push({ name: "favicon.ico", bytes: ico(entries) });
    return new Blob([zip(files)], { type: "application/zip" });
  }
  function generateNode() {
    const fs = require("node:fs"),
      path = require("node:path"),
      root = path.resolve(__dirname, ".."),
      files = [];
    for (const item of specs()) {
      const bytes = pngNode(item.draw());
      files.push({ name: item.name, bytes });
    }
    files.push({
      name: "favicon.ico",
      bytes: ico([16, 32, 48].map((n) => ({ n, bytes: pngNode(icon(n)) }))),
    });
    for (const file of files) {
      const target = path.join(root, file.name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file.bytes);
      console.log(file.name + " (" + file.bytes.length + " bytes)");
    }
    return files;
  }
  function configureTwa(args) {
    const packageAt = args.indexOf("--twa-package"),
      shaAt = args.indexOf("--twa-sha256");
    if (packageAt < 0 && shaAt < 0) return;
    const packageName = args[packageAt + 1],
      fingerprint = args[shaAt + 1];
    if (
      packageAt < 0 ||
      shaAt < 0 ||
      !/^([A-Za-z][A-Za-z0-9_]*\.){2,}[A-Za-z][A-Za-z0-9_]*$/.test(
        packageName || "",
      ) ||
      !/^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/.test(fingerprint || "")
    )
      throw Error(
        "TWA configuration requires --twa-package followed by your real Android package name and --twa-sha256 followed by the colon-separated SHA-256 fingerprint of your release or Play signing certificate.",
      );
    const fs = require("node:fs"),
      path = require("node:path"),
      file = path.resolve(__dirname, "../.well-known/assetlinks.json");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify(
        [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: [fingerprint.toUpperCase()],
            },
          },
        ],
        null,
        2,
      ) + "\n",
    );
    console.log("Configured .well-known/assetlinks.json for " + packageName);
  }
  const API = { browserPack, generateNode };
  if (NODE) {
    module.exports = API;
    if (require.main === module) {
      configureTwa(process.argv.slice(2));
      generateNode();
    }
  } else global.StudioAssets = API;
})(typeof window !== "undefined" ? window : globalThis);
