/* Bộ sinh câu hỏi – Toán 2 (Kết nối tri thức), tập 1.
   Mỗi generator nhận lv (0 = dễ, 1 = vừa, 2 = khó) và trả về một câu hỏi:
   { type:'choice'|'number'|'sort', prompt, visual?, vert?, hint?, ... } */
(function (root) {
  'use strict';

  /* ---------- tiện ích ---------- */
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[rnd(0, arr.length - 1)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const uniq = (arr) => Array.from(new Set(arr));
  const MINUS = '−';

  const NAMES = ['Lan', 'Mai', 'Nam', 'Bình', 'An', 'Hà', 'Minh', 'Hoa', 'Tú', 'Linh', 'Khoa', 'Nhi', 'Phúc', 'Vy'];
  const names = (n) => shuffle(NAMES).slice(0, n);
  const OBJECTS = [
    ['viên bi', '🔴'], ['quả bóng', '⚽'], ['cái kẹo', '🍬'], ['nhãn vở', '📒'], ['bông hoa', '🌸'],
    ['quả cam', '🍊'], ['chiếc xe', '🚗'], ['con tem', '🏷️'], ['cái bánh', '🧁'], ['quyển truyện', '📚'],
    ['quả táo', '🍎'], ['chiếc kẹp tóc', '🎀']
  ];

  const DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  function readNum(n) {
    if (n === 100) return 'một trăm';
    if (n < 10) return DIG[n];
    const t = Math.floor(n / 10), u = n % 10;
    if (t === 1) {
      if (u === 0) return 'mười';
      if (u === 5) return 'mười lăm';
      return 'mười ' + DIG[u];
    }
    const s = DIG[t] + ' mươi';
    if (u === 0) return s;
    if (u === 1) return s + ' mốt';
    if (u === 4) return s + ' tư';
    if (u === 5) return s + ' lăm';
    return s + ' ' + DIG[u];
  }

  /* ---------- dựng câu hỏi ---------- */
  function numWrongs(ans, o) {
    o = o || {};
    const min = o.min == null ? 0 : o.min, max = o.max == null ? 100 : o.max;
    const c = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10, ans + 3, ans - 3, ans + 5, ans - 5];
    if (ans >= 10 && ans < 100 && ans % 11 !== 0) c.unshift((ans % 10) * 10 + Math.floor(ans / 10));
    const near = uniq(c.filter((x) => x >= min && x <= max && x !== ans));
    return near.slice(0, 2).concat(shuffle(near.slice(2)));
  }
  function choice(prompt, correct, wrongs, o) {
    o = o || {};
    const w = uniq(wrongs.map(String)).filter((x) => x !== String(correct)).slice(0, o.count || 3);
    const options = o.keepOrder ? [String(correct)].concat(w).sort((a, b) => o.keepOrder.indexOf(a) - o.keepOrder.indexOf(b)) : shuffle([String(correct)].concat(w));
    return {
      type: 'choice', prompt, options, answer: options.indexOf(String(correct)),
      visual: o.visual, hint: o.hint, cols: o.cols, big: o.big
    };
  }
  function choiceNum(prompt, ans, o) {
    o = o || {};
    return choice(prompt, ans, numWrongs(ans, o), o);
  }
  function num(prompt, answers, o) {
    o = o || {};
    if (!Array.isArray(answers)) answers = [answers];
    return {
      type: 'number', prompt, answers, labels: o.labels, unit: o.unit, visual: o.visual,
      vert: o.vert, hint: o.hint, pre: o.pre, post: o.post
    };
  }
  function sortQ(prompt, order, o) {
    o = o || {};
    return { type: 'sort', prompt, tiles: shuffle(order), order, hint: o.hint, visual: o.visual };
  }

  /* ---------- hình vẽ SVG ---------- */
  function clockSVG(h, m, size) {
    size = size || 170;
    let s = '<svg viewBox="0 0 160 160" width="' + size + '" height="' + size + '" class="clock" role="img" aria-label="Đồng hồ">';
    s += '<circle cx="80" cy="80" r="75" fill="#fff" stroke="#27407a" stroke-width="5"/>';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, r1 = i % 5 === 0 ? 64 : 68, r2 = 72;
      s += '<line x1="' + (80 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (80 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (80 + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (80 - r2 * Math.cos(a)).toFixed(1) + '" stroke="#9aa8c9" stroke-width="' + (i % 5 === 0 ? 2 : 1) + '"/>';
    }
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180;
      s += '<text x="' + (80 + 52 * Math.sin(a)).toFixed(1) + '" y="' + (80 - 52 * Math.cos(a) + 6).toFixed(1) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#27407a" font-family="Baloo 2, Nunito, sans-serif">' + i + '</text>';
    }
    const ha = ((h % 12) * 30 + m * 0.5) * Math.PI / 180, ma = m * 6 * Math.PI / 180;
    s += '<line x1="80" y1="80" x2="' + (80 + 66 * Math.sin(ma)).toFixed(1) + '" y2="' + (80 - 66 * Math.cos(ma)).toFixed(1) + '" stroke="#1f8fe0" stroke-width="4" stroke-linecap="round"/>';
    s += '<line x1="80" y1="80" x2="' + (80 + 38 * Math.sin(ha)).toFixed(1) + '" y2="' + (80 - 38 * Math.cos(ha)).toFixed(1) + '" stroke="#e8453c" stroke-width="7" stroke-linecap="round"/>';
    s += '<circle cx="80" cy="80" r="5" fill="#27407a"/></svg>';
    return s;
  }

  function numberLineSVG(vals, hidden) {
    const n = vals.length, W = 40 + n * 56, cy = 44;
    let s = '<svg viewBox="0 0 ' + W + ' 86" class="nline" role="img" aria-label="Tia số" style="width:100%;max-width:' + Math.min(W, 560) + 'px">';
    s += '<line x1="14" y1="' + cy + '" x2="' + (W - 8) + '" y2="' + cy + '" stroke="#27407a" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M' + (W - 20) + ' ' + (cy - 9) + ' L' + (W - 6) + ' ' + cy + ' L' + (W - 20) + ' ' + (cy + 9) + '" fill="none" stroke="#27407a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    vals.forEach((v, i) => {
      const x = 40 + i * 56;
      s += '<line x1="' + x + '" y1="' + (cy - 9) + '" x2="' + x + '" y2="' + (cy + 9) + '" stroke="#27407a" stroke-width="3"/>';
      if (i === hidden) {
        s += '<rect x="' + (x - 20) + '" y="' + (cy + 14) + '" width="40" height="30" rx="9" fill="#fff3c4" stroke="#f5a400" stroke-width="3" stroke-dasharray="5 4"/><text x="' + x + '" y="' + (cy + 36) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#c77d00" font-family="Baloo 2, Nunito, sans-serif">?</text>';
      } else {
        s += '<text x="' + x + '" y="' + (cy + 36) + '" text-anchor="middle" font-size="22" font-weight="800" fill="#27407a" font-family="Baloo 2, Nunito, sans-serif">' + v + '</text>';
      }
    });
    return s + '</svg>';
  }

  const LET = 'ABCDEFG';
  function pathSVG(lens) {
    const n = lens.length + 1, W = 320, H = 150, pts = [];
    for (let i = 0; i < n; i++) pts.push([30 + i * ((W - 60) / (n - 1)), i % 2 === 0 ? rnd(95, 125) : rnd(30, 60)]);
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="shape" role="img" aria-label="Đường gấp khúc">';
    s += '<polyline points="' + pts.map((p) => p.join(',')).join(' ') + '" fill="none" stroke="#7c5cff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach((p, i) => {
      const above = i % 2 === 1;
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#ff7a59"/><text x="' + p[0] + '" y="' + (p[1] + (above ? -12 : 24)) + '" text-anchor="middle" font-size="20" font-weight="800" fill="#27407a" font-family="Baloo 2, Nunito, sans-serif">' + LET[i] + '</text>';
    });
    lens.forEach((L, i) => {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      s += '<text x="' + (mx + (i % 2 === 0 ? 14 : 14)) + '" y="' + (my + 4) + '" font-size="16" font-weight="800" fill="#1a8c64" font-family="Baloo 2, Nunito, sans-serif" paint-order="stroke" stroke="#fff" stroke-width="4">' + L + ' cm</text>';
    });
    return s + '</svg>';
  }

  function polyShape(k, size) {
    size = size || 96;
    const pts = [], rot = Math.random() * 6.28;
    for (let i = 0; i < k; i++) {
      const a = rot + (i / k) * 6.283 + (Math.random() - 0.5) * (k === 4 ? 0.5 : 0.35);
      const r = 36 + Math.random() * 8;
      pts.push([(50 + r * Math.cos(a)).toFixed(1), (50 + r * Math.sin(a)).toFixed(1)]);
    }
    return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="Hình"><polygon points="' + pts.map((p) => p.join(',')).join(' ') + '" fill="#ffd36b" stroke="#c77d00" stroke-width="4" stroke-linejoin="round"/></svg>';
  }
  function circleShape(size) {
    return '<svg viewBox="0 0 100 100" width="' + (size || 96) + '" height="' + (size || 96) + '" role="img" aria-label="Hình"><ellipse cx="50" cy="50" rx="38" ry="' + rnd(30, 38) + '" fill="#ffd36b" stroke="#c77d00" stroke-width="4"/></svg>';
  }
  function lineSVG(kind) {
    const text = (x, y, t) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="20" font-weight="800" fill="#27407a" font-family="Baloo 2, Nunito, sans-serif">' + t + '</text>';
    let s = '<svg viewBox="0 0 240 110" class="shape" role="img" aria-label="Hình vẽ">';
    const y1 = rnd(40, 75), y2 = rnd(35, 75);
    if (kind === 'segment') {
      s += '<line x1="40" y1="' + y1 + '" x2="200" y2="' + y2 + '" stroke="#7c5cff" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="40" cy="' + y1 + '" r="6" fill="#ff7a59"/><circle cx="200" cy="' + y2 + '" r="6" fill="#ff7a59"/>' + text(40, y1 - 12, 'A') + text(200, y2 - 12, 'B');
    } else if (kind === 'line') {
      s += '<line x1="6" y1="' + (y1 + 8) + '" x2="234" y2="' + (y2 - 8) + '" stroke="#7c5cff" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M16 ' + (y1 + 1) + ' L6 ' + (y1 + 8) + ' L17 ' + (y1 + 16) + '" fill="none" stroke="#7c5cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M224 ' + (y2 - 17) + ' L234 ' + (y2 - 8) + ' L224 ' + (y2 - 2) + '" fill="none" stroke="#7c5cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
      s += '<path d="M20 70 C 60 ' + (y1 - 30) + ', 90 ' + (y1 + 40) + ', 130 60 S 200 ' + (y2 - 20) + ', 220 55" fill="none" stroke="#7c5cff" stroke-width="5" stroke-linecap="round"/>';
    }
    return s + '</svg>';
  }
  function collinearSVG(isCol) {
    const A = [rnd(30, 60), rnd(60, 90)], B = [rnd(170, 210), rnd(25, 55)];
    const t = 0.25 + Math.random() * 0.5;
    const C = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    if (!isCol) C[1] += pick([-1, 1]) * rnd(26, 36);
    const dir = [B[0] - A[0], B[1] - A[1]];
    const ext = (p, k) => [p[0] + dir[0] * k, p[1] + dir[1] * k];
    const e1 = ext(A, -0.12), e2 = ext(B, 0.12);
    const dot = (p, l, dy) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6.5" fill="#ff7a59"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) + '" text-anchor="middle" font-size="20" font-weight="800" fill="#27407a" font-family="Baloo 2, Nunito, sans-serif">' + l + '</text>';
    return '<svg viewBox="0 0 240 120" class="shape" role="img" aria-label="Ba điểm A, B, C">' +
      '<line x1="' + e1[0].toFixed(1) + '" y1="' + e1[1].toFixed(1) + '" x2="' + e2[0].toFixed(1) + '" y2="' + e2[1].toFixed(1) + '" stroke="#9aa8c9" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      dot(A, 'A', -12) + dot(B, 'B', -12) + dot(C, 'C', C[1] > (A[1] + B[1]) / 2 + 5 ? 24 : -12) + '</svg>';
  }

  const DOW = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
  const DOW_S = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  function calHTML(start, days, hiddenDay, month) {
    let h = '<div class="cal"><div class="calt">' + (month ? 'THÁNG ' + month : 'TỜ LỊCH') + '</div><table><tr>' + DOW_S.map((d) => '<th>' + d + '</th>').join('') + '</tr><tr>';
    for (let i = 0; i < start; i++) h += '<td></td>';
    let col = start;
    for (let d = 1; d <= days; d++) {
      h += '<td' + (d === hiddenDay ? ' class="hid"' : '') + '>' + (d === hiddenDay ? '?' : d) + '</td>';
      col++;
      if (col === 7 && d < days) { h += '</tr><tr>'; col = 0; }
    }
    for (let i = col; i > 0 && i < 7; i++) h += '<td></td>';
    return h + '</tr></table></div>';
  }

  function emojiRow(name, n, e) {
    return '<div class="erow"><b>' + name + '</b><span>' + Array(n + 1).join(e) + '</span></div>';
  }

  /* ---------- cặp số không nhớ / có nhớ ---------- */
  function addNoCarry(max) {
    for (;;) {
      const a = rnd(10, max - 1), b = rnd(2, max - 10);
      if (a % 10 + b % 10 <= 9 && a + b <= max && a % 10 + b % 10 > 0) return [a, b];
    }
  }
  function subNoCarry(max) {
    for (;;) {
      const a = rnd(20, max), b = rnd(2, a - 3);
      if (a % 10 >= b % 10 && a > b) return [a, b];
    }
  }
  function addPair(lv) {
    if (lv < 2) { const a = rnd(3, 12); return [a, rnd(2, 20 - a)]; }
    return addNoCarry(80);
  }
  function subPair(lv) {
    if (lv < 2) return [rnd(11, 20), rnd(2, 9)];
    return subNoCarry(80);
  }
  function addCarry2(oneDigit) {
    for (;;) {
      const a = rnd(11, 89), b = oneDigit ? rnd(2, 9) : rnd(11, 89);
      if (a % 10 + b % 10 >= 10 && a + b <= 100) return [a, b];
    }
  }
  function subBorrow2(oneDigit) {
    for (;;) {
      const a = rnd(21, 99), b = oneDigit ? rnd(2, 9) : rnd(11, a - 2);
      if (a % 10 < b % 10 && a > b) return [a, b];
    }
  }

  /* ===================================================================
     CÁC DẠNG TOÁN
     =================================================================== */

  /* 1. Ôn tập các số đến 100 */
  function G_numbers(lv) {
    const k = pick(lv === 0 ? ['tens', 'compose', 'read', 'compare', 'decomp', 'tens']
      : ['tens', 'compose', 'read', 'read2', 'compare', 'decomp', 'extreme', 'makeNum', 'sort', 'sort']);
    const hi = lv === 0 ? 60 : 99;
    if (k === 'tens') {
      const n = rnd(11, hi), t = Math.floor(n / 10), u = n % 10;
      return num('Số <b>' + n + '</b> gồm mấy chục và mấy đơn vị?', [t, u], { labels: ['chục', 'đơn vị'], hint: n + ' = ' + t * 10 + ' + ' + u + ', nên số ' + n + ' gồm ' + t + ' chục và ' + u + ' đơn vị.' });
    }
    if (k === 'compose') {
      const t = rnd(1, Math.floor(hi / 10)), u = rnd(0, 9), n = t * 10 + u;
      return choiceNum('<b>' + t + ' chục</b> và <b>' + u + ' đơn vị</b> là số nào?', n, { min: 10, max: 99, hint: t + ' chục là ' + t * 10 + ', thêm ' + u + ' đơn vị được ' + n + '.' });
    }
    if (k === 'read') {
      const n = rnd(11, hi);
      return choiceNum('Số “<b>' + readNum(n) + '</b>” viết là:', n, { min: 11, max: 99, hint: readNum(n) + ' viết là ' + n + '.' });
    }
    if (k === 'read2') {
      const n = rnd(21, 99);
      const ws = numWrongs(n, { min: 11, max: 99 }).slice(0, 3).map(readNum);
      return choice('Số <b>' + n + '</b> đọc là:', readNum(n), ws, { cols: 1, hint: n + ' đọc là “' + readNum(n) + '”.' });
    }
    if (k === 'compare') {
      const a = rnd(10, hi);
      let b = pick([a, a + rnd(1, 9), a - rnd(1, 9), a + 10, a - 10, rnd(10, hi)]);
      if (b < 10 || b > 99) b = a;
      const r = a > b ? '&gt;' : a < b ? '&lt;' : '=';
      return choice('Chọn dấu thích hợp:', r, ['&gt;', '&lt;', '='], {
        visual: '<div class="big">' + a + ' <span class="qbox">?</span> ' + b + '</div>', big: true, keepOrder: ['&gt;', '&lt;', '='],
        hint: a === b ? 'Hai số bằng nhau nên dùng dấu =.' : 'So sánh chục trước, rồi so sánh đơn vị: ' + a + (a > b ? ' lớn hơn ' : ' bé hơn ') + b + '.'
      });
    }
    if (k === 'decomp') {
      const n = rnd(11, hi), t = Math.floor(n / 10), u = n % 10;
      if (Math.random() < 0.5) return num('Số ?', [u], { pre: n + ' = ' + t * 10 + ' + ', hint: n + ' = ' + t * 10 + ' + ' + u });
      return num('Số ?', [t * 10], { pre: n + ' = ', post: ' + ' + u, hint: n + ' = ' + t * 10 + ' + ' + u });
    }
    if (k === 'extreme') {
      const set = new Set(); while (set.size < 4) set.add(rnd(10, 99));
      const arr = Array.from(set), big = Math.random() < 0.5;
      const ans = big ? Math.max.apply(null, arr) : Math.min.apply(null, arr);
      return choice('Số nào <b>' + (big ? 'lớn nhất' : 'bé nhất') + '</b> trong các số sau?', ans, arr.filter((x) => x !== ans), { keepOrder: arr.map(String).sort((x, y) => x - y), hint: 'So sánh số chục trước: ' + ans + ' là số ' + (big ? 'lớn nhất.' : 'bé nhất.') });
    }
    if (k === 'makeNum') {
      const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), big = Math.random() < 0.5;
      const all = [];
      ds.forEach((x) => ds.forEach((y) => { if (x !== y) all.push(x * 10 + y); }));
      const ans = big ? Math.max.apply(null, all) : Math.min.apply(null, all);
      return choice('Từ ba thẻ số <span class="cards">' + ds.map((d) => '<i>' + d + '</i>').join('') + '</span> lập số có hai chữ số <b>' + (big ? 'lớn nhất' : 'bé nhất') + '</b>:', ans, all.filter((x) => x !== ans), { hint: big ? 'Số lớn nhất: chữ số lớn nhất ở hàng chục.' : 'Số bé nhất: chữ số bé nhất ở hàng chục.' });
    }
    // sort
    const set = new Set(); while (set.size < 4) set.add(rnd(10, lv === 1 ? 70 : 99));
    const arr = Array.from(set).sort((a, b) => a - b), asc = Math.random() < 0.5;
    return sortQ('Sắp xếp các số theo thứ tự từ <b>' + (asc ? 'bé đến lớn' : 'lớn đến bé') + '</b>. Chạm lần lượt vào từng số.', asc ? arr : arr.slice().reverse(), { hint: 'Thứ tự đúng: ' + (asc ? arr : arr.slice().reverse()).join(', ') });
  }

  /* 2. Tia số. Số liền trước, số liền sau */
  function G_numberline(lv) {
    const max = lv === 0 ? 20 : lv === 1 ? 60 : 99;
    const k = pick(lv === 0 ? ['next', 'prev', 'line', 'line', 'between'] : ['next', 'prev', 'line', 'between', 'both', 'seq']);
    if (k === 'next') { const n = rnd(1, max - 1); return num('Số liền sau của <b>' + n + '</b> là số nào?', n + 1, { hint: 'Số liền sau hơn số đó 1 đơn vị: ' + n + ' + 1 = ' + (n + 1) + '.' }); }
    if (k === 'prev') { const n = rnd(2, max); return num('Số liền trước của <b>' + n + '</b> là số nào?', n - 1, { hint: 'Số liền trước kém số đó 1 đơn vị: ' + n + ' ' + MINUS + ' 1 = ' + (n - 1) + '.' }); }
    if (k === 'between') { const n = rnd(2, max - 1); return num('Số nào ở giữa <b>' + (n - 1) + '</b> và <b>' + (n + 1) + '</b>?', n, { hint: (n - 1) + ', ' + n + ', ' + (n + 1) + ' – số ở giữa là ' + n + '.' }); }
    if (k === 'both') { const n = rnd(11, max - 1); return num('Tìm số liền trước và số liền sau của <b>' + n + '</b>.', [n - 1, n + 1], { labels: ['liền trước', 'liền sau'], hint: (n - 1) + ', ' + n + ', ' + (n + 1) }); }
    if (k === 'seq') {
      const s = rnd(10, max - 5), pos = rnd(1, 3);
      const vals = [s, s + 1, s + 2, s + 3, s + 4];
      return num('Số ?', [vals[pos]], { pre: vals.map((v, i) => i === pos ? '<span class="qbox">?</span>' : v).join(', '), hint: 'Dãy số tăng dần, mỗi lần thêm 1: ' + vals.join(', ') });
    }
    // line
    let step = 1, start, len = 9;
    if (lv === 2) { step = pick([1, 10]); }
    if (step === 10) { start = 0; len = 11; } else { start = lv === 0 ? rnd(0, 10) : rnd(0, max - 10); }
    const vals = []; for (let i = 0; i < len; i++) vals.push(start + i * step);
    const hid = rnd(1, len - 2);
    return num('Tìm số còn thiếu trên tia số.', [vals[hid]], { visual: numberLineSVG(vals, hid), hint: 'Trên tia số, hai vạch liên tiếp hơn kém nhau ' + step + ' đơn vị.' });
  }

  /* 3. Các thành phần của phép cộng, phép trừ */
  function G_parts(lv) {
    const max = lv === 0 ? 20 : lv === 1 ? 60 : 99;
    const k = pick(lv === 0 ? ['name', 'name', 'sum', 'diff'] : ['name', 'sum', 'diff', 'sub3', 'missing', 'missing']);
    if (k === 'name') {
      const add = Math.random() < 0.5;
      let a, b, c;
      if (add) { a = rnd(3, max - 3); b = rnd(2, max - a); c = a + b; } else { a = rnd(5, max); b = rnd(2, a - 1); c = a - b; }
      const op = add ? '+' : MINUS;
      const roles = add ? [['Số hạng', a], ['Số hạng', b], ['Tổng', c]] : [['Số bị trừ', a], ['Số trừ', b], ['Hiệu', c]];
      const r = pick(roles);
      const others = add ? ['Số hạng', 'Tổng', 'Số bị trừ', 'Hiệu'] : ['Số bị trừ', 'Số trừ', 'Hiệu', 'Số hạng'];
      return choice('Trong phép tính <b>' + a + ' ' + op + ' ' + b + ' = ' + c + '</b>, số <b>' + r[1] + '</b> gọi là gì?', r[0], others, { cols: 2, hint: add ? 'a + b = c: a và b là số hạng, c là tổng.' : 'a ' + MINUS + ' b = c: a là số bị trừ, b là số trừ, c là hiệu.' });
    }
    if (k === 'sum') {
      const [a, b] = lv === 0 ? [rnd(2, 9), rnd(2, 9)] : addNoCarry(max);
      return num('Tính <b>tổng</b> của <b>' + a + '</b> và <b>' + b + '</b>.', a + b, { hint: 'Tổng = số hạng + số hạng: ' + a + ' + ' + b + ' = ' + (a + b) });
    }
    if (k === 'diff') {
      const a = lv === 0 ? rnd(10, 20) : rnd(30, max), b = lv === 0 ? rnd(2, 9) : rnd(2, 9);
      return num('Tính <b>hiệu</b> của <b>' + a + '</b> và <b>' + b + '</b>.', a - b, { hint: 'Hiệu = số bị trừ ' + MINUS + ' số trừ: ' + a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) });
    }
    if (k === 'sub3') {
      const a = rnd(20, max), b = rnd(2, 19);
      return num('Số bị trừ là <b>' + a + '</b>, số trừ là <b>' + b + '</b>. Hiệu là bao nhiêu?', a - b, { hint: a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) });
    }
    // missing
    const t = pick(['a', 'b', 'c']);
    if (t === 'a') { const x = rnd(3, 30), y = rnd(5, 40); return num('Số ?', [x], { pre: '<span class="qbox">?</span> + ' + y + ' = ' + (x + y), hint: 'Số hạng chưa biết = tổng ' + MINUS + ' số hạng kia: ' + (x + y) + ' ' + MINUS + ' ' + y + ' = ' + x }); }
    if (t === 'b') { const x = rnd(20, 60), y = rnd(5, 19); return num('Số ?', [y], { pre: x + ' ' + MINUS + ' <span class="qbox">?</span> = ' + (x - y), hint: 'Số trừ = số bị trừ ' + MINUS + ' hiệu: ' + x + ' ' + MINUS + ' ' + (x - y) + ' = ' + y }); }
    const x = rnd(20, 70), y = rnd(5, 25);
    return num('Số ?', [x], { pre: '<span class="qbox">?</span> ' + MINUS + ' ' + y + ' = ' + (x - y), hint: 'Số bị trừ = hiệu + số trừ: ' + (x - y) + ' + ' + y + ' = ' + x });
  }

  /* 4. Hơn, kém nhau bao nhiêu */
  function G_diff(lv) {
    const [P, Q] = names(2), [o, e] = pick(OBJECTS);
    const hi = lv === 0 ? 12 : lv === 1 ? 20 : 60;
    let a = rnd(Math.floor(hi / 2), hi), b = rnd(2, a - 1);
    if (lv === 2) [a, b] = subNoCarry(90);
    const more = Math.random() < 0.5;
    const vis = a <= 14 ? '<div class="erows">' + emojiRow(P, a, e) + emojiRow(Q, b, e) + '</div>' : '';
    const text = P + ' có <b>' + a + '</b> ' + o + ', ' + Q + ' có <b>' + b + '</b> ' + o + '. ' + (more ? 'Hỏi ' + P + ' <b>hơn</b> ' + Q + ' bao nhiêu ' + o + '?' : 'Hỏi ' + Q + ' <b>kém</b> ' + P + ' bao nhiêu ' + o + '?');
    return num(text, a - b, { visual: vis, unit: o, hint: 'Tìm phần hơn (kém) bằng phép trừ: ' + a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) + '.' });
  }

  /* 5. Cộng, trừ không nhớ trong phạm vi 100 */
  function G_nocarry(lv) {
    const add = Math.random() < 0.5;
    if (lv === 0 && Math.random() < 0.5) {
      const a = rnd(1, 7) * 10, b = rnd(1, 9 - a / 10 > 0 ? 9 - a / 10 : 1) * 10;
      return add ? num('Tính nhẩm: <b>' + a + ' + ' + b + '</b>', a + b, { hint: a / 10 + ' chục + ' + b / 10 + ' chục = ' + (a + b) / 10 + ' chục = ' + (a + b) })
        : num('Tính nhẩm: <b>' + (a + b) + ' ' + MINUS + ' ' + b + '</b>', a, { hint: (a + b) / 10 + ' chục ' + MINUS + ' ' + b / 10 + ' chục = ' + a / 10 + ' chục = ' + a });
    }
    const max = lv === 0 ? 49 : 99;
    if (add) {
      const [a, b] = addNoCarry(max);
      return num('Đặt tính rồi tính.', a + b, { vert: { a, b, op: '+' }, hint: 'Cộng từng hàng, đơn vị với đơn vị, chục với chục: ' + a + ' + ' + b + ' = ' + (a + b) });
    }
    const [a, b] = subNoCarry(max);
    return num('Đặt tính rồi tính.', a - b, { vert: { a, b, op: MINUS }, hint: 'Trừ từng hàng, đơn vị với đơn vị, chục với chục: ' + a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) });
  }

  /* 6. Phép cộng qua 10 trong phạm vi 20 */
  function addHint(a, b) {
    const x = Math.max(a, b), y = Math.min(a, b), need = 10 - x;
    return x + ' + ' + y + ': tách ' + y + ' = ' + need + ' + ' + (y - need) + '. Ta có ' + x + ' + ' + need + ' = 10, rồi 10 + ' + (y - need) + ' = ' + (a + b) + '.';
  }
  function G_add20(lv) {
    const k = pick(lv === 0 ? ['calc', 'calc', 'calc', 'missing'] : ['calc', 'missing', 'compare', 'which', 'calc']);
    let a, b;
    do { a = rnd(2, 9); b = rnd(2, 9); } while (a + b < 11 || (lv === 0 && Math.max(a, b) < 8));
    if (k === 'calc') return num('Tính: <b>' + a + ' + ' + b + '</b>', a + b, { hint: addHint(a, b) });
    if (k === 'missing') return num('Số ?', [b], { pre: a + ' + <span class="qbox">?</span> = ' + (a + b), hint: (a + b) + ' ' + MINUS + ' ' + a + ' = ' + b + '. ' + addHint(a, b) });
    if (k === 'which') {
      const r = rnd(12, 17), opts = [];
      for (let x = 2; x <= 9; x++) { const y = r - x; if (y >= 2 && y <= 9 && x <= y) opts.push(x + ' + ' + y); }
      const ok = pick(opts);
      const wrong = []; while (wrong.length < 3) { const x = rnd(2, 9), y = rnd(2, 9); if (x + y !== r && x + y > 10) wrong.push(x + ' + ' + y); }
      return choice('Phép tính nào có kết quả bằng <b>' + r + '</b>?', ok, wrong, { hint: 'Tính từng phép tính: ' + ok + ' = ' + r });
    }
    let c, d;
    do { c = rnd(2, 9); d = rnd(2, 9); } while (c + d < 11);
    const s1 = a + b, s2 = c + d, r = s1 > s2 ? '&gt;' : s1 < s2 ? '&lt;' : '=';
    return choice('Chọn dấu thích hợp:', r, ['&gt;', '&lt;', '='], { visual: '<div class="big">' + a + ' + ' + b + ' <span class="qbox">?</span> ' + c + ' + ' + d + '</div>', big: true, keepOrder: ['&gt;', '&lt;', '='], hint: a + ' + ' + b + ' = ' + s1 + ' và ' + c + ' + ' + d + ' = ' + s2 });
  }

  /* 7. Phép trừ qua 10 trong phạm vi 20 */
  function subHint(m, s) {
    const u = m - 10;
    return m + ' ' + MINUS + ' ' + s + ': tách ' + s + ' = ' + u + ' + ' + (s - u) + '. Ta có ' + m + ' ' + MINUS + ' ' + u + ' = 10, rồi 10 ' + MINUS + ' ' + (s - u) + ' = ' + (m - s) + '.';
  }
  function G_sub20(lv) {
    const k = pick(lv === 0 ? ['calc', 'calc', 'calc', 'missing'] : ['calc', 'missing', 'compare', 'which', 'calc', 'missing2']);
    let m, s;
    do { m = rnd(11, lv === 0 ? 14 : 18); s = rnd(2, 9); } while (m - 10 >= s);
    if (k === 'calc') return num('Tính: <b>' + m + ' ' + MINUS + ' ' + s + '</b>', m - s, { hint: subHint(m, s) });
    if (k === 'missing') return num('Số ?', [m - s], { pre: m + ' ' + MINUS + ' ' + s + ' = <span class="qbox">?</span>', hint: subHint(m, s) });
    if (k === 'missing2') return num('Số ?', [s], { pre: m + ' ' + MINUS + ' <span class="qbox">?</span> = ' + (m - s), hint: 'Số trừ = số bị trừ ' + MINUS + ' hiệu: ' + m + ' ' + MINUS + ' ' + (m - s) + ' = ' + s });
    if (k === 'which') {
      const r = rnd(3, 9), opts = [];
      for (let x = 11; x <= 18; x++) { const y = x - r; if (y >= 2 && y <= 9 && x - 10 < y) opts.push(x + ' ' + MINUS + ' ' + y); }
      if (!opts.length) return G_sub20(lv);
      const ok = pick(opts), wrong = [];
      while (wrong.length < 3) { const x = rnd(11, 18), y = rnd(2, 9); if (x - 10 < y && x - y !== r) wrong.push(x + ' ' + MINUS + ' ' + y); }
      return choice('Phép tính nào có kết quả bằng <b>' + r + '</b>?', ok, wrong, { hint: 'Tính từng phép tính: ' + ok + ' = ' + r });
    }
    let m2, s2;
    do { m2 = rnd(11, 18); s2 = rnd(2, 9); } while (m2 - 10 >= s2);
    const r1 = m - s, r2 = m2 - s2, r = r1 > r2 ? '&gt;' : r1 < r2 ? '&lt;' : '=';
    return choice('Chọn dấu thích hợp:', r, ['&gt;', '&lt;', '='], { visual: '<div class="big">' + m + ' ' + MINUS + ' ' + s + ' <span class="qbox">?</span> ' + m2 + ' ' + MINUS + ' ' + s2 + '</div>', big: true, keepOrder: ['&gt;', '&lt;', '='], hint: m + ' ' + MINUS + ' ' + s + ' = ' + r1 + ' và ' + m2 + ' ' + MINUS + ' ' + s2 + ' = ' + r2 });
  }

  /* 8. Bài toán thêm, bớt, nhiều hơn, ít hơn */
  function G_story(lv) {
    const [P, Q] = names(2), [o] = pick(OBJECTS);
    const kind = pick(['add', 'sub', 'more', 'less']);
    const add0 = kind === 'add' || kind === 'more';
    const [a, b] = add0 ? addPair(lv) : subPair(lv);
    const add = kind === 'add' || kind === 'more';
    const ans = add ? a + b : a - b;
    let text;
    if (kind === 'add') text = P + ' có <b>' + a + '</b> ' + o + ', được cho thêm <b>' + b + '</b> ' + o + '. Hỏi ' + P + ' có tất cả bao nhiêu ' + o + '?';
    else if (kind === 'sub') text = P + ' có <b>' + a + '</b> ' + o + ', đã tặng bạn <b>' + b + '</b> ' + o + '. Hỏi ' + P + ' còn lại bao nhiêu ' + o + '?';
    else if (kind === 'more') text = P + ' có <b>' + a + '</b> ' + o + '. ' + Q + ' có <b>nhiều hơn</b> ' + P + ' <b>' + b + '</b> ' + o + '. Hỏi ' + Q + ' có bao nhiêu ' + o + '?';
    else text = P + ' có <b>' + a + '</b> ' + o + '. ' + Q + ' có <b>ít hơn</b> ' + P + ' <b>' + b + '</b> ' + o + '. Hỏi ' + Q + ' có bao nhiêu ' + o + '?';
    const hint = (add ? 'Làm phép cộng: ' + a + ' + ' + b : 'Làm phép trừ: ' + a + ' ' + MINUS + ' ' + b) + ' = ' + ans + '.';
    if (lv < 2 && Math.random() < 0.3) {
      const right = a + ' ' + (add ? '+' : MINUS) + ' ' + b;
      const wrong = a + ' ' + (add ? MINUS : '+') + ' ' + b;
      return choice(text + '<br>Phép tính nào đúng?', right, [wrong], { count: 1, hint: (add ? 'Thêm, nhiều hơn → phép cộng.' : 'Bớt, ít hơn → phép trừ.') + ' ' + hint });
    }
    return num(text, ans, { unit: o, hint });
  }

  /* 9. Ki-lô-gam, lít */
  function G_measure(lv) {
    const k = pick(lv === 0 ? ['unit', 'unit', 'calc', 'compare'] : ['unit', 'calc', 'story', 'story', 'compare']);
    if (k === 'unit') {
      const w = [['Con lợn', 'nặng'], ['Bao gạo', 'nặng'], ['Quả dưa hấu', 'nặng'], ['Bạn học sinh', 'nặng'], ['Túi đường', 'nặng']];
      const v = [['Xô nước', 'chứa'], ['Chai dầu ăn', 'chứa'], ['Bình nước', 'chứa'], ['Can sữa', 'chứa'], ['Nồi canh', 'chứa']];
      const isW = Math.random() < 0.5, it = pick(isW ? w : v), n = isW ? rnd(2, 30) : rnd(2, 10);
      return choice(it[0] + ' ' + it[1] + ' <b>' + n + ' …</b>. Điền đơn vị đo thích hợp:', isW ? 'kg' : 'l', [isW ? 'l' : 'kg'], { count: 1, big: true, keepOrder: ['kg', 'l'], hint: isW ? 'Đo khối lượng (nặng) dùng ki-lô-gam (kg).' : 'Đo lượng nước, sữa, dầu… (dung tích) dùng lít (l).' });
    }
    if (k === 'calc') {
      const u = pick(['kg', 'l']);
      if (Math.random() < 0.5) { const [a, b] = lv === 0 ? [rnd(3, 9), rnd(2, 10)] : addPair(2); return num('Tính: <b>' + a + ' ' + u + ' + ' + b + ' ' + u + '</b>', a + b, { unit: u, hint: a + ' + ' + b + ' = ' + (a + b) + ', viết đơn vị ' + u + ' sau kết quả.' }); }
      const [a, b] = lv === 0 ? [rnd(10, 20), rnd(2, 9)] : subPair(2); return num('Tính: <b>' + a + ' ' + u + ' ' + MINUS + ' ' + b + ' ' + u + '</b>', a - b, { unit: u, hint: a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) + ', viết đơn vị ' + u + ' sau kết quả.' });
    }
    if (k === 'story') {
      const kinds = [
        () => { const [a, b] = addPair(2); return num('Bao gạo nặng <b>' + a + ' kg</b>, bao ngô nặng <b>' + b + ' kg</b>. Cả hai bao nặng bao nhiêu ki-lô-gam?', a + b, { unit: 'kg', hint: a + ' + ' + b + ' = ' + (a + b) }); },
        () => { const [a, b] = subPair(2); return num('Một can có <b>' + a + ' l</b> dầu, người ta rót ra <b>' + b + ' l</b>. Trong can còn lại bao nhiêu lít dầu?', a - b, { unit: 'l', hint: a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) }); },
        () => { const [a, b] = addPair(2); return num('Thùng thứ nhất chứa <b>' + a + ' l</b> nước, thùng thứ hai chứa <b>' + b + ' l</b> nước. Cả hai thùng chứa bao nhiêu lít nước?', a + b, { unit: 'l', hint: a + ' + ' + b + ' = ' + (a + b) }); },
        () => { const [a, b] = subPair(2); return num('Bạn Nam cân nặng <b>' + a + ' kg</b>. Bạn Mai nhẹ hơn Nam <b>' + b + ' kg</b>. Bạn Mai cân nặng bao nhiêu ki-lô-gam?', a - b, { unit: 'kg', hint: 'Nhẹ hơn → phép trừ: ' + a + ' ' + MINUS + ' ' + b + ' = ' + (a - b) }); }
      ];
      return pick(kinds)();
    }
    // compare
    const isW = Math.random() < 0.5, a = rnd(2, 30);
    let b; do { b = rnd(2, 30); } while (b === a);
    const [P, Q] = names(2), big = Math.random() < 0.5;
    const ans = (a > b) === big ? P : Q;
    const text = isW ? 'Túi của ' + P + ' nặng <b>' + a + ' kg</b>, túi của ' + Q + ' nặng <b>' + b + ' kg</b>. Túi của ai ' + (big ? '<b>nặng hơn</b>' : '<b>nhẹ hơn</b>') + '?'
      : 'Bình của ' + P + ' chứa <b>' + a + ' l</b> nước, bình của ' + Q + ' chứa <b>' + b + ' l</b> nước. Bình của ai chứa ' + (big ? '<b>nhiều nước hơn</b>' : '<b>ít nước hơn</b>') + '?';
    return choice(text, ans, [ans === P ? Q : P], { count: 1, keepOrder: [P, Q], hint: 'So sánh ' + a + ' và ' + b + ': ' + (a > b ? a + ' lớn hơn ' + b : a + ' bé hơn ' + b) + '.' });
  }

  /* 10. Cộng có nhớ trong phạm vi 100 */
  function carryHint(a, b) {
    const ua = a % 10, ub = b % 10, ta = Math.floor(a / 10), tb = Math.floor(b / 10), s = ua + ub;
    return 'Hàng đơn vị: ' + ua + ' + ' + ub + ' = ' + s + ', viết ' + s % 10 + ' nhớ 1. Hàng chục: ' + ta + (tb ? ' + ' + tb : '') + ' + 1 = ' + (ta + tb + 1) + '. Kết quả: ' + (a + b) + '.';
  }
  function G_addcarry(lv) {
    const [a, b] = addCarry2(lv === 0 || (lv === 1 && Math.random() < 0.3));
    const r = Math.random();
    if (lv >= 1 && r < 0.25) {
      const wrongRes = Math.random() < 0.5 ? a + b - 10 : a + b;
      const right = wrongRes === a + b;
      return choice('<div class="big">' + a + ' + ' + b + ' = ' + wrongRes + '</div>Kết quả này <b>đúng</b> hay <b>sai</b>?', right ? 'Đúng' : 'Sai', [right ? 'Sai' : 'Đúng'], { count: 1, big: true, keepOrder: ['Đúng', 'Sai'], hint: right ? 'Đúng rồi.' : 'Bạn quên “nhớ 1” sang hàng chục. ' + carryHint(a, b) });
    }
    if (r < 0.45) return num('Tính nhẩm: <b>' + a + ' + ' + b + '</b>', a + b, { hint: carryHint(a, b) });
    return num('Đặt tính rồi tính.', a + b, { vert: { a, b, op: '+' }, hint: carryHint(a, b) });
  }

  /* 11. Trừ có nhớ trong phạm vi 100 */
  function borrowHint(a, b) {
    const ua = a % 10, ub = b % 10, ta = Math.floor(a / 10), tb = Math.floor(b / 10);
    return 'Hàng đơn vị: ' + ua + ' < ' + ub + ' nên lấy ' + (10 + ua) + ' ' + MINUS + ' ' + ub + ' = ' + (10 + ua - ub) + ', viết ' + (10 + ua - ub) + ' nhớ 1. Hàng chục: ' + ta + ' ' + MINUS + (tb ? ' ' + tb + ' ' + MINUS : '') + ' 1 = ' + (ta - tb - 1) + '. Kết quả: ' + (a - b) + '.';
  }
  function G_subborrow(lv) {
    const [a, b] = subBorrow2(lv === 0 || (lv === 1 && Math.random() < 0.3));
    const r = Math.random();
    if (lv >= 1 && r < 0.25) {
      const right = Math.random() < 0.5, res = right ? a - b : a - b + 10;
      return choice('<div class="big">' + a + ' ' + MINUS + ' ' + b + ' = ' + res + '</div>Kết quả này <b>đúng</b> hay <b>sai</b>?', right ? 'Đúng' : 'Sai', [right ? 'Sai' : 'Đúng'], { count: 1, big: true, keepOrder: ['Đúng', 'Sai'], hint: right ? 'Đúng rồi.' : 'Bạn quên “nhớ 1” khi trừ hàng chục. ' + borrowHint(a, b) });
    }
    if (r < 0.45) return num('Tính nhẩm: <b>' + a + ' ' + MINUS + ' ' + b + '</b>', a - b, { hint: borrowHint(a, b) });
    return num('Đặt tính rồi tính.', a - b, { vert: { a, b, op: MINUS }, hint: borrowHint(a, b) });
  }

  /* 12. Hình phẳng */
  function G_shapes(lv) {
    const k = pick(lv === 0 ? ['lineKind', 'quadPick', 'collinear', 'segCount', 'lineKind'] : ['pathLen', 'pathLen', 'segCount', 'quadPick', 'collinear', 'lineKind']);
    if (k === 'lineKind') {
      const kind = pick(['segment', 'line', 'curve']);
      const name = { segment: 'Đoạn thẳng', line: 'Đường thẳng', curve: 'Đường cong' };
      return choice('Hình vẽ dưới đây là gì?', name[kind], Object.keys(name).filter((x) => x !== kind).map((x) => name[x]), { visual: lineSVG(kind), keepOrder: ['Đoạn thẳng', 'Đường thẳng', 'Đường cong'], cols: 1, hint: { segment: 'Đoạn thẳng có hai đầu (hai điểm mút) rõ ràng.', line: 'Đường thẳng kéo dài mãi về hai phía.', curve: 'Đường cong không thẳng, uốn lượn.' }[kind] });
    }
    if (k === 'quadPick') {
      const shapes = [{ s: polyShape(4), q: true }, { s: polyShape(3) }, { s: polyShape(5) }, { s: circleShape() }];
      const opts = [shapes[0]].concat(shuffle(shapes.slice(1)).slice(0, 2));
      const sh = shuffle(opts);
      return { type: 'choice', prompt: 'Hình nào là <b>hình tứ giác</b>?', options: sh.map((x) => x.s), answer: sh.findIndex((x) => x.q), hint: 'Hình tứ giác có 4 cạnh và 4 đỉnh.', cols: 3, svgOpts: true };
    }
    if (k === 'collinear') {
      const col = Math.random() < 0.5;
      return choice('Ba điểm <b>A, B, C</b> có thẳng hàng không?', col ? 'Thẳng hàng' : 'Không thẳng hàng', [col ? 'Không thẳng hàng' : 'Thẳng hàng'], { count: 1, visual: collinearSVG(col), keepOrder: ['Thẳng hàng', 'Không thẳng hàng'], cols: 1, hint: 'Ba điểm thẳng hàng là ba điểm cùng nằm trên một đường thẳng.' });
    }
    if (k === 'segCount') {
      const n = rnd(2, 4), lens = []; for (let i = 0; i < n; i++) lens.push(rnd(2, 9));
      return num('Đường gấp khúc <b>' + LET.slice(0, n + 1) + '</b> gồm mấy đoạn thẳng?', n, { visual: pathSVG(lens), hint: 'Đếm các đoạn thẳng nối các điểm liên tiếp: ' + Array.from({ length: n }, (_, i) => LET[i] + LET[i + 1]).join(', ') + '.' });
    }
    const n = lv === 1 ? 3 : pick([3, 4]), lens = []; for (let i = 0; i < n; i++) lens.push(rnd(2, lv === 2 ? 15 : 9));
    return num('Tính độ dài đường gấp khúc <b>' + LET.slice(0, n + 1) + '</b>.', lens.reduce((x, y) => x + y, 0), { visual: pathSVG(lens), unit: 'cm', hint: 'Độ dài đường gấp khúc là tổng độ dài các đoạn thẳng: ' + lens.join(' + ') + ' = ' + lens.reduce((x, y) => x + y, 0) + ' (cm).' });
  }

  /* 13. Ngày – giờ, giờ – phút */
  function timeLabel(h, m) { return h + ' giờ' + (m ? ' ' + m + ' phút' : ''); }
  function timeChoices(h, m, lv) {
    const mins = lv === 0 ? [0] : lv === 1 ? [0, 15, 30] : [0, 15, 30, 45];
    const set = [[h, m]];
    const tries = [[h % 12 + 1, m], [(h + 10) % 12 + 1, m], [h, pick(mins)], [(h + 1) % 12 + 1, m], [h, (m + 15) % 60], [h % 12 + 1, (m + 30) % 60]];
    shuffle(tries).forEach((t) => { if (!set.some((s) => s[0] === t[0] && s[1] === t[1]) && set.length < 4 && (mins.indexOf(t[1]) >= 0)) set.push(t); });
    return set;
  }
  function G_time(lv) {
    const k = pick(lv === 0 ? ['read', 'read', 'pick', 'fact', 'hands'] : ['read', 'pick', 'fact', 'hands', 'h24', 'h24', 'read']);
    const mins = lv === 0 ? [0] : lv === 1 ? [0, 15, 30] : [0, 15, 30, 45];
    const h = rnd(1, 12), m = pick(mins);
    if (k === 'read') {
      const set = timeChoices(h, m, lv);
      return choice('Đồng hồ chỉ mấy giờ?', timeLabel(h, m), set.slice(1).map((x) => timeLabel(x[0], x[1])), { visual: '<div class="clockwrap">' + clockSVG(h, m) + '</div>', cols: 2, hint: 'Kim ngắn (màu đỏ) chỉ giờ, kim dài (màu xanh) chỉ phút. Kim ngắn chỉ số ' + h + (m ? ', kim dài chỉ số ' + m / 5 + ' (' + m + ' phút)' : ', kim dài chỉ số 12 (giờ đúng)') + ': ' + timeLabel(h, m) + '.' });
    }
    if (k === 'pick') {
      const set = timeChoices(h, m, lv).slice(0, 3);
      const opts = shuffle(set);
      return { type: 'choice', prompt: 'Đồng hồ nào chỉ <b>' + timeLabel(h, m) + '</b>?', options: opts.map((x) => clockSVG(x[0], x[1], 104)), answer: opts.findIndex((x) => x[0] === h && x[1] === m), cols: 3, svgOpts: true, hint: 'Tìm đồng hồ có kim ngắn chỉ số ' + h + (m ? ' và kim dài chỉ số ' + m / 5 : ' và kim dài chỉ số 12') + '.' };
    }
    if (k === 'hands') {
      if (lv > 0 && Math.random() < 0.5) {
        return choice('Lúc <b>' + h + ' giờ đúng</b>, kim dài (kim phút) chỉ số mấy?', '12', ['6', '3', String(h)], { cols: 2, hint: 'Giờ đúng thì kim dài chỉ đúng số 12.' });
      }
      return num('Lúc <b>' + h + ' giờ đúng</b>, kim ngắn (kim giờ) chỉ số mấy?', h, { hint: 'Giờ đúng: kim ngắn chỉ số ' + h + ', kim dài chỉ số 12.' });
    }
    if (k === 'fact') {
      const f = pick([['Một ngày có bao nhiêu giờ?', 24, 'giờ', 'Một ngày có 24 giờ.'], ['Một giờ có bao nhiêu phút?', 60, 'phút', 'Một giờ có 60 phút.']]);
      return choice(f[0], f[1], f[1] === 24 ? [12, 20, 30] : [30, 100, 24], { hint: f[3], keepOrder: undefined });
    }
    // h24
    if (Math.random() < 0.5) {
      const H = rnd(13, 21), p = H <= 18 ? 'chiều' : 'tối';
      return num('<b>' + H + ' giờ</b> còn gọi là mấy giờ ' + p + '?', H - 12, { hint: H + ' ' + MINUS + ' 12 = ' + (H - 12) + ', nên ' + H + ' giờ là ' + (H - 12) + ' giờ ' + p + '.' });
    }
    const x = rnd(1, 9), p = x <= 6 ? 'chiều' : 'tối';
    return num('<b>' + x + ' giờ ' + p + '</b> còn gọi là mấy giờ (theo cách đọc 24 giờ)?', x + 12, { hint: x + ' + 12 = ' + (x + 12) + ', nên ' + x + ' giờ ' + p + ' là ' + (x + 12) + ' giờ.' });
  }

  /* 14. Ngày – tháng, xem lịch */
  const MDAYS = { 1: 31, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
  function G_calendar(lv) {
    const k = pick(lv === 0 ? ['days', 'week', 'dow', 'missing', 'next'] : ['days', 'dow', 'missing', 'next', 'count', 'dow', 'whichday']);
    if (k === 'week') return choice('Một tuần lễ có mấy ngày?', 7, [5, 6, 10], { hint: 'Một tuần lễ có 7 ngày: từ thứ Hai đến Chủ nhật.' });
    if (k === 'days') {
      const mo = pick(Object.keys(MDAYS).map(Number)), d = MDAYS[mo];
      return choice('Tháng <b>' + mo + '</b> có bao nhiêu ngày?', d, [30, 31, 28, 29].filter((x) => x !== d), { hint: 'Tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày. Tháng 4, 6, 9, 11 có 30 ngày. Tháng 2 có 28 hoặc 29 ngày.' });
    }
    const start = rnd(0, 6), days = pick([30, 31]), mo = rnd(1, 12);
    if (k === 'missing') {
      const hid = rnd(8, 25);
      return num('Tìm ngày còn thiếu trong tờ lịch.', hid, { visual: calHTML(start, days, hid, mo), hint: 'Mỗi tuần có 7 ngày, ngày ở dưới hơn ngày ở trên 7 đơn vị.' });
    }
    if (k === 'dow') {
      const d = rnd(2, 28), dw = (start + d - 1) % 7;
      return choice('Trong tờ lịch tháng ' + mo + ', ngày <b>' + d + '</b> là thứ mấy?', DOW[dw], shuffle(DOW.filter((x) => x !== DOW[dw])), { visual: calHTML(start, days, 0, mo), cols: 2, hint: 'Nhìn xuống cột của ngày ' + d + ' để biết thứ.' });
    }
    if (k === 'next') {
      const d = rnd(1, 20), dw = pick(DOW.slice(0, 6));
      return num('Hôm nay là ' + dw + ' ngày <b>' + d + '</b>. ' + dw + ' tuần sau là ngày bao nhiêu?', d + 7, { hint: 'Một tuần có 7 ngày: ' + d + ' + 7 = ' + (d + 7) + '.' });
    }
    if (k === 'whichday') {
      const d = rnd(1, 14), dw = rnd(0, 5);
      return choice('Ngày <b>' + d + '</b> là ' + DOW[dw] + '. Ngày <b>' + (d + 1) + '</b> là thứ mấy?', DOW[dw + 1], shuffle(DOW.filter((x, i) => i !== dw + 1)), { cols: 2, hint: 'Sau ' + DOW[dw] + ' là ' + DOW[dw + 1] + '.' });
    }
    // count
    const dw = rnd(0, 6);
    let c = 0; for (let d = 1; d <= days; d++) if ((start + d - 1) % 7 === dw) c++;
    return num('Tờ lịch tháng ' + mo + ' có mấy ngày <b>' + DOW[dw] + '</b>?', c, { visual: calHTML(start, days, 0, mo), hint: 'Đếm các ngày ở cột ' + DOW[dw] + '.' });
  }

  /* ---------- danh sách đảo ---------- */
  const TOPICS = [
    { id: 'numbers', name: 'Đảo Số Đến 100', lesson: 'Bài 1 · Ôn tập các số đến 100', icon: '🔢', color: '#ff7a59', gen: G_numbers },
    { id: 'numberline', name: 'Đảo Tia Số', lesson: 'Bài 2 · Tia số, liền trước, liền sau', icon: '📏', color: '#ffa41c', gen: G_numberline },
    { id: 'parts', name: 'Đảo Số Hạng – Tổng', lesson: 'Bài 3 · Thành phần của phép cộng, trừ', icon: '🧩', color: '#e0a800', gen: G_parts },
    { id: 'diff', name: 'Đảo Hơn Kém', lesson: 'Bài 4 · Hơn, kém nhau bao nhiêu', icon: '⚖️', color: '#7bc043', gen: G_diff },
    { id: 'nocarry', name: 'Đảo Cộng Trừ Đến 100', lesson: 'Bài 5–6 · Cộng, trừ không nhớ', icon: '🌴', color: '#2eb872', gen: G_nocarry },
    { id: 'add20', name: 'Đảo Cộng Qua 10', lesson: 'Bài 7–8 · Bảng cộng (qua 10)', icon: '➕', color: '#1fb5c9', gen: G_add20 },
    { id: 'sub20', name: 'Đảo Trừ Qua 10', lesson: 'Bài 11–12 · Bảng trừ (qua 10)', icon: '➖', color: '#1f8fe0', gen: G_sub20 },
    { id: 'story', name: 'Đảo Bài Toán Vui', lesson: 'Bài 9, 13 · Thêm, bớt, nhiều hơn, ít hơn', icon: '📖', color: '#5b6cff', gen: G_story },
    { id: 'measure', name: 'Đảo Ki-lô-gam & Lít', lesson: 'Bài 15–18 · kg và l', icon: '⚖', color: '#8a5cf6', gen: G_measure },
    { id: 'addcarry', name: 'Đảo Cộng Có Nhớ', lesson: 'Bài 19–21 · Cộng có nhớ đến 100', icon: '🚀', color: '#c44fd8', gen: G_addcarry },
    { id: 'subborrow', name: 'Đảo Trừ Có Nhớ', lesson: 'Bài 22–24 · Trừ có nhớ đến 100', icon: '🛸', color: '#ee4f93', gen: G_subborrow },
    { id: 'shapes', name: 'Đảo Hình Phẳng', lesson: 'Bài 25–28 · Đoạn thẳng, đường gấp khúc, tứ giác', icon: '🔷', color: '#e5533d', gen: G_shapes },
    { id: 'time', name: 'Đảo Đồng Hồ', lesson: 'Bài 29, 31 · Ngày – giờ, giờ – phút', icon: '⏰', color: '#00a6a6', gen: G_time },
    { id: 'calendar', name: 'Đảo Lịch', lesson: 'Bài 30–32 · Ngày – tháng', icon: '📅', color: '#4c8bf5', gen: G_calendar }
  ];

  function G_mixed(lv) { return pick(TOPICS).gen(lv); }

  /* chế độ Siêu tốc: phép tính ngắn, kết quả là số */
  function G_speed(level) {
    const r = Math.random();
    let a, b;
    if (level < 3) {
      if (r < 0.5) { a = rnd(2, 9); b = rnd(2, 9); return { q: a + ' + ' + b, a: a + b }; }
      a = rnd(6, 18); b = rnd(2, Math.min(9, a - 1)); return { q: a + ' ' + MINUS + ' ' + b, a: a - b };
    }
    if (level < 7) {
      if (r < 0.5) { [a, b] = addNoCarry(99); return { q: a + ' + ' + b, a: a + b }; }
      [a, b] = subNoCarry(99); return { q: a + ' ' + MINUS + ' ' + b, a: a - b };
    }
    if (r < 0.5) { [a, b] = addCarry2(Math.random() < 0.5); return { q: a + ' + ' + b, a: a + b }; }
    [a, b] = subBorrow2(Math.random() < 0.5); return { q: a + ' ' + MINUS + ' ' + b, a: a - b };
  }

  const API = { TOPICS, G_mixed, G_speed, readNum, rnd, pick, shuffle, MINUS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else root.Q = API;
})(typeof window !== 'undefined' ? window : globalThis);
