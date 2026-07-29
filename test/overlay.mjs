/* WT-24 doğrulaması: dialog semantiği, Escape, geri tuşu, odak, kirli form. */
import fs from 'fs';
import path from 'path';
import { JSDOM, VirtualConsole } from 'jsdom';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

const ROOT = new URL('..', import.meta.url).pathname;
const errors = [], results = [];
const check = (n, p, d) => { results.push(p); console.log(`${p ? '✓' : '✗'} ${n}${d ? '  — ' + d : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  if (/navigation to another Document/.test(e.message || '')) return;
  errors.push('jsdomError: ' + (e.stack || e.message));
});
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), {
  url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc
});
const { window } = dom;
window.indexedDB = new FDBFactory();
window.IDBKeyRange = FDBKeyRange;
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
window.fetch = () => Promise.reject(new Error('offline'));
Object.defineProperty(window.navigator, 'serviceWorker', {
  configurable: true, value: { register: () => Promise.reject(new Error('x')), addEventListener() {} }
});
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.URL.createObjectURL = () => 'blob:test';
window.URL.revokeObjectURL = () => {};

window.eval(['version.js', 'dexie.min.js', 'evdata.js', 'app.js']
  .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n;\n')
  + `\n;window.__app = {db, S, openAdd, overlayOpen, overlayClose, overlayStack, saveSetting};`);
await sleep(1200);

const A = window.__app;
const $ = id => window.document.getElementById(id);
const doc = window.document;
await A.saveSetting('onboarded', true);
A.S.onboarded = true;
await A.overlayClose('ob', { force: true });
await sleep(100);

// --- dialog semantiği ---
const ovl = ['page-add', 'page-expense', 'page-country', 'page-addcar', 'ob'];
check('WT-24/1: beş overlay de role=dialog + aria-modal taşıyor',
  ovl.every(id => $(id).getAttribute('role') === 'dialog'
    && $(id).getAttribute('aria-modal') === 'true'));
check('WT-24/1: hepsinde aria-labelledby var ve hedefi mevcut',
  ovl.every(id => {
    const lb = $(id).getAttribute('aria-labelledby');
    return lb && doc.getElementById(lb);
  }), ovl.map(id => $(id).getAttribute('aria-labelledby')).join(', '));

// --- açılış: odak, inert, geçmiş ---
const histBefore = window.history.length;
await A.openAdd();
await sleep(120);
check('overlay açıldı', $('page-add').classList.contains('active'));
check('WT-24/4: arkadaki .app inert/aria-hidden oldu',
  doc.querySelector('.app').getAttribute('aria-hidden') === 'true');
check('WT-24/2: ilk odaklanabilir öğeye odaklanıldı',
  $('page-add').contains(doc.activeElement),
  'odak: ' + (doc.activeElement?.id || doc.activeElement?.tagName));
check('WT-24/6: geçmişe adım eklendi',
  window.history.state?.overlay === 'page-add',
  'history.state=' + JSON.stringify(window.history.state));

// --- WT-24/5: Escape kapatır (form boşken onay sorulmaz) ---
doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
await sleep(120);
check('WT-24/5: Escape overlay\'i kapattı', !$('page-add').classList.contains('active'));
check('WT-24/4: .app tekrar erişilebilir',
  doc.querySelector('.app').getAttribute('aria-hidden') === 'false');

// --- WT-24/6: geri tuşu KABUL KRİTERİ ---
await A.openAdd();
await sleep(120);
window.history.back();
await sleep(200);
check('WT-24/6 KABUL: geri tuşu formu kapattı, uygulamadan çıkmadı',
  !$('page-add').classList.contains('active') && A.overlayStack.length === 0,
  'stack=' + JSON.stringify(A.overlayStack));

// --- WT-24/7: dolu formda onay ---
await A.openAdd();
await sleep(120);
$('in-amount').value = '250';
let asked = false;
window.confirm = () => { asked = true; return false; };   // kullanıcı vazgeçiyor
await A.overlayClose('page-add');
await sleep(100);
check('WT-24/7: dolu formu kapatırken onay soruldu', asked);
check('WT-24/7: "hayır" denince overlay açık kaldı', $('page-add').classList.contains('active'));

window.confirm = () => true;                              // kullanıcı onaylıyor
await A.overlayClose('page-add');
await sleep(100);
check('WT-24/7: "evet" denince kapandı', !$('page-add').classList.contains('active'));

// --- odak tetikleyiciye dönüyor mu ---
const trigger = $('btn-add') || doc.querySelector('nav button');
trigger.focus();
await A.overlayOpen('page-country');
await sleep(120);
await A.overlayClose('page-country', { force: true });
await sleep(100);
check('WT-24/2: kapanışta odak tetikleyiciye döndü',
  doc.activeElement === trigger, 'odak: ' + (doc.activeElement?.id || doc.activeElement?.tagName));

// --- Tab döngüsü overlay içinde kalıyor mu ---
await A.overlayOpen('page-country');
await sleep(120);
const items = [...$('page-country').querySelectorAll(
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
check('WT-24/3: overlay içinde odaklanabilir öğe var', items.length > 0, items.length + ' öğe');
await A.overlayClose('page-country', { force: true });

const failed = results.filter(r => !r).length;
console.log('\n' + (failed ? `${failed} BAŞARISIZ` : 'TÜM KONTROLLER GEÇTİ') + ` (${results.length} kontrol)`);
if (errors.length) { console.log('\nHatalar:'); errors.slice(0, 6).forEach(e => console.log('  - ' + e.slice(0, 250))); }
process.exit(failed || errors.length ? 1 : 0);
