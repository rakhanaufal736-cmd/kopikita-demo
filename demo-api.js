/* Kopi Kita – backend tiruan untuk demo statis (GitHub Pages).
   Meniru endpoint /api/* dari server.js, tetapi datanya disimpan di localStorage
   browser pengunjung. Tidak ada server, tidak ada data yang dikirim ke mana pun. */
(() => {
  const K = 'kopikita-demo-v1', SESS = K + '-sess', SESSION_H = 12;
  const KEYS = /^(ing|bat|mov|po|st|shifts|shift|no|pn|set|sup|menu|ord:\d{4}-\d{2})$/;
  const ADMIN_KEYS = new Set(['set', 'menu']);
  const DEFAULT_USERS = [
    { u: 'admin', n: 'Admin Demo', role: 'Admin', act: true, p: 'admin1234' },
    { u: 'kasir', n: 'Kasir Demo', role: 'Staff', act: true, p: 'kasir1234' },
  ];
  let mem = null; // cadangan bila localStorage diblokir
  const rd = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const wr = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  function db() {
    if (mem) return mem;
    let s = null; try { s = JSON.parse(rd(K)); } catch (e) {}
    if (!s || !s.docs || !s.users) s = { docs: {}, users: DEFAULT_USERS.map(x => ({ ...x })) };
    return (mem = s);
  }
  const persist = () => wr(K, JSON.stringify(mem));
  const session = () => {
    let s = null; try { s = JSON.parse(rd(SESS)); } catch (e) {}
    if (!s || s.exp < Date.now()) return null;
    const x = db().users.find(a => a.u === s.u);
    return x && x.act ? x : null;
  };
  const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
  const err = (status, error) => json({ error }, status);
  const body = o => { try { return JSON.parse((o && o.body) || '{}'); } catch (e) { return {}; } };

  function getState() {
    const d = db().docs, parts = {}, revs = {};
    const ord = Object.keys(d).filter(k => k.startsWith('ord:')).sort().reverse().slice(0, 2);
    for (const k of Object.keys(d)) if (!k.startsWith('ord:') || ord.includes(k)) { parts[k] = d[k].v; revs[k] = d[k].rev; }
    return { parts, revs, t: Math.max(0, ...Object.values(d).map(x => x.t)) };
  }
  function putState(user, b) {
    const d = db().docs, parts = b.parts || {}, revs = b.revs || {}, out = {}, conflict = [];
    const seeding = !d.ing; // pengisian data contoh awal boleh oleh peran apa pun
    const next = {};
    for (const [k, val] of Object.entries(parts)) {
      if (!KEYS.test(k)) return err(400, 'Key tidak dikenal: ' + k);
      const row = d[k], rev = row ? row.rev : 0;
      if ((revs[k] || 0) !== rev) { conflict.push(k); continue; }
      const v = JSON.stringify(val);
      if (row && JSON.stringify(row.v) === v) continue;
      if (user.role !== 'Admin' && !seeding) {
        if (ADMIN_KEYS.has(k)) return err(403, 'Hanya admin yang boleh mengubah ' + k);
        if (k === 'st') {
          const m = new Map((row ? row.v : []).map(s => [s.id, s]));
          for (const s of val) { const o = m.get(s.id); if (o ? o.st !== s.st : s.st !== 'Menunggu') return err(403, 'Hanya admin yang boleh menyetujui opname'); }
        }
      }
      next[k] = { rev: rev + 1, v: val, t: Date.now() }; out[k] = rev + 1;
    }
    if (conflict.length) return json({ conflict }, 409);
    Object.assign(d, next); persist(); return json({ revs: out });
  }
  function saveUser(b) {
    const D = db(), u = String(b.u || '').trim().toLowerCase(), n = String(b.n || '').trim().slice(0, 60), p = String(b.p || '');
    if (!/^[a-z0-9._-]{3,32}$/.test(u)) return err(400, 'Username 3-32 karakter (huruf kecil, angka, . _ -)');
    if (!n) return err(400, 'Nama wajib diisi');
    if (!['Admin', 'Staff'].includes(b.role)) return err(400, 'Peran tidak valid');
    const x = D.users.find(a => a.u === u), act = b.act !== false;
    if (b.isNew && x) return err(400, 'Username sudah dipakai');
    if (!b.isNew && !x) return err(404, 'Pengguna tidak ditemukan');
    if ((b.isNew || p) && p.length < 8) return err(400, 'Password minimal 8 karakter');
    if (x && x.role === 'Admin' && x.act && (b.role !== 'Admin' || !act) && !D.users.some(a => a.role === 'Admin' && a.act && a.u !== u))
      return err(400, 'Harus ada minimal 1 admin aktif');
    if (!x) D.users.push({ u, n, role: b.role, act: true, p });
    else { Object.assign(x, { n, role: b.role, act }); if (p) x.p = p; }
    persist(); return json({ ok: 1 });
  }

  const route = (m, p, o) => {
    if (m === 'POST' && p === '/api/login') {
      const b = body(o), x = db().users.find(a => a.u === String(b.u || '').trim().toLowerCase());
      if (!x || !x.act || x.p !== String(b.p || '')) return err(401, 'Username atau password salah');
      wr(SESS, JSON.stringify({ u: x.u, exp: Date.now() + SESSION_H * 36e5 }));
      return json({ u: x.u, n: x.n, role: x.role });
    }
    const user = session(); if (!user) return err(401, 'Belum login');
    if (m === 'GET' && p === '/api/me') return json({ u: user.u, n: user.n, role: user.role });
    if (m === 'POST' && p === '/api/logout') { try { localStorage.removeItem(SESS); } catch (e) {} return json({ ok: 1 }); }
    if (m === 'GET' && p === '/api/ping') return json({ t: getState().t });
    if (m === 'GET' && p === '/api/state') return json(getState());
    if (m === 'PUT' && p === '/api/state') return putState(user, body(o));
    if (m === 'POST' && p === '/api/password') {
      const pw = String(body(o).p || ''); if (pw.length < 8) return err(400, 'Password minimal 8 karakter');
      user.p = pw; persist(); return json({ ok: 1 });
    }
    if (p === '/api/users' || p === '/api/reset') {
      if (user.role !== 'Admin') return err(403, 'Hanya admin');
      if (m === 'GET' && p === '/api/users') return json(db().users.map(({ u, n, role, act }) => ({ u, n, role, act })).sort((a, b) => a.u.localeCompare(b.u)));
      if (m === 'POST' && p === '/api/users') return saveUser(body(o));
      if (m === 'POST' && p === '/api/reset') { db().docs = {}; persist(); return json({ ok: 1 }); }
    }
    return err(404, 'Tidak ditemukan');
  };

  const realFetch = window.fetch.bind(window);
  window.fetch = (input, o = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api/')) return realFetch(input, o);
    const p = new URL(url, 'http://x').pathname, m = (o.method || 'GET').toUpperCase();
    return new Promise(res => setTimeout(() => res(route(m, p, o)), 30)); // jeda kecil agar terasa seperti jaringan
  };
})();
