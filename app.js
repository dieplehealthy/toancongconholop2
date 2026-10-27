/* Hành trình Toán 2 – giao diện và luật chơi */
(function () {
  'use strict';
  const app = document.getElementById('app');
  const TOPICS = Q.TOPICS;
  const ROUND = 10, HEARTS = 5;
  const KEY = 'toan2-tap1-v1';
  const AVATARS = ['🦁', '🐼', '🐰', '🐯', '🐙', '🦄', '🐸', '🐧', '🦉', '🐬', '🐢', '🐻'];
  const STICKERS = ['🐱', '🐶', '🐹', '🐥', '🦆', '🐠', '🦋', '🐞', '🐝', '🦀', '🐳', '🦒', '🐘', '🦜', '🦩', '🦥', '🐲', '🦖', '🚀', '👑'];
  const NEED = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 23, 26, 29, 32, 35, 38, 40, 43, 45];
  const PRAISE = ['Giỏi quá!', 'Chính xác!', 'Tuyệt vời!', 'Đúng rồi!', 'Siêu đẳng!', 'Quá đỉnh!', 'Hoan hô!', 'Xuất sắc!'];
  const OOPS = ['Chưa đúng rồi', 'Gần đúng rồi!', 'Cố lên nào!', 'Suýt nữa thì đúng!'];

  /* ---------- lưu trữ ---------- */
  function defaults() { return { name: '', avatar: '🦁', stars: {}, stats: {}, coins: 0, sound: true, bestSpeed: 0, rounds: 0 }; }
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') return Object.assign(defaults(), j); } catch (e) { /* bỏ qua */ }
    return defaults();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* bỏ qua */ } }
  let S = load();

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const totalStars = () => Object.keys(S.stars).reduce((s, k) => s + (S.stars[k] || 0), 0);
  const unlocked = (stars) => NEED.filter((n) => n <= stars).length;
  function rank(t) { return t < 3 ? 'Thủy thủ tập sự' : t < 10 ? 'Hoa tiêu nhí' : t < 20 ? 'Thuyền trưởng' : t < 32 ? 'Nhà thám hiểm' : t < 45 ? 'Nhà toán học nhí' : 'Bậc thầy Toán học'; }
  const topicOf = (id) => TOPICS.find((t) => t.id === id);

  /* ---------- âm thanh & pháo giấy ---------- */
  let AC;
  function tone(f, d, type, when, vol) {
    if (!S.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + (when || 0);
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.14, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + d);
      o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + d + 0.02);
    } catch (e) { /* bỏ qua */ }
  }
  const sfx = {
    ok() { tone(660, 0.1); tone(880, 0.2, 'sine', 0.09); },
    no() { tone(240, 0.28, 'triangle', 0, 0.18); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', i * 0.12)); },
    tap() { tone(520, 0.04, 'sine', 0, 0.06); }
  };
  const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
  let parts = [], raf = 0;
  function confetti(n) {
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#ff7a59', '#ffc933', '#2eb872', '#1f8fe0', '#c44fd8', '#ee4f93'];
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 7, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 110 + Math.random() * 40 });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter((p) => p.life-- > 0 && p.y < cv.height + 20);
    parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= .99; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); cx.restore(); });
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
  }

  /* ---------- màn hình chính ---------- */
  let R = null, timer = 0;
  function stopTimer() { if (timer) { clearInterval(timer); timer = 0; } }

  function home() {
    stopTimer(); R = null;
    const total = totalStars();
    const msgs = total === 0 ? ['Chào bạn! Mình là Cáo Cam. Chọn một hòn đảo để bắt đầu cuộc phiêu lưu nhé!']
      : ['Hôm nay mình chinh phục đảo nào nhỉ?', 'Mỗi ngày luyện một chút, bạn sẽ giỏi toán lúc nào không hay!', 'Thu thập đủ ⭐ để mở thêm bạn mới trong bộ sưu tập nhé!', 'Đảo nào còn ít sao thì quay lại chơi tiếp nào!'];
    app.innerHTML = '<div class="top">' +
      '<button class="avatar" data-a="profile" aria-label="Đổi tên và nhân vật">' + S.avatar + '</button>' +
      '<div class="hello"><small>' + rank(total) + '</small><strong>' + esc(S.name || 'Bạn nhỏ') + '</strong></div>' +
      '<div class="pill" title="Số sao">⭐ ' + total + '</div><div class="pill" title="Xu">🪙 ' + S.coins + '</div>' +
      '<button class="iconbtn" data-a="snd" aria-label="Bật tắt âm thanh">' + (S.sound ? '🔊' : '🔇') + '</button></div>' +
      '<div class="mascot"><div class="fox">🦊</div><div class="bubble">' + Q.pick(msgs) + '</div></div>' +
      '<div class="sec">Hành trình 14 hòn đảo <small>Toán 2 · Tập 1</small></div><div class="map">' +
      TOPICS.map((t) => {
        const st = S.stars[t.id] || 0;
        return '<button class="isl" style="--c:' + t.color + '" data-a="play" data-id="' + t.id + '"><span class="ic">' + t.icon + '</span><span class="nm">' + t.name + '</span><span class="ls">' + t.lesson + '</span><span class="st">' +
          [1, 2, 3].map((n) => '<i class="' + (st >= n ? 'on' : '') + '">⭐</i>').join('') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="sec">Thử thách</div><div class="special">' +
      '<button class="sp speed" data-a="speed"><span class="ic">⚡</span><span><b>Siêu tốc</b><small>60 giây – tính thật nhanh' + (S.bestSpeed ? ' · Kỷ lục ' + S.bestSpeed : '') + '</small></span></button>' +
      '<button class="sp mix" data-a="play" data-id="mixed"><span class="ic">🎯</span><span><b>Tổng hợp</b><small>Trộn mọi dạng toán' + ((S.stars.mixed || 0) ? ' · ' + '⭐'.repeat(S.stars.mixed) : '') + '</small></span></button>' +
      '<button class="sp col" data-a="coll"><span class="ic">🎒</span><span><b>Bộ sưu tập</b><small>' + unlocked(total) + '/' + STICKERS.length + ' bạn đã mở</small></span></button>' +
      '<button class="sp par" data-a="par"><span class="ic">👨‍👩‍👧</span><span><b>Phụ huynh</b><small>Xem kết quả học</small></span></button></div>' +
      '<div class="foot">Bài tập bám sát sách <i>Toán 2 – Kết nối tri thức</i>, tập 1</div>';
    if (!S.name) profile(true);
  }

  function profile(first) {
    const m = document.createElement('div'); m.className = 'modal';
    let av = S.avatar;
    m.innerHTML = '<div class="dlg" role="dialog" aria-modal="true"><h2>' + (first ? 'Xin chào! 👋' : 'Hồ sơ của bạn') + '</h2><div>Bạn tên là gì? Chọn một nhân vật nhé!</div>' +
      '<input id="nm" maxlength="14" placeholder="Nhập tên bạn" value="' + esc(S.name) + '" autocomplete="off">' +
      '<div class="avs">' + AVATARS.map((a) => '<button data-av="' + a + '" class="' + (a === av ? 'sel' : '') + '">' + a + '</button>').join('') + '</div>' +
      '<button class="btn green" id="okp">' + (first ? 'Bắt đầu thôi!' : 'Lưu') + '</button></div>';
    document.body.appendChild(m);
    const inp = m.querySelector('#nm');
    setTimeout(() => inp.focus(), 50);
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-av]');
      if (b) { av = b.dataset.av; m.querySelectorAll('[data-av]').forEach((x) => x.classList.toggle('sel', x === b)); sfx.tap(); }
      if (e.target.id === 'okp') done();
    });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(); });
    function done() { S.name = inp.value.trim() || 'Bạn nhỏ'; S.avatar = av; save(); m.remove(); sfx.ok(); home(); }
  }

  /* ---------- vào lượt chơi ---------- */
  function startRound(id) {
    const t = id === 'mixed' ? { id: 'mixed', name: 'Thử thách tổng hợp', color: '#7c5cff', gen: Q.G_mixed } : topicOf(id);
    R = { mode: 'round', topic: t, i: 0, hearts: HEARTS, wrong: 0, correct: 0, streak: 0, bestStreak: 0, coins: 0, seen: {}, locked: false };
    nextQ();
  }
  function nextQ() {
    if (R.i >= ROUND) return finish();
    const lv = R.i < 3 ? 0 : R.i < 7 ? 1 : 2;
    let q, tries = 0;
    const keyOf = (x) => x.prompt + (x.vert ? x.vert.a + x.vert.op + x.vert.b : '') + (x.options ? x.options.join('') : '') + JSON.stringify(x.answers || x.order || '') + (x.pre || '');
    do { q = R.topic.gen(lv); tries++; } while (R.seen[keyOf(q)] && tries < 12);
    R.seen[keyOf(q)] = 1;
    R.q = q; R.locked = false; R.vals = (q.answers || []).map(() => ''); R.active = 0; R.picked = [];
    renderPlay();
  }

  const padHTML = '<div class="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button class="key" data-k="' + n + '">' + n + '</button>').join('') +
    '<button class="key del" data-k="del" aria-label="Xóa">⌫</button><button class="key" data-k="0">0</button><button class="key go" data-k="go" disabled>Kiểm tra</button></div>';

  function fieldHTML(i, q) {
    return '<span class="fld"><span class="box' + (i === 0 ? ' act' : '') + '" data-f="' + i + '" role="button" aria-label="Ô trả lời ' + (i + 1) + '"></span>' + (q.labels ? '<small>' + q.labels[i] + '</small>' : '') + '</span>';
  }
  function numberHTML(q) {
    let h = '';
    if (q.vert) h += '<div class="vert"><div class="r1">' + q.vert.a + '</div><div class="r2"><i>' + q.vert.op + '</i>' + q.vert.b + '</div><div class="ln"></div></div>';
    const fields = q.answers.map((_, i) => fieldHTML(i, q)).join('<span>&nbsp;</span>');
    const QB = '<span class="qbox">?</span>';
    if (q.pre && q.pre.indexOf('qbox') >= 0) h += '<div class="eq">' + q.pre.replace(QB, fields) + (q.unit ? '<span class="unit">' + q.unit + '</span>' : '') + '</div>';
    else h += '<div class="eq">' + (q.pre ? '<span>' + q.pre + '</span>' : '') + fields + (q.post ? '<span>' + q.post + '</span>' : '') + (q.unit ? '<span class="unit">' + q.unit + '</span>' : '') + '</div>';
    return h + padHTML;
  }
  function choiceHTML(q) {
    const cls = q.cols === 1 ? 'c1' : q.cols === 3 ? 'c3' : '';
    return '<div class="opts ' + cls + '">' + q.options.map((o, i) => '<button class="opt' + (q.svgOpts ? ' svgo' : '') + (q.big ? ' bigo' : '') + '" data-i="' + i + '">' + o + '</button>').join('') + '</div>';
  }
  function sortHTML(q) {
    const used = R.picked;
    return '<div class="tray ans" aria-label="Thứ tự bạn chọn">' + (used.length ? used.map((ix) => '<button class="tile" disabled>' + q.tiles[ix] + '</button>').join('') : '<span class="hintline">Chạm vào các số bên dưới theo đúng thứ tự</span>') + '</div>' +
      '<div class="tray">' + q.tiles.map((v, ix) => '<button class="tile' + (used.indexOf(ix) >= 0 ? ' used' : '') + '" data-t="' + ix + '">' + v + '</button>').join('') + '</div>' +
      '<div class="sortbtns"><button class="btn ghost" data-a="undo">↺ Làm lại</button></div>';
  }

  function renderPlay() {
    const q = R.q, t = R.topic;
    let body = '';
    if (q.visual) body += '<div class="visual">' + q.visual + '</div>';
    body += '<div class="prompt">' + q.prompt + '</div>';
    body += q.type === 'choice' ? choiceHTML(q) : q.type === 'number' ? numberHTML(q) : sortHTML(q);
    app.innerHTML = '<div class="playtop"><button class="iconbtn" data-a="quit" aria-label="Thoát">✕</button>' +
      '<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + ROUND + '" aria-valuenow="' + R.i + '"><i style="width:' + (R.i / ROUND * 100) + '%"></i></div>' +
      '<div class="hearts" aria-label="Còn ' + R.hearts + ' tim">' + Array.from({ length: HEARTS }, (_, i) => '<i class="' + (i < R.hearts ? '' : 'lost') + '">❤️</i>').join('') + '</div></div>' +
      '<div class="streak">' + (R.streak >= 2 ? '🔥 Chuỗi ' + R.streak + ' câu đúng!' : '') + '</div>' +
      '<div class="qcard" id="qcard"><span class="qtag" style="--tc:' + t.color + '">Câu ' + (R.i + 1) + '/' + ROUND + ' · ' + t.name + '</span>' + body + '<div id="fb"></div></div>';
    if (q.type === 'number') refreshFields();
  }

  /* ---------- nhập đáp án ---------- */
  function refreshFields() {
    const boxes = app.querySelectorAll('.box[data-f]');
    boxes.forEach((b, i) => { b.textContent = R.vals[i]; b.classList.toggle('act', i === R.active && !R.locked); });
    const go = app.querySelector('[data-k="go"]');
    if (go) go.disabled = R.vals.some((v) => v === '');
  }
  function press(k) {
    if (R.locked || !R.q || R.q.type !== 'number') return;
    if (k === 'go') return check();
    let v = R.vals[R.active];
    if (k === 'del') {
      if (v) v = v.slice(0, -1);
      else if (R.active > 0) { R.active--; v = R.vals[R.active].slice(0, -1); }
      R.vals[R.active] = v;
    } else if (v.length < 3) {
      v = (v === '0' ? '' : v) + k; R.vals[R.active] = v;
      if (R.vals.length > 1 && v.length === String(R.q.answers[R.active]).length && R.active < R.vals.length - 1) R.active++;
      if (R.speed && v.length === String(R.q.answers[0]).length) { sfx.tap(); refreshFields(); return speedCheck(); }
    }
    sfx.tap(); refreshFields();
  }

  function check() {
    const q = R.q;
    if (R.locked) return;
    if (q.type === 'number') {
      if (R.vals.some((v) => v === '')) return;
      const ok = q.answers.every((a, i) => parseInt(R.vals[i], 10) === a);
      app.querySelectorAll('.box[data-f]').forEach((b, i) => b.classList.add(parseInt(R.vals[i], 10) === q.answers[i] ? 'ok' : 'no'));
      const txt = q.answers.map((a, i) => a + (q.labels ? ' ' + q.labels[i] : '')).join(', ') + (q.unit && !q.labels ? ' ' + q.unit : '');
      return verdict(ok, 'Đáp án đúng: <b>' + txt + '</b>');
    }
    if (q.type === 'sort') {
      const got = R.picked.map((i) => q.tiles[i]);
      const ok = got.every((v, i) => v === q.order[i]);
      return verdict(ok, 'Thứ tự đúng: <b>' + q.order.join(', ') + '</b>');
    }
  }
  function pickChoice(i) {
    const q = R.q;
    if (R.locked) return;
    const btns = app.querySelectorAll('.opt');
    const ok = i === q.answer;
    btns[i].classList.add(ok ? 'ok' : 'no'); if (!ok) btns[q.answer].classList.add('ok');
    btns.forEach((b) => (b.disabled = true));
    verdict(ok, q.svgOpts ? '' : 'Đáp án đúng: <b>' + q.options[q.answer] + '</b>');
  }

  function verdict(ok, ansText) {
    R.locked = true;
    const t = R.topic, q = R.q;
    const stId = t.id;
    S.stats[stId] = S.stats[stId] || { c: 0, t: 0 };
    S.stats[stId].t++;
    let msg;
    if (ok) {
      R.correct++; R.streak++; R.bestStreak = Math.max(R.bestStreak, R.streak);
      const gain = 1 + (R.streak >= 3 ? 1 : 0); R.coins += gain; S.coins += gain; S.stats[stId].c++;
      sfx.ok();
      msg = '<div class="fb ok" role="status"><h3>' + Q.pick(PRAISE) + ' +' + gain + ' 🪙</h3>' + (q.hint && R.q.type === 'choice' ? '' : '') + '<button class="btn green" data-a="next" autofocus>Câu tiếp theo ➜</button></div>';
    } else {
      R.hearts--; R.wrong++; R.streak = 0; sfx.no();
      msg = '<div class="fb no" role="status"><h3>' + Q.pick(OOPS) + ' 💪</h3><p>' + ansText + (q.hint ? '<br><span class="hintline">💡 ' + q.hint + '</span>' : '') + '</p><button class="btn" data-a="next">' + (R.hearts <= 0 ? 'Xem kết quả' : 'Tiếp tục') + ' ➜</button></div>';
    }
    save();
    const pad = app.querySelector('.pad'); if (pad) pad.style.display = 'none';
    app.querySelectorAll('.tile,[data-a="undo"]').forEach((b) => (b.disabled = true));
    document.getElementById('fb').innerHTML = msg;
    const hearts = app.querySelector('.hearts');
    if (hearts) hearts.innerHTML = Array.from({ length: HEARTS }, (_, i) => '<i class="' + (i < R.hearts ? '' : 'lost') + '">❤️</i>').join('');
    const nb = app.querySelector('[data-a="next"]'); if (nb) { nb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); try { nb.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ } }
  }
  function advance() {
    if (!R) return;
    R.i++;
    if (R.hearts <= 0) return finish();
    nextQ();
  }

  /* ---------- kết quả ---------- */
  function finish() {
    const won = R.hearts > 0;
    const stars = !won ? 0 : R.wrong <= 1 ? 3 : R.wrong <= 3 ? 2 : 1;
    const before = unlocked(totalStars());
    const id = R.topic.id, prev = S.stars[id] || 0;
    if (stars > prev) S.stars[id] = stars;
    const bonus = stars * 5; S.coins += bonus; R.coins += bonus; S.rounds++;
    const after = unlocked(totalStars());
    save();
    const t = R.topic;
    const title = !won ? 'Hết tim rồi!' : stars === 3 ? 'Hoàn hảo!' : stars === 2 ? 'Rất tốt!' : 'Làm tốt lắm!';
    const sub = !won ? 'Không sao đâu, thử lại là sẽ giỏi hơn. Cáo Cam tin bạn!' : stars === 3 ? 'Bạn chinh phục hòn đảo này rồi!' : 'Chơi lại để lấy đủ 3 sao nhé!';
    let unl = '';
    if (after > before) unl = '<div class="unlock"><span class="em">' + STICKERS[after - 1] + '</span>Bạn mới mở khóa một người bạn mới trong <b>Bộ sưu tập</b>!</div>';
    app.innerHTML = '<div class="result"><div style="font-size:70px">' + (won ? '🏝️' : '🌊') + '</div><h2>' + title + '</h2><p>' + t.name + '</p>' +
      '<div class="stars" aria-label="' + stars + ' sao">' + [1, 2, 3].map((n) => '<i class="' + (stars >= n ? '' : 'off') + '">⭐</i>').join('') + '</div><p>' + sub + '</p>' +
      '<div class="stat"><div class="pill">✅ ' + R.correct + ' câu đúng</div><div class="pill">🔥 Chuỗi ' + R.bestStreak + '</div><div class="pill">🪙 +' + R.coins + '</div></div>' + unl +
      '<div class="rbtns"><button class="btn green" data-a="play" data-id="' + id + '">Chơi lại</button><button class="btn ghost" data-a="home">Về bản đồ</button></div></div>';
    if (won) { sfx.win(); confetti(stars === 3 ? 160 : 70); } else sfx.no();
  }

  /* ---------- Siêu tốc ---------- */
  function startSpeed() {
    stopTimer();
    R = { mode: 'speed', speed: true, score: 0, miss: 0, left: 60, t0: Date.now(), locked: false, topic: { id: 'speed', name: 'Siêu tốc', color: '#e8590c' } };
    speedQ(); renderSpeed();
    timer = setInterval(() => {
      R.left = Math.max(0, 60 - (Date.now() - R.t0) / 1000);
      const tm = app.querySelector('.timer'); if (tm) { tm.textContent = '⏱ ' + Math.ceil(R.left); tm.classList.toggle('low', R.left <= 10); }
      if (R.left <= 0) speedEnd();
    }, 100);
  }
  function speedQ() {
    const s = Q.G_speed(R.score);
    R.q = { type: 'number', answers: [s.a], text: s.q }; R.vals = ['']; R.active = 0; R.locked = false;
  }
  function renderSpeed() {
    app.innerHTML = '<div class="playtop"><button class="iconbtn" data-a="quit" aria-label="Thoát">✕</button><div class="timer" style="flex:1;text-align:center">⏱ ' + Math.ceil(R.left) + '</div><div class="score">✅ ' + R.score + '</div></div>' +
      '<div class="qcard"><span class="qtag" style="--tc:#e8590c">⚡ Siêu tốc</span><div class="speedq" id="sq">' + R.q.text + ' = ?</div>' +
      '<div class="eq"><span class="fld"><span class="box act" data-f="0"></span></span></div>' + padHTML + '</div>';
    refreshFields();
  }
  function speedCheck() {
    const ok = parseInt(R.vals[0], 10) === R.q.answers[0];
    const box = app.querySelector('.box'); box.classList.add(ok ? 'ok' : 'no');
    R.locked = true;
    if (ok) { R.score++; sfx.ok(); } else { R.miss++; sfx.no(); const sq = document.getElementById('sq'); if (sq) sq.innerHTML = R.q.text + ' = <span style="color:var(--ok)">' + R.q.answers[0] + '</span>'; }
    setTimeout(() => { if (!R || !R.speed || R.left <= 0) return; speedQ(); renderSpeed(); }, ok ? 220 : 900);
  }
  function speedEnd() {
    stopTimer();
    const sc = R.score, rec = sc > S.bestSpeed;
    if (rec) S.bestSpeed = sc;
    S.coins += sc; save();
    app.innerHTML = '<div class="result"><div style="font-size:70px">⚡</div><h2>' + (rec && sc > 0 ? 'Kỷ lục mới!' : 'Hết giờ!') + '</h2><p>Bạn trả lời đúng</p><div class="speedq">' + sc + '</div><p>câu trong 60 giây</p>' +
      '<div class="stat"><div class="pill">🏆 Kỷ lục: ' + S.bestSpeed + '</div><div class="pill">🪙 +' + sc + '</div></div><div class="rbtns"><button class="btn sun" data-a="speed">Chơi lại</button><button class="btn ghost" data-a="home">Về bản đồ</button></div></div>';
    R = null;
    if (rec && sc > 0) { sfx.win(); confetti(120); }
  }

  /* ---------- bộ sưu tập & phụ huynh ---------- */
  function collection() {
    const total = totalStars(), n = unlocked(total);
    const nextNeed = NEED.find((x) => x > total);
    app.innerHTML = '<div class="playtop"><button class="iconbtn" data-a="home" aria-label="Về">←</button><h2 style="flex:1">Bộ sưu tập</h2><div class="pill">⭐ ' + total + '</div></div>' +
      '<div class="card"><div class="coll">' + STICKERS.map((s, i) => '<div class="sticker' + (NEED[i] <= total ? '' : ' locked') + '" data-need="⭐' + NEED[i] + '"><span>' + s + '</span></div>').join('') + '</div></div>' +
      '<div class="mascot"><div class="fox">🦊</div><div class="bubble">' + (nextNeed != null ? 'Bạn đã mở ' + n + '/' + STICKERS.length + ' bạn. Cần thêm <b>' + (nextNeed - total) + ' ⭐</b> để gặp bạn tiếp theo!' : 'Wow! Bạn đã sưu tập đủ tất cả các bạn rồi! 🎉') + '</div></div>';
  }
  function parents() {
    const rows = TOPICS.concat([{ id: 'mixed', name: 'Tổng hợp', lesson: '' }]).map((t) => {
      const s = S.stats[t.id] || { c: 0, t: 0 }, pc = s.t ? Math.round(s.c / s.t * 100) : null;
      return '<tr><td><b>' + t.name.replace('Đảo ', '') + '</b><br><span class="hintline">' + (t.lesson || '') + '</span></td><td>' + (s.t ? s.c + '/' + s.t : '–') + '</td><td><div class="meter"><i class="' + (pc == null ? '' : pc >= 80 ? '' : pc >= 55 ? 'mid' : 'low') + '" style="width:' + (pc || 0) + '%"></i></div></td><td>' + '⭐'.repeat(S.stars[t.id] || 0) + '</td></tr>';
    }).join('');
    app.innerHTML = '<div class="playtop"><button class="iconbtn" data-a="home" aria-label="Về">←</button><h2 style="flex:1">Dành cho phụ huynh</h2></div>' +
      '<div class="card"><p style="margin:0 0 8px;font-size:16px">Tỉ lệ trả lời đúng theo từng dạng toán. Dạng nào có thanh <b style="color:var(--bad)">đỏ</b> hoặc <b style="color:#e08400">cam</b> là dạng con cần luyện thêm cùng bố mẹ. Tiến trình được lưu ngay trên trình duyệt này.</p>' +
      '<table class="ptab"><tr><th>Dạng toán</th><th>Đúng</th><th>Tỉ lệ</th><th>Sao</th></tr>' + rows + '</table></div>' +
      '<div class="card" style="font-size:16px">Số lượt đã chơi: <b>' + S.rounds + '</b> · Kỷ lục Siêu tốc: <b>' + S.bestSpeed + '</b> · Xu: <b>' + S.coins + '</b></div>' +
      '<button class="btn ghost" data-a="resetall" style="width:100%">🗑️ Xóa toàn bộ tiến trình</button>';
  }

  /* ---------- sự kiện ---------- */
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-a],[data-k],[data-i],[data-f],[data-t]');
    if (!el) return;
    const d = el.dataset;
    if (d.k !== undefined) { if (R && R.speed) { if (R.locked) return; if (d.k === 'go') { if (R.vals[0] !== '') speedCheck(); return; } } return press(d.k); }
    if (d.i !== undefined) return pickChoice(+d.i);
    if (d.f !== undefined) { if (R && !R.locked) { R.active = +d.f; refreshFields(); } return; }
    if (d.t !== undefined) {
      if (!R || R.locked) return;
      const ix = +d.t; if (R.picked.indexOf(ix) >= 0) return;
      R.picked.push(ix); sfx.tap(); renderPlay();
      if (R.picked.length === R.q.tiles.length) setTimeout(check, 250);
      return;
    }
    sfx.tap();
    switch (d.a) {
      case 'play': startRound(d.id); break;
      case 'speed': startSpeed(); break;
      case 'home': home(); break;
      case 'next': advance(); break;
      case 'undo': if (R && !R.locked) { R.picked = []; renderPlay(); } break;
      case 'quit': if (confirm('Thoát khỏi lượt chơi này? Kết quả lượt này sẽ không được lưu.')) home(); break;
      case 'snd': S.sound = !S.sound; save(); home(); if (S.sound) sfx.ok(); break;
      case 'profile': profile(false); break;
      case 'coll': collection(); break;
      case 'par': parents(); break;
      case 'resetall': if (confirm('Xóa toàn bộ sao, xu và kết quả? Việc này không thể hoàn tác.')) { const nm = S.name, av = S.avatar; S = defaults(); S.name = nm; S.avatar = av; save(); home(); } break;
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (!R) return;
    if (/^[0-9]$/.test(e.key)) { if (R.speed && R.locked) return; return press(e.key); }
    if (e.key === 'Backspace') return press('del');
    if (e.key === 'Enter') {
      if (e.target && e.target.dataset && e.target.dataset.a === 'next') return;
      e.preventDefault();
      if (R.speed) { if (!R.locked && R.vals[0] !== '') speedCheck(); return; }
      if (R.locked) return advance();
      if (R.q && R.q.type === 'number') check();
    }
  });

  home();
})();
