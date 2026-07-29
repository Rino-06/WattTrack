This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: .claude/**, _snapshot/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
.github/
  FUNDING.yml
app.js
dexie.min.js
evdata.js
icon-192.png
icon-512-maskable.png
icon-512.png
index.html
KURULUM.md
LICENSE
logo.png
manifest.json
nav-plus.png
privacy.html
screenshot-narrow.png
screenshot-wide.png
sw.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path=".github/FUNDING.yml">
github: Rino-06
</file>

<file path="LICENSE">
MIT License

Copyright (c) 2026 Fatih Hasdemir

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</file>

<file path="privacy.html">
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WattTrack — Gizlilik Politikası / Privacy Policy</title>
<style>
body{font-family:-apple-system,Segoe UI,system-ui,sans-serif;max-width:680px;margin:0 auto;
padding:28px 20px;line-height:1.6;color:#131714;background:#F1F7F2}
h1{font-size:22px}h2{font-size:16px;margin-top:26px}p,li{font-size:14.5px}
.en{color:#444;border-top:1px solid #ccc;margin-top:34px;padding-top:10px}
a{color:#1C8742}
</style>
</head>
<body>
<h1>⚡ WattTrack — Gizlilik Politikası</h1>
<p><b>Özet: WattTrack hiçbir kişisel verinizi toplamaz, saklamaz veya paylaşmaz.</b></p>
<h2>Verileriniz nerede?</h2>
<p>Tüm şarj kayıtlarınız, araç bilgileriniz ve ayarlarınız yalnızca <b>kendi cihazınızın
tarayıcı depolamasında</b> (IndexedDB) tutulur. Geliştiriciye ya da herhangi bir sunucuya
gönderilmez. Hesap, üyelik, giriş yoktur. Uygulamayı silerseniz verileriniz de silinir;
yedeklemek sizin elinizdedir (Ayarlar → Dışa Aktar).</p>
<h2>İnternete ne zaman çıkılır?</h2>
<ul>
<li><b>Döviz kuru</b> (yalnızca yurt dışı kayıtta): frankfurter.dev (Avrupa Merkez Bankası
verisi) sorgulanır. Yalnızca para birimi kodları ve tarih iletilir; tutar iletilmez.</li>
<li><b>Konum adı ve yakın istasyonlar</b> (yalnızca 📍 butonuna basarsanız): koordinatlarınız
OpenStreetMap Nominatim ve Open Charge Map servislerine gönderilir; sonuç yalnızca
formu doldurmak için kullanılır, saklanmaz.</li>
</ul>
<h2>Çerez, analitik, reklam</h2>
<p>Uygulamada çerez, analitik, izleme veya reklam <b>yoktur</b>.</p>
<h2>İzinler</h2>
<p>Konum izni yalnızca 📍 butonunu kullandığınızda işletim sistemi tarafından sorulur ve
istediğiniz an reddedebilirsiniz. Fotoğraf eklerken sistemin dosya seçicisi kullanılır;
uygulama galerinize doğrudan erişmez.</p>
<h2>İletişim</h2>
<p>Soru ve önerileriniz için: <a href="https://github.com/Rino-06">github.com/Rino-06</a></p>

<div class="en">
<h1>WattTrack — Privacy Policy (English)</h1>
<p><b>Summary: WattTrack does not collect, store or share any personal data.</b></p>
<p>All charging records, vehicle info and settings live only in your device's browser
storage (IndexedDB). Nothing is sent to the developer or any server. There is no account
or login. Network is used only for: (1) exchange rates from frankfurter.dev (currency
codes and date only), and (2) reverse-geocoding / nearby-station lookup via OpenStreetMap
Nominatim and Open Charge Map, only when you tap the 📍 button (coordinates only, not
stored). No cookies, no analytics, no ads. Contact:
<a href="https://github.com/Rino-06">github.com/Rino-06</a></p>
</div>
</body>
</html>
</file>

<file path="dexie.min.js">
(function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Dexie=t()})(this,function(){"use strict";var g=function(){return(g=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var i in t=arguments[n])Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e}).apply(this,arguments)};function i(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;i<o;i++)!r&&i in t||((r=r||Array.prototype.slice.call(t,0,i))[i]=t[i]);return e.concat(r||Array.prototype.slice.call(t))}var h="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:global,x=Object.keys,b=Array.isArray;function u(t,n){return"object"!=typeof n||x(n).forEach(function(e){t[e]=n[e]}),t}"undefined"==typeof Promise||h.Promise||(h.Promise=Promise);var s=Object.getPrototypeOf,n={}.hasOwnProperty;function m(e,t){return n.call(e,t)}function r(t,n){"function"==typeof n&&(n=n(s(t))),("undefined"==typeof Reflect?x:Reflect.ownKeys)(n).forEach(function(e){c(t,e,n[e])})}var a=Object.defineProperty;function c(e,t,n,r){a(e,t,u(n&&m(n,"get")&&"function"==typeof n.get?{get:n.get,set:n.set,configurable:!0}:{value:n,configurable:!0,writable:!0},r))}function o(t){return{from:function(e){return t.prototype=Object.create(e.prototype),c(t.prototype,"constructor",t),{extend:r.bind(null,t.prototype)}}}}var l=Object.getOwnPropertyDescriptor;function f(e,t){return l(e,t)||(e=s(e))&&f(e,t)}var d=[].slice;function y(e,t,n){return d.call(e,t,n)}function p(e,t){return t(e)}function v(e){if(!e)throw new Error("Assertion Failed")}function _(e){h.setImmediate?setImmediate(e):setTimeout(e,0)}function w(e,r){return e.reduce(function(e,t,n){n=r(t,n);return n&&(e[n[0]]=n[1]),e},{})}function k(e,t){if(m(e,t))return e[t];if(!t)return e;if("string"!=typeof t){for(var n=[],r=0,i=t.length;r<i;++r){var o=k(e,t[r]);n.push(o)}return n}var a=t.indexOf(".");if(-1!==a){var u=e[t.substr(0,a)];return void 0===u?void 0:k(u,t.substr(a+1))}}function E(e,t,n){if(e&&void 0!==t&&!("isFrozen"in Object&&Object.isFrozen(e)))if("string"!=typeof t&&"length"in t){v("string"!=typeof n&&"length"in n);for(var r=0,i=t.length;r<i;++r)E(e,t[r],n[r])}else{var o,a,u=t.indexOf(".");-1!==u?(o=t.substr(0,u),""===(a=t.substr(u+1))?void 0===n?b(e)&&!isNaN(parseInt(o))?e.splice(o,1):delete e[o]:e[o]=n:E(u=!(u=e[o])||!m(e,o)?e[o]={}:u,a,n)):void 0===n?b(e)&&!isNaN(parseInt(t))?e.splice(t,1):delete e[t]:e[t]=n}}function P(e){var t,n={};for(t in e)m(e,t)&&(n[t]=e[t]);return n}var t=[].concat;function K(e){return t.apply([],e)}var e="Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(K([8,16,32,64].map(function(t){return["Int","Uint","Float"].map(function(e){return e+t+"Array"})}))).filter(function(e){return h[e]}),O=e.map(function(e){return h[e]});w(e,function(e){return[e,!0]});var S=null;function A(e){S="undefined"!=typeof WeakMap&&new WeakMap;e=function e(t){if(!t||"object"!=typeof t)return t;var n=S&&S.get(t);if(n)return n;if(b(t)){n=[],S&&S.set(t,n);for(var r=0,i=t.length;r<i;++r)n.push(e(t[r]))}else if(0<=O.indexOf(t.constructor))n=t;else{var o,a=s(t);for(o in n=a===Object.prototype?{}:Object.create(a),S&&S.set(t,n),t)m(t,o)&&(n[o]=e(t[o]))}return n}(e);return S=null,e}var C={}.toString;function j(e){return C.call(e).slice(8,-1)}var D="undefined"!=typeof Symbol?Symbol.iterator:"@@iterator",I="symbol"==typeof D?function(e){var t;return null!=e&&(t=e[D])&&t.apply(e)}:function(){return null},B={};function T(e){var t,n,r,i;if(1===arguments.length){if(b(e))return e.slice();if(this===B&&"string"==typeof e)return[e];if(i=I(e)){for(n=[];!(r=i.next()).done;)n.push(r.value);return n}if(null==e)return[e];if("number"!=typeof(t=e.length))return[e];for(n=new Array(t);t--;)n[t]=e[t];return n}for(t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return n}var R="undefined"!=typeof Symbol?function(e){return"AsyncFunction"===e[Symbol.toStringTag]}:function(){return!1},F="undefined"!=typeof location&&/^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);function M(e,t){F=e,N=t}var N=function(){return!0},q=!new Error("").stack;function U(){if(q)try{throw new Error}catch(e){return e}return new Error}function L(e,t){var n=e.stack;return n?(t=t||0,0===n.indexOf(e.name)&&(t+=(e.name+e.message).split("\n").length),n.split("\n").slice(t).filter(N).map(function(e){return"\n"+e}).join("")):""}var V=["Unknown","Constraint","Data","TransactionInactive","ReadOnly","Version","NotFound","InvalidState","InvalidAccess","Abort","Timeout","QuotaExceeded","Syntax","DataClone"],e=["Modify","Bulk","OpenFailed","VersionChange","Schema","Upgrade","InvalidTable","MissingAPI","NoSuchDatabase","InvalidArgument","SubTransaction","Unsupported","Internal","DatabaseClosed","PrematureCommit","ForeignAwait"].concat(V),W={VersionChanged:"Database version changed by other database connection",DatabaseClosed:"Database has been closed",Abort:"Transaction aborted",TransactionInactive:"Transaction has already completed or failed",MissingAPI:"IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"};function z(e,t){this._e=U(),this.name=e,this.message=t}function Y(e,t){return e+". Errors: "+Object.keys(t).map(function(e){return t[e].toString()}).filter(function(e,t,n){return n.indexOf(e)===t}).join("\n")}function G(e,t,n,r){this._e=U(),this.failures=t,this.failedKeys=r,this.successCount=n,this.message=Y(e,t)}function H(e,t){this._e=U(),this.name="BulkError",this.failures=Object.keys(t).map(function(e){return t[e]}),this.failuresByPos=t,this.message=Y(e,t)}o(z).from(Error).extend({stack:{get:function(){return this._stack||(this._stack=this.name+": "+this.message+L(this._e,2))}},toString:function(){return this.name+": "+this.message}}),o(G).from(z),o(H).from(z);var Q=e.reduce(function(e,t){return e[t]=t+"Error",e},{}),X=z,J=e.reduce(function(e,n){var r=n+"Error";function t(e,t){this._e=U(),this.name=r,e?"string"==typeof e?(this.message=e+(t?"\n "+t:""),this.inner=t||null):"object"==typeof e&&(this.message=e.name+" "+e.message,this.inner=e):(this.message=W[n]||r,this.inner=null)}return o(t).from(X),e[n]=t,e},{});J.Syntax=SyntaxError,J.Type=TypeError,J.Range=RangeError;var $=V.reduce(function(e,t){return e[t+"Error"]=J[t],e},{});V=e.reduce(function(e,t){return-1===["Syntax","Type","Range"].indexOf(t)&&(e[t+"Error"]=J[t]),e},{});function Z(){}function ee(e){return e}function te(t,n){return null==t||t===ee?n:function(e){return n(t(e))}}function ne(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}function re(i,o){return i===Z?o:function(){var e=i.apply(this,arguments);void 0!==e&&(arguments[0]=e);var t=this.onsuccess,n=this.onerror;this.onsuccess=null,this.onerror=null;var r=o.apply(this,arguments);return t&&(this.onsuccess=this.onsuccess?ne(t,this.onsuccess):t),n&&(this.onerror=this.onerror?ne(n,this.onerror):n),void 0!==r?r:e}}function ie(n,r){return n===Z?r:function(){n.apply(this,arguments);var e=this.onsuccess,t=this.onerror;this.onsuccess=this.onerror=null,r.apply(this,arguments),e&&(this.onsuccess=this.onsuccess?ne(e,this.onsuccess):e),t&&(this.onerror=this.onerror?ne(t,this.onerror):t)}}function oe(i,o){return i===Z?o:function(e){var t=i.apply(this,arguments);u(e,t);var n=this.onsuccess,r=this.onerror;this.onsuccess=null,this.onerror=null;e=o.apply(this,arguments);return n&&(this.onsuccess=this.onsuccess?ne(n,this.onsuccess):n),r&&(this.onerror=this.onerror?ne(r,this.onerror):r),void 0===t?void 0===e?void 0:e:u(t,e)}}function ae(e,t){return e===Z?t:function(){return!1!==t.apply(this,arguments)&&e.apply(this,arguments)}}function ue(i,o){return i===Z?o:function(){var e=i.apply(this,arguments);if(e&&"function"==typeof e.then){for(var t=this,n=arguments.length,r=new Array(n);n--;)r[n]=arguments[n];return e.then(function(){return o.apply(t,r)})}return o.apply(this,arguments)}}V.ModifyError=G,V.DexieError=z,V.BulkError=H;var se={},ce=100,le=100,e="undefined"==typeof Promise?[]:function(){var e=Promise.resolve();if("undefined"==typeof crypto||!crypto.subtle)return[e,s(e),e];var t=crypto.subtle.digest("SHA-512",new Uint8Array([0]));return[t,s(t),e]}(),fe=e[0],he=e[1],de=e[2],pe=he&&he.then,ye=fe&&fe.constructor,ve=!!de,me=!1,ge=de?function(){de.then(Ne)}:h.setImmediate?setImmediate.bind(null,Ne):h.MutationObserver?function(){var e=document.createElement("div");new MutationObserver(function(){Ne(),e=null}).observe(e,{attributes:!0}),e.setAttribute("i","1")}:function(){setTimeout(Ne,0)},be=function(e,t){Se.push([e,t]),we&&(ge(),we=!1)},_e=!0,we=!0,xe=[],ke=[],Ee=null,Pe=ee,Ke={id:"global",global:!0,ref:0,unhandleds:[],onunhandled:ct,pgp:!1,env:{},finalize:function(){this.unhandleds.forEach(function(e){try{ct(e[0],e[1])}catch(e){}})}},Oe=Ke,Se=[],Ae=0,Ce=[];function je(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");this._listeners=[],this.onuncatched=Z,this._lib=!1;var t=this._PSD=Oe;if(F&&(this._stackHolder=U(),this._prev=null,this._numPrev=0),"function"!=typeof e){if(e!==se)throw new TypeError("Not a function");return this._state=arguments[1],this._value=arguments[2],void(!1===this._state&&Be(this,this._value))}this._state=null,this._value=null,++t.ref,function t(r,e){try{e(function(n){if(null===r._state){if(n===r)throw new TypeError("A promise cannot be resolved with itself.");var e=r._lib&&qe();n&&"function"==typeof n.then?t(r,function(e,t){n instanceof je?n._then(e,t):n.then(e,t)}):(r._state=!0,r._value=n,Te(r)),e&&Ue()}},Be.bind(null,r))}catch(e){Be(r,e)}}(this,e)}var De={get:function(){var u=Oe,t=Qe;function e(n,r){var i=this,o=!u.global&&(u!==Oe||t!==Qe),a=o&&!Ze(),e=new je(function(e,t){Re(i,new Ie(at(n,u,o,a),at(r,u,o,a),e,t,u))});return F&&Me(e,this),e}return e.prototype=se,e},set:function(e){c(this,"then",e&&e.prototype===se?De:{get:function(){return e},set:De.set})}};function Ie(e,t,n,r,i){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.resolve=n,this.reject=r,this.psd=i}function Be(t,n){var e,r;ke.push(n),null===t._state&&(e=t._lib&&qe(),n=Pe(n),t._state=!1,t._value=n,F&&null!==n&&"object"==typeof n&&!n._promise&&function(e,t,n){try{e.apply(null,n)}catch(e){t&&t(e)}}(function(){var e=f(n,"stack");n._promise=t,c(n,"stack",{get:function(){return me?e&&(e.get?e.get.apply(n):e.value):t.stack}})}),r=t,xe.some(function(e){return e._value===r._value})||xe.push(r),Te(t),e&&Ue())}function Te(e){var t=e._listeners;e._listeners=[];for(var n=0,r=t.length;n<r;++n)Re(e,t[n]);var i=e._PSD;--i.ref||i.finalize(),0===Ae&&(++Ae,be(function(){0==--Ae&&Le()},[]))}function Re(e,t){if(null!==e._state){var n=e._state?t.onFulfilled:t.onRejected;if(null===n)return(e._state?t.resolve:t.reject)(e._value);++t.psd.ref,++Ae,be(Fe,[n,e,t])}else e._listeners.push(t)}function Fe(e,t,n){try{var r,i=(Ee=t)._value;t._state?r=e(i):(ke.length&&(ke=[]),r=e(i),-1===ke.indexOf(i)&&function(e){var t=xe.length;for(;t;)if(xe[--t]._value===e._value)return xe.splice(t,1)}(t)),n.resolve(r)}catch(e){n.reject(e)}finally{Ee=null,0==--Ae&&Le(),--n.psd.ref||n.psd.finalize()}}function Me(e,t){var n=t?t._numPrev+1:0;n<ce&&(e._prev=t,e._numPrev=n)}function Ne(){qe()&&Ue()}function qe(){var e=_e;return we=_e=!1,e}function Ue(){var e,t,n;do{for(;0<Se.length;)for(e=Se,Se=[],n=e.length,t=0;t<n;++t){var r=e[t];r[0].apply(null,r[1])}}while(0<Se.length);we=_e=!0}function Le(){var e=xe;xe=[],e.forEach(function(e){e._PSD.onunhandled.call(null,e._value,e)});for(var t=Ce.slice(0),n=t.length;n;)t[--n]()}function Ve(e){return new je(se,!1,e)}function We(n,r){var i=Oe;return function(){var e=qe(),t=Oe;try{return nt(i,!0),n.apply(this,arguments)}catch(e){r&&r(e)}finally{nt(t,!1),e&&Ue()}}}r(je.prototype,{then:De,_then:function(e,t){Re(this,new Ie(null,null,e,t,Oe))},catch:function(e){if(1===arguments.length)return this.then(null,e);var t=e,n=arguments[1];return"function"==typeof t?this.then(null,function(e){return(e instanceof t?n:Ve)(e)}):this.then(null,function(e){return(e&&e.name===t?n:Ve)(e)})},finally:function(t){return this.then(function(e){return t(),e},function(e){return t(),Ve(e)})},stack:{get:function(){if(this._stack)return this._stack;try{me=!0;var e=function e(t,n,r){if(n.length===r)return n;var i="";{var o,a,u;!1===t._state&&(null!=(o=t._value)?(a=o.name||"Error",u=o.message||o,i=L(o,0)):(a=o,u=""),n.push(a+(u?": "+u:"")+i))}F&&((i=L(t._stackHolder,2))&&-1===n.indexOf(i)&&n.push(i),t._prev&&e(t._prev,n,r));return n}(this,[],20).join("\nFrom previous: ");return null!==this._state&&(this._stack=e),e}finally{me=!1}}},timeout:function(r,i){var o=this;return r<1/0?new je(function(e,t){var n=setTimeout(function(){return t(new J.Timeout(i))},r);o.then(e,t).finally(clearTimeout.bind(null,n))}):this}}),"undefined"!=typeof Symbol&&Symbol.toStringTag&&c(je.prototype,Symbol.toStringTag,"Dexie.Promise"),Ke.env=rt(),r(je,{all:function(){var o=T.apply(null,arguments).map(et);return new je(function(n,r){0===o.length&&n([]);var i=o.length;o.forEach(function(e,t){return je.resolve(e).then(function(e){o[t]=e,--i||n(o)},r)})})},resolve:function(n){if(n instanceof je)return n;if(n&&"function"==typeof n.then)return new je(function(e,t){n.then(e,t)});var e=new je(se,!0,n);return Me(e,Ee),e},reject:Ve,race:function(){var e=T.apply(null,arguments).map(et);return new je(function(t,n){e.map(function(e){return je.resolve(e).then(t,n)})})},PSD:{get:function(){return Oe},set:function(e){return Oe=e}},totalEchoes:{get:function(){return Qe}},newPSD:Je,usePSD:it,scheduler:{get:function(){return be},set:function(e){be=e}},rejectionMapper:{get:function(){return Pe},set:function(e){Pe=e}},follow:function(i,n){return new je(function(e,t){return Je(function(n,r){var e=Oe;e.unhandleds=[],e.onunhandled=r,e.finalize=ne(function(){var t,e=this;t=function(){0===e.unhandleds.length?n():r(e.unhandleds[0])},Ce.push(function e(){t(),Ce.splice(Ce.indexOf(e),1)}),++Ae,be(function(){0==--Ae&&Le()},[])},e.finalize),i()},n,e,t)})}}),ye&&(ye.allSettled&&c(je,"allSettled",function(){var e=T.apply(null,arguments).map(et);return new je(function(n){0===e.length&&n([]);var r=e.length,i=new Array(r);e.forEach(function(e,t){return je.resolve(e).then(function(e){return i[t]={status:"fulfilled",value:e}},function(e){return i[t]={status:"rejected",reason:e}}).then(function(){return--r||n(i)})})})}),ye.any&&"undefined"!=typeof AggregateError&&c(je,"any",function(){var e=T.apply(null,arguments).map(et);return new je(function(n,r){0===e.length&&r(new AggregateError([]));var i=e.length,o=new Array(i);e.forEach(function(e,t){return je.resolve(e).then(function(e){return n(e)},function(e){o[t]=e,--i||r(new AggregateError(o))})})})}));var ze={awaits:0,echoes:0,id:0},Ye=0,Ge=[],He=0,Qe=0,Xe=0;function Je(e,t,n,r){var i=Oe,o=Object.create(i);o.parent=i,o.ref=0,o.global=!1,o.id=++Xe;var a=Ke.env;o.env=ve?{Promise:je,PromiseProp:{value:je,configurable:!0,writable:!0},all:je.all,race:je.race,allSettled:je.allSettled,any:je.any,resolve:je.resolve,reject:je.reject,nthen:ut(a.nthen,o),gthen:ut(a.gthen,o)}:{},t&&u(o,t),++i.ref,o.finalize=function(){--this.parent.ref||this.parent.finalize()};r=it(o,e,n,r);return 0===o.ref&&o.finalize(),r}function $e(){return ze.id||(ze.id=++Ye),++ze.awaits,ze.echoes+=le,ze.id}function Ze(){return!!ze.awaits&&(0==--ze.awaits&&(ze.id=0),ze.echoes=ze.awaits*le,!0)}function et(e){return ze.echoes&&e&&e.constructor===ye?($e(),e.then(function(e){return Ze(),e},function(e){return Ze(),lt(e)})):e}function tt(){var e=Ge[Ge.length-1];Ge.pop(),nt(e,!1)}function nt(e,t){var n,r=Oe;(t?!ze.echoes||He++&&e===Oe:!He||--He&&e===Oe)||ot(t?function(e){++Qe,ze.echoes&&0!=--ze.echoes||(ze.echoes=ze.id=0),Ge.push(Oe),nt(e,!0)}.bind(null,e):tt),e!==Oe&&(Oe=e,r===Ke&&(Ke.env=rt()),ve&&(n=Ke.env.Promise,t=e.env,he.then=t.nthen,n.prototype.then=t.gthen,(r.global||e.global)&&(Object.defineProperty(h,"Promise",t.PromiseProp),n.all=t.all,n.race=t.race,n.resolve=t.resolve,n.reject=t.reject,t.allSettled&&(n.allSettled=t.allSettled),t.any&&(n.any=t.any))))}function rt(){var e=h.Promise;return ve?{Promise:e,PromiseProp:Object.getOwnPropertyDescriptor(h,"Promise"),all:e.all,race:e.race,allSettled:e.allSettled,any:e.any,resolve:e.resolve,reject:e.reject,nthen:he.then,gthen:e.prototype.then}:{}}function it(e,t,n,r,i){var o=Oe;try{return nt(e,!0),t(n,r,i)}finally{nt(o,!1)}}function ot(e){pe.call(fe,e)}function at(t,n,r,i){return"function"!=typeof t?t:function(){var e=Oe;r&&$e(),nt(n,!0);try{return t.apply(this,arguments)}finally{nt(e,!1),i&&ot(Ze)}}}function ut(n,r){return function(e,t){return n.call(this,at(e,r),at(t,r))}}-1===(""+pe).indexOf("[native code]")&&($e=Ze=Z);var st="unhandledrejection";function ct(e,t){var n;try{n=t.onuncatched(e)}catch(e){}if(!1!==n)try{var r,i={promise:t,reason:e};if(h.document&&document.createEvent?((r=document.createEvent("Event")).initEvent(st,!0,!0),u(r,i)):h.CustomEvent&&u(r=new CustomEvent(st,{detail:i}),i),r&&h.dispatchEvent&&(dispatchEvent(r),!h.PromiseRejectionEvent&&h.onunhandledrejection))try{h.onunhandledrejection(r)}catch(e){}F&&r&&!r.defaultPrevented&&console.warn("Unhandled rejection: "+(e.stack||e))}catch(e){}}var lt=je.reject;function ft(e){return!/(dexie\.js|dexie\.min\.js)/.test(e)}var ht=String.fromCharCode(65535),dt="Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.",pt="String expected.",yt=[],vt="undefined"!=typeof navigator&&/(MSIE|Trident|Edge)/.test(navigator.userAgent),mt=vt,gt=vt,bt="__dbnames",_t="readonly",wt="readwrite";function xt(e,t){return e?t?function(){return e.apply(this,arguments)&&t.apply(this,arguments)}:e:t}var kt={type:3,lower:-1/0,lowerOpen:!1,upper:[[]],upperOpen:!1};function Et(t){return"string"!=typeof t||/\./.test(t)?function(e){return e}:function(e){return void 0===e[t]&&t in e&&delete(e=A(e))[t],e}}var Pt=(Kt.prototype._trans=function(e,r,t){var n=this._tx||Oe.trans,i=this.name;function o(e,t,n){if(!n.schema[i])throw new J.NotFound("Table "+i+" not part of transaction");return r(n.idbtrans,n)}var a=qe();try{return n&&n.db===this.db?n===Oe.trans?n._promise(e,o,t):Je(function(){return n._promise(e,o,t)},{trans:n,transless:Oe.transless||Oe}):function t(n,r,i,o){if(n.idbdb&&(n._state.openComplete||Oe.letThrough||n._vip)){var a=n._createTransaction(r,i,n._dbSchema);try{a.create(),n._state.PR1398_maxLoop=3}catch(e){return e.name===Q.InvalidState&&n.isOpen()&&0<--n._state.PR1398_maxLoop?(console.warn("Dexie: Need to reopen db"),n._close(),n.open().then(function(){return t(n,r,i,o)})):lt(e)}return a._promise(r,function(e,t){return Je(function(){return Oe.trans=a,o(e,t,a)})}).then(function(e){return a._completion.then(function(){return e})})}if(n._state.openComplete)return lt(new J.DatabaseClosed(n._state.dbOpenError));if(!n._state.isBeingOpened){if(!n._options.autoOpen)return lt(new J.DatabaseClosed);n.open().catch(Z)}return n._state.dbReadyPromise.then(function(){return t(n,r,i,o)})}(this.db,e,[this.name],o)}finally{a&&Ue()}},Kt.prototype.get=function(t,e){var n=this;return t&&t.constructor===Object?this.where(t).first(e):this._trans("readonly",function(e){return n.core.get({trans:e,key:t}).then(function(e){return n.hook.reading.fire(e)})}).then(e)},Kt.prototype.where=function(o){if("string"==typeof o)return new this.db.WhereClause(this,o);if(b(o))return new this.db.WhereClause(this,"["+o.join("+")+"]");var n=x(o);if(1===n.length)return this.where(n[0]).equals(o[n[0]]);var e=this.schema.indexes.concat(this.schema.primKey).filter(function(t){return t.compound&&n.every(function(e){return 0<=t.keyPath.indexOf(e)})&&t.keyPath.every(function(e){return 0<=n.indexOf(e)})})[0];if(e&&this.db._maxKey!==ht)return this.where(e.name).equals(e.keyPath.map(function(e){return o[e]}));!e&&F&&console.warn("The query "+JSON.stringify(o)+" on "+this.name+" would benefit of a compound index ["+n.join("+")+"]");var a=this.schema.idxByName,r=this.db._deps.indexedDB;function u(e,t){try{return 0===r.cmp(e,t)}catch(e){return!1}}var t=n.reduce(function(e,t){var n=e[0],r=e[1],e=a[t],i=o[t];return[n||e,n||!e?xt(r,e&&e.multi?function(e){e=k(e,t);return b(e)&&e.some(function(e){return u(i,e)})}:function(e){return u(i,k(e,t))}):r]},[null,null]),i=t[0],t=t[1];return i?this.where(i.name).equals(o[i.keyPath]).filter(t):e?this.filter(t):this.where(n).equals("")},Kt.prototype.filter=function(e){return this.toCollection().and(e)},Kt.prototype.count=function(e){return this.toCollection().count(e)},Kt.prototype.offset=function(e){return this.toCollection().offset(e)},Kt.prototype.limit=function(e){return this.toCollection().limit(e)},Kt.prototype.each=function(e){return this.toCollection().each(e)},Kt.prototype.toArray=function(e){return this.toCollection().toArray(e)},Kt.prototype.toCollection=function(){return new this.db.Collection(new this.db.WhereClause(this))},Kt.prototype.orderBy=function(e){return new this.db.Collection(new this.db.WhereClause(this,b(e)?"["+e.join("+")+"]":e))},Kt.prototype.reverse=function(){return this.toCollection().reverse()},Kt.prototype.mapToClass=function(r){this.schema.mappedClass=r;function e(e){if(!e)return e;var t,n=Object.create(r.prototype);for(t in e)if(m(e,t))try{n[t]=e[t]}catch(e){}return n}return this.schema.readHook&&this.hook.reading.unsubscribe(this.schema.readHook),this.schema.readHook=e,this.hook("reading",e),r},Kt.prototype.defineClass=function(){return this.mapToClass(function(e){u(this,e)})},Kt.prototype.add=function(t,n){var r=this,e=this.schema.primKey,i=e.auto,o=e.keyPath,a=t;return o&&i&&(a=Et(o)(t)),this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"add",keys:null!=n?[n]:null,values:[a]})}).then(function(e){return e.numFailures?je.reject(e.failures[0]):e.lastResult}).then(function(e){if(o)try{E(t,o,e)}catch(e){}return e})},Kt.prototype.update=function(t,n){if("object"!=typeof t||b(t))return this.where(":id").equals(t).modify(n);var e=k(t,this.schema.primKey.keyPath);if(void 0===e)return lt(new J.InvalidArgument("Given object does not contain its primary key"));try{"function"!=typeof n?x(n).forEach(function(e){E(t,e,n[e])}):n(t,{value:t,primKey:e})}catch(e){}return this.where(":id").equals(e).modify(n)},Kt.prototype.put=function(t,n){var r=this,e=this.schema.primKey,i=e.auto,o=e.keyPath,a=t;return o&&i&&(a=Et(o)(t)),this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"put",values:[a],keys:null!=n?[n]:null})}).then(function(e){return e.numFailures?je.reject(e.failures[0]):e.lastResult}).then(function(e){if(o)try{E(t,o,e)}catch(e){}return e})},Kt.prototype.delete=function(t){var n=this;return this._trans("readwrite",function(e){return n.core.mutate({trans:e,type:"delete",keys:[t]})}).then(function(e){return e.numFailures?je.reject(e.failures[0]):void 0})},Kt.prototype.clear=function(){var t=this;return this._trans("readwrite",function(e){return t.core.mutate({trans:e,type:"deleteRange",range:kt})}).then(function(e){return e.numFailures?je.reject(e.failures[0]):void 0})},Kt.prototype.bulkGet=function(t){var n=this;return this._trans("readonly",function(e){return n.core.getMany({keys:t,trans:e}).then(function(e){return e.map(function(e){return n.hook.reading.fire(e)})})})},Kt.prototype.bulkAdd=function(r,e,t){var o=this,a=Array.isArray(e)?e:void 0,u=(t=t||(a?void 0:e))?t.allKeys:void 0;return this._trans("readwrite",function(e){var t=o.schema.primKey,n=t.auto,t=t.keyPath;if(t&&a)throw new J.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");if(a&&a.length!==r.length)throw new J.InvalidArgument("Arguments objects and keys must have the same length");var i=r.length,t=t&&n?r.map(Et(t)):r;return o.core.mutate({trans:e,type:"add",keys:a,values:t,wantResults:u}).then(function(e){var t=e.numFailures,n=e.results,r=e.lastResult,e=e.failures;if(0===t)return u?n:r;throw new H(o.name+".bulkAdd(): "+t+" of "+i+" operations failed",e)})})},Kt.prototype.bulkPut=function(r,e,t){var o=this,a=Array.isArray(e)?e:void 0,u=(t=t||(a?void 0:e))?t.allKeys:void 0;return this._trans("readwrite",function(e){var t=o.schema.primKey,n=t.auto,t=t.keyPath;if(t&&a)throw new J.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");if(a&&a.length!==r.length)throw new J.InvalidArgument("Arguments objects and keys must have the same length");var i=r.length,t=t&&n?r.map(Et(t)):r;return o.core.mutate({trans:e,type:"put",keys:a,values:t,wantResults:u}).then(function(e){var t=e.numFailures,n=e.results,r=e.lastResult,e=e.failures;if(0===t)return u?n:r;throw new H(o.name+".bulkPut(): "+t+" of "+i+" operations failed",e)})})},Kt.prototype.bulkDelete=function(t){var r=this,i=t.length;return this._trans("readwrite",function(e){return r.core.mutate({trans:e,type:"delete",keys:t})}).then(function(e){var t=e.numFailures,n=e.lastResult,e=e.failures;if(0===t)return n;throw new H(r.name+".bulkDelete(): "+t+" of "+i+" operations failed",e)})},Kt);function Kt(){}function Ot(i){function t(e,t){if(t){for(var n=arguments.length,r=new Array(n-1);--n;)r[n-1]=arguments[n];return a[e].subscribe.apply(null,r),i}if("string"==typeof e)return a[e]}var a={};t.addEventType=u;for(var e=1,n=arguments.length;e<n;++e)u(arguments[e]);return t;function u(e,n,r){if("object"!=typeof e){var i;n=n||ae;var o={subscribers:[],fire:r=r||Z,subscribe:function(e){-1===o.subscribers.indexOf(e)&&(o.subscribers.push(e),o.fire=n(o.fire,e))},unsubscribe:function(t){o.subscribers=o.subscribers.filter(function(e){return e!==t}),o.fire=o.subscribers.reduce(n,r)}};return a[e]=t[e]=o}x(i=e).forEach(function(e){var t=i[e];if(b(t))u(e,i[e][0],i[e][1]);else{if("asap"!==t)throw new J.InvalidArgument("Invalid event config");var n=u(e,ee,function(){for(var e=arguments.length,t=new Array(e);e--;)t[e]=arguments[e];n.subscribers.forEach(function(e){_(function(){e.apply(null,t)})})})}})}}function St(e,t){return o(t).from({prototype:e}),t}function At(e,t){return!(e.filter||e.algorithm||e.or)&&(t?e.justLimit:!e.replayFilter)}function Ct(e,t){e.filter=xt(e.filter,t)}function jt(e,t,n){var r=e.replayFilter;e.replayFilter=r?function(){return xt(r(),t())}:t,e.justLimit=n&&!r}function Dt(e,t){if(e.isPrimKey)return t.primaryKey;var n=t.getIndexByKeyPath(e.index);if(!n)throw new J.Schema("KeyPath "+e.index+" on object store "+t.name+" is not indexed");return n}function It(e,t,n){var r=Dt(e,t.schema);return t.openCursor({trans:n,values:!e.keysOnly,reverse:"prev"===e.dir,unique:!!e.unique,query:{index:r,range:e.range}})}function Bt(e,o,t,n){var a=e.replayFilter?xt(e.filter,e.replayFilter()):e.filter;if(e.or){var u={},r=function(e,t,n){var r,i;a&&!a(t,n,function(e){return t.stop(e)},function(e){return t.fail(e)})||("[object ArrayBuffer]"===(i=""+(r=t.primaryKey))&&(i=""+new Uint8Array(r)),m(u,i)||(u[i]=!0,o(e,t,n)))};return Promise.all([e.or._iterate(r,t),Tt(It(e,n,t),e.algorithm,r,!e.keysOnly&&e.valueMapper)])}return Tt(It(e,n,t),xt(e.algorithm,a),o,!e.keysOnly&&e.valueMapper)}function Tt(e,r,i,o){var a=We(o?function(e,t,n){return i(o(e),t,n)}:i);return e.then(function(n){if(n)return n.start(function(){var t=function(){return n.continue()};r&&!r(n,function(e){return t=e},function(e){n.stop(e),t=Z},function(e){n.fail(e),t=Z})||a(n.value,n,function(e){return t=e}),t()})})}function Rt(e,t){try{var n=Ft(e),r=Ft(t);if(n!==r)return"Array"===n?1:"Array"===r?-1:"binary"===n?1:"binary"===r?-1:"string"===n?1:"string"===r?-1:"Date"===n?1:"Date"!==r?NaN:-1;switch(n){case"number":case"Date":case"string":return t<e?1:e<t?-1:0;case"binary":return function(e,t){for(var n=e.length,r=t.length,i=n<r?n:r,o=0;o<i;++o)if(e[o]!==t[o])return e[o]<t[o]?-1:1;return n===r?0:n<r?-1:1}(Mt(e),Mt(t));case"Array":return function(e,t){for(var n=e.length,r=t.length,i=n<r?n:r,o=0;o<i;++o){var a=Rt(e[o],t[o]);if(0!==a)return a}return n===r?0:n<r?-1:1}(e,t)}}catch(e){}return NaN}function Ft(e){var t=typeof e;if("object"!=t)return t;if(ArrayBuffer.isView(e))return"binary";e=j(e);return"ArrayBuffer"===e?"binary":e}function Mt(e){return e instanceof Uint8Array?e:ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e)}var Nt=(qt.prototype._read=function(e,t){var n=this._ctx;return n.error?n.table._trans(null,lt.bind(null,n.error)):n.table._trans("readonly",e).then(t)},qt.prototype._write=function(e){var t=this._ctx;return t.error?t.table._trans(null,lt.bind(null,t.error)):t.table._trans("readwrite",e,"locked")},qt.prototype._addAlgorithm=function(e){var t=this._ctx;t.algorithm=xt(t.algorithm,e)},qt.prototype._iterate=function(e,t){return Bt(this._ctx,e,t,this._ctx.table.core)},qt.prototype.clone=function(e){var t=Object.create(this.constructor.prototype),n=Object.create(this._ctx);return e&&u(n,e),t._ctx=n,t},qt.prototype.raw=function(){return this._ctx.valueMapper=null,this},qt.prototype.each=function(t){var n=this._ctx;return this._read(function(e){return Bt(n,t,e,n.table.core)})},qt.prototype.count=function(e){var i=this;return this._read(function(e){var t=i._ctx,n=t.table.core;if(At(t,!0))return n.count({trans:e,query:{index:Dt(t,n.schema),range:t.range}}).then(function(e){return Math.min(e,t.limit)});var r=0;return Bt(t,function(){return++r,!1},e,n).then(function(){return r})}).then(e)},qt.prototype.sortBy=function(e,t){var n=e.split(".").reverse(),r=n[0],i=n.length-1;function o(e,t){return t?o(e[n[t]],t-1):e[r]}var a="next"===this._ctx.dir?1:-1;function u(e,t){e=o(e,i),t=o(t,i);return e<t?-a:t<e?a:0}return this.toArray(function(e){return e.sort(u)}).then(t)},qt.prototype.toArray=function(e){var o=this;return this._read(function(e){var t=o._ctx;if("next"===t.dir&&At(t,!0)&&0<t.limit){var n=t.valueMapper,r=Dt(t,t.table.core.schema);return t.table.core.query({trans:e,limit:t.limit,values:!0,query:{index:r,range:t.range}}).then(function(e){e=e.result;return n?e.map(n):e})}var i=[];return Bt(t,function(e){return i.push(e)},e,t.table.core).then(function(){return i})},e)},qt.prototype.offset=function(t){var e=this._ctx;return t<=0||(e.offset+=t,At(e)?jt(e,function(){var n=t;return function(e,t){return 0===n||(1===n?--n:t(function(){e.advance(n),n=0}),!1)}}):jt(e,function(){var e=t;return function(){return--e<0}})),this},qt.prototype.limit=function(e){return this._ctx.limit=Math.min(this._ctx.limit,e),jt(this._ctx,function(){var r=e;return function(e,t,n){return--r<=0&&t(n),0<=r}},!0),this},qt.prototype.until=function(r,i){return Ct(this._ctx,function(e,t,n){return!r(e.value)||(t(n),i)}),this},qt.prototype.first=function(e){return this.limit(1).toArray(function(e){return e[0]}).then(e)},qt.prototype.last=function(e){return this.reverse().first(e)},qt.prototype.filter=function(t){var e;return Ct(this._ctx,function(e){return t(e.value)}),(e=this._ctx).isMatch=xt(e.isMatch,t),this},qt.prototype.and=function(e){return this.filter(e)},qt.prototype.or=function(e){return new this.db.WhereClause(this._ctx.table,e,this)},qt.prototype.reverse=function(){return this._ctx.dir="prev"===this._ctx.dir?"next":"prev",this._ondirectionchange&&this._ondirectionchange(this._ctx.dir),this},qt.prototype.desc=function(){return this.reverse()},qt.prototype.eachKey=function(n){var e=this._ctx;return e.keysOnly=!e.isMatch,this.each(function(e,t){n(t.key,t)})},qt.prototype.eachUniqueKey=function(e){return this._ctx.unique="unique",this.eachKey(e)},qt.prototype.eachPrimaryKey=function(n){var e=this._ctx;return e.keysOnly=!e.isMatch,this.each(function(e,t){n(t.primaryKey,t)})},qt.prototype.keys=function(e){var t=this._ctx;t.keysOnly=!t.isMatch;var n=[];return this.each(function(e,t){n.push(t.key)}).then(function(){return n}).then(e)},qt.prototype.primaryKeys=function(e){var n=this._ctx;if("next"===n.dir&&At(n,!0)&&0<n.limit)return this._read(function(e){var t=Dt(n,n.table.core.schema);return n.table.core.query({trans:e,values:!1,limit:n.limit,query:{index:t,range:n.range}})}).then(function(e){return e.result}).then(e);n.keysOnly=!n.isMatch;var r=[];return this.each(function(e,t){r.push(t.primaryKey)}).then(function(){return r}).then(e)},qt.prototype.uniqueKeys=function(e){return this._ctx.unique="unique",this.keys(e)},qt.prototype.firstKey=function(e){return this.limit(1).keys(function(e){return e[0]}).then(e)},qt.prototype.lastKey=function(e){return this.reverse().firstKey(e)},qt.prototype.distinct=function(){var e=this._ctx,e=e.index&&e.table.schema.idxByName[e.index];if(!e||!e.multi)return this;var n={};return Ct(this._ctx,function(e){var t=e.primaryKey.toString(),e=m(n,t);return n[t]=!0,!e}),this},qt.prototype.modify=function(_){var n=this,w=this._ctx;return this._write(function(d){var o,a,p;p="function"==typeof _?_:(o=x(_),a=o.length,function(e){for(var t=!1,n=0;n<a;++n){var r=o[n],i=_[r];k(e,r)!==i&&(E(e,r,i),t=!0)}return t});function y(e,t){var n=t.failures,t=t.numFailures;s+=e-t;for(var r=0,i=x(n);r<i.length;r++){var o=i[r];u.push(n[o])}}var v=w.table.core,e=v.schema.primaryKey,m=e.outbound,g=e.extractKey,b=n.db._options.modifyChunkSize||200,u=[],s=0,t=[];return n.clone().primaryKeys().then(function(f){function h(c){var l=Math.min(b,f.length-c);return v.getMany({trans:d,keys:f.slice(c,c+l),cache:"immutable"}).then(function(e){for(var n=[],t=[],r=m?[]:null,i=[],o=0;o<l;++o){var a=e[o],u={value:A(a),primKey:f[c+o]};!1!==p.call(u,u.value,u)&&(null==u.value?i.push(f[c+o]):m||0===Rt(g(a),g(u.value))?(t.push(u.value),m&&r.push(f[c+o])):(i.push(f[c+o]),n.push(u.value)))}var s=At(w)&&w.limit===1/0&&("function"!=typeof _||_===Ut)&&{index:w.index,range:w.range};return Promise.resolve(0<n.length&&v.mutate({trans:d,type:"add",values:n}).then(function(e){for(var t in e.failures)i.splice(parseInt(t),1);y(n.length,e)})).then(function(){return(0<t.length||s&&"object"==typeof _)&&v.mutate({trans:d,type:"put",keys:r,values:t,criteria:s,changeSpec:"function"!=typeof _&&_}).then(function(e){return y(t.length,e)})}).then(function(){return(0<i.length||s&&_===Ut)&&v.mutate({trans:d,type:"delete",keys:i,criteria:s}).then(function(e){return y(i.length,e)})}).then(function(){return f.length>c+l&&h(c+b)})})}return h(0).then(function(){if(0<u.length)throw new G("Error modifying one or more objects",u,s,t);return f.length})})})},qt.prototype.delete=function(){var i=this._ctx,n=i.range;return At(i)&&(i.isPrimKey&&!gt||3===n.type)?this._write(function(e){var t=i.table.core.schema.primaryKey,r=n;return i.table.core.count({trans:e,query:{index:t,range:r}}).then(function(n){return i.table.core.mutate({trans:e,type:"deleteRange",range:r}).then(function(e){var t=e.failures;e.lastResult,e.results;e=e.numFailures;if(e)throw new G("Could not delete some values",Object.keys(t).map(function(e){return t[e]}),n-e);return n-e})})}):this.modify(Ut)},qt);function qt(){}var Ut=function(e,t){return t.value=null};function Lt(e,t){return e<t?-1:e===t?0:1}function Vt(e,t){return t<e?-1:e===t?0:1}function Wt(e,t,n){e=e instanceof Qt?new e.Collection(e):e;return e._ctx.error=new(n||TypeError)(t),e}function zt(e){return new e.Collection(e,function(){return Ht("")}).limit(0)}function Yt(e,s,n,r){var i,c,l,f,h,d,p,y=n.length;if(!n.every(function(e){return"string"==typeof e}))return Wt(e,pt);function t(e){i="next"===e?function(e){return e.toUpperCase()}:function(e){return e.toLowerCase()},c="next"===e?function(e){return e.toLowerCase()}:function(e){return e.toUpperCase()},l="next"===e?Lt:Vt;var t=n.map(function(e){return{lower:c(e),upper:i(e)}}).sort(function(e,t){return l(e.lower,t.lower)});f=t.map(function(e){return e.upper}),h=t.map(function(e){return e.lower}),p="next"===(d=e)?"":r}t("next");e=new e.Collection(e,function(){return Gt(f[0],h[y-1]+r)});e._ondirectionchange=function(e){t(e)};var v=0;return e._addAlgorithm(function(e,t,n){var r=e.key;if("string"!=typeof r)return!1;var i=c(r);if(s(i,h,v))return!0;for(var o=null,a=v;a<y;++a){var u=function(e,t,n,r,i,o){for(var a=Math.min(e.length,r.length),u=-1,s=0;s<a;++s){var c=t[s];if(c!==r[s])return i(e[s],n[s])<0?e.substr(0,s)+n[s]+n.substr(s+1):i(e[s],r[s])<0?e.substr(0,s)+r[s]+n.substr(s+1):0<=u?e.substr(0,u)+t[u]+n.substr(u+1):null;i(e[s],c)<0&&(u=s)}return a<r.length&&"next"===o?e+n.substr(e.length):a<e.length&&"prev"===o?e.substr(0,n.length):u<0?null:e.substr(0,u)+r[u]+n.substr(u+1)}(r,i,f[a],h[a],l,d);null===u&&null===o?v=a+1:(null===o||0<l(o,u))&&(o=u)}return t(null!==o?function(){e.continue(o+p)}:n),!1}),e}function Gt(e,t,n,r){return{type:2,lower:e,upper:t,lowerOpen:n,upperOpen:r}}function Ht(e){return{type:1,lower:e,upper:e}}var Qt=(Object.defineProperty(Xt.prototype,"Collection",{get:function(){return this._ctx.table.db.Collection},enumerable:!1,configurable:!0}),Xt.prototype.between=function(e,t,n,r){n=!1!==n,r=!0===r;try{return 0<this._cmp(e,t)||0===this._cmp(e,t)&&(n||r)&&(!n||!r)?zt(this):new this.Collection(this,function(){return Gt(e,t,!n,!r)})}catch(e){return Wt(this,dt)}},Xt.prototype.equals=function(e){return null==e?Wt(this,dt):new this.Collection(this,function(){return Ht(e)})},Xt.prototype.above=function(e){return null==e?Wt(this,dt):new this.Collection(this,function(){return Gt(e,void 0,!0)})},Xt.prototype.aboveOrEqual=function(e){return null==e?Wt(this,dt):new this.Collection(this,function(){return Gt(e,void 0,!1)})},Xt.prototype.below=function(e){return null==e?Wt(this,dt):new this.Collection(this,function(){return Gt(void 0,e,!1,!0)})},Xt.prototype.belowOrEqual=function(e){return null==e?Wt(this,dt):new this.Collection(this,function(){return Gt(void 0,e)})},Xt.prototype.startsWith=function(e){return"string"!=typeof e?Wt(this,pt):this.between(e,e+ht,!0,!0)},Xt.prototype.startsWithIgnoreCase=function(e){return""===e?this.startsWith(e):Yt(this,function(e,t){return 0===e.indexOf(t[0])},[e],ht)},Xt.prototype.equalsIgnoreCase=function(e){return Yt(this,function(e,t){return e===t[0]},[e],"")},Xt.prototype.anyOfIgnoreCase=function(){var e=T.apply(B,arguments);return 0===e.length?zt(this):Yt(this,function(e,t){return-1!==t.indexOf(e)},e,"")},Xt.prototype.startsWithAnyOfIgnoreCase=function(){var e=T.apply(B,arguments);return 0===e.length?zt(this):Yt(this,function(t,e){return e.some(function(e){return 0===t.indexOf(e)})},e,ht)},Xt.prototype.anyOf=function(){var t=this,i=T.apply(B,arguments),o=this._cmp;try{i.sort(o)}catch(e){return Wt(this,dt)}if(0===i.length)return zt(this);var e=new this.Collection(this,function(){return Gt(i[0],i[i.length-1])});e._ondirectionchange=function(e){o="next"===e?t._ascending:t._descending,i.sort(o)};var a=0;return e._addAlgorithm(function(e,t,n){for(var r=e.key;0<o(r,i[a]);)if(++a===i.length)return t(n),!1;return 0===o(r,i[a])||(t(function(){e.continue(i[a])}),!1)}),e},Xt.prototype.notEqual=function(e){return this.inAnyRange([[-1/0,e],[e,this.db._maxKey]],{includeLowers:!1,includeUppers:!1})},Xt.prototype.noneOf=function(){var e=T.apply(B,arguments);if(0===e.length)return new this.Collection(this);try{e.sort(this._ascending)}catch(e){return Wt(this,dt)}var t=e.reduce(function(e,t){return e?e.concat([[e[e.length-1][1],t]]):[[-1/0,t]]},null);return t.push([e[e.length-1],this.db._maxKey]),this.inAnyRange(t,{includeLowers:!1,includeUppers:!1})},Xt.prototype.inAnyRange=function(e,t){var o=this,a=this._cmp,u=this._ascending,n=this._descending,s=this._min,c=this._max;if(0===e.length)return zt(this);if(!e.every(function(e){return void 0!==e[0]&&void 0!==e[1]&&u(e[0],e[1])<=0}))return Wt(this,"First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower",J.InvalidArgument);var r=!t||!1!==t.includeLowers,i=t&&!0===t.includeUppers;var l,f=u;function h(e,t){return f(e[0],t[0])}try{(l=e.reduce(function(e,t){for(var n=0,r=e.length;n<r;++n){var i=e[n];if(a(t[0],i[1])<0&&0<a(t[1],i[0])){i[0]=s(i[0],t[0]),i[1]=c(i[1],t[1]);break}}return n===r&&e.push(t),e},[])).sort(h)}catch(e){return Wt(this,dt)}var d=0,p=i?function(e){return 0<u(e,l[d][1])}:function(e){return 0<=u(e,l[d][1])},y=r?function(e){return 0<n(e,l[d][0])}:function(e){return 0<=n(e,l[d][0])};var v=p,e=new this.Collection(this,function(){return Gt(l[0][0],l[l.length-1][1],!r,!i)});return e._ondirectionchange=function(e){f="next"===e?(v=p,u):(v=y,n),l.sort(h)},e._addAlgorithm(function(e,t,n){for(var r,i=e.key;v(i);)if(++d===l.length)return t(n),!1;return!p(r=i)&&!y(r)||(0===o._cmp(i,l[d][1])||0===o._cmp(i,l[d][0])||t(function(){f===u?e.continue(l[d][0]):e.continue(l[d][1])}),!1)}),e},Xt.prototype.startsWithAnyOf=function(){var e=T.apply(B,arguments);return e.every(function(e){return"string"==typeof e})?0===e.length?zt(this):this.inAnyRange(e.map(function(e){return[e,e+ht]})):Wt(this,"startsWithAnyOf() only works with strings")},Xt);function Xt(){}function Jt(t){return We(function(e){return $t(e),t(e.target.error),!1})}function $t(e){e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault()}var Zt="storagemutated",en="x-storagemutated-1",tn=Ot(null,Zt),nn=(rn.prototype._lock=function(){return v(!Oe.global),++this._reculock,1!==this._reculock||Oe.global||(Oe.lockOwnerFor=this),this},rn.prototype._unlock=function(){if(v(!Oe.global),0==--this._reculock)for(Oe.global||(Oe.lockOwnerFor=null);0<this._blockedFuncs.length&&!this._locked();){var e=this._blockedFuncs.shift();try{it(e[1],e[0])}catch(e){}}return this},rn.prototype._locked=function(){return this._reculock&&Oe.lockOwnerFor!==this},rn.prototype.create=function(t){var n=this;if(!this.mode)return this;var e=this.db.idbdb,r=this.db._state.dbOpenError;if(v(!this.idbtrans),!t&&!e)switch(r&&r.name){case"DatabaseClosedError":throw new J.DatabaseClosed(r);case"MissingAPIError":throw new J.MissingAPI(r.message,r);default:throw new J.OpenFailed(r)}if(!this.active)throw new J.TransactionInactive;return v(null===this._completion._state),(t=this.idbtrans=t||(this.db.core||e).transaction(this.storeNames,this.mode,{durability:this.chromeTransactionDurability})).onerror=We(function(e){$t(e),n._reject(t.error)}),t.onabort=We(function(e){$t(e),n.active&&n._reject(new J.Abort(t.error)),n.active=!1,n.on("abort").fire(e)}),t.oncomplete=We(function(){n.active=!1,n._resolve(),"mutatedParts"in t&&tn.storagemutated.fire(t.mutatedParts)}),this},rn.prototype._promise=function(n,r,i){var o=this;if("readwrite"===n&&"readwrite"!==this.mode)return lt(new J.ReadOnly("Transaction is readonly"));if(!this.active)return lt(new J.TransactionInactive);if(this._locked())return new je(function(e,t){o._blockedFuncs.push([function(){o._promise(n,r,i).then(e,t)},Oe])});if(i)return Je(function(){var e=new je(function(e,t){o._lock();var n=r(e,t,o);n&&n.then&&n.then(e,t)});return e.finally(function(){return o._unlock()}),e._lib=!0,e});var e=new je(function(e,t){var n=r(e,t,o);n&&n.then&&n.then(e,t)});return e._lib=!0,e},rn.prototype._root=function(){return this.parent?this.parent._root():this},rn.prototype.waitFor=function(e){var t,r=this._root(),i=je.resolve(e);r._waitingFor?r._waitingFor=r._waitingFor.then(function(){return i}):(r._waitingFor=i,r._waitingQueue=[],t=r.idbtrans.objectStore(r.storeNames[0]),function e(){for(++r._spinCount;r._waitingQueue.length;)r._waitingQueue.shift()();r._waitingFor&&(t.get(-1/0).onsuccess=e)}());var o=r._waitingFor;return new je(function(t,n){i.then(function(e){return r._waitingQueue.push(We(t.bind(null,e)))},function(e){return r._waitingQueue.push(We(n.bind(null,e)))}).finally(function(){r._waitingFor===o&&(r._waitingFor=null)})})},rn.prototype.abort=function(){this.active&&(this.active=!1,this.idbtrans&&this.idbtrans.abort(),this._reject(new J.Abort))},rn.prototype.table=function(e){var t=this._memoizedTables||(this._memoizedTables={});if(m(t,e))return t[e];var n=this.schema[e];if(!n)throw new J.NotFound("Table "+e+" not part of transaction");n=new this.db.Table(e,n,this);return n.core=this.db.core.table(e),t[e]=n},rn);function rn(){}function on(e,t,n,r,i,o,a){return{name:e,keyPath:t,unique:n,multi:r,auto:i,compound:o,src:(n&&!a?"&":"")+(r?"*":"")+(i?"++":"")+an(t)}}function an(e){return"string"==typeof e?e:e?"["+[].join.call(e,"+")+"]":""}function un(e,t,n){return{name:e,primKey:t,indexes:n,mappedClass:null,idxByName:w(n,function(e){return[e.name,e]})}}var sn=function(e){try{return e.only([[]]),sn=function(){return[[]]},[[]]}catch(e){return sn=function(){return ht},ht}};function cn(t){return null==t?function(){}:"string"==typeof t?1===(n=t).split(".").length?function(e){return e[n]}:function(e){return k(e,n)}:function(e){return k(e,t)};var n}function ln(e){return[].slice.call(e)}var fn=0;function hn(e){return null==e?":id":"string"==typeof e?e:"["+e.join("+")+"]"}function dn(e,i,t){function w(e){if(3===e.type)return null;if(4===e.type)throw new Error("Cannot convert never type to IDBKeyRange");var t=e.lower,n=e.upper,r=e.lowerOpen,e=e.upperOpen;return void 0===t?void 0===n?null:i.upperBound(n,!!e):void 0===n?i.lowerBound(t,!!r):i.bound(t,n,!!r,!!e)}function n(e){var h,_=e.name;return{name:_,schema:e,mutate:function(e){var y=e.trans,v=e.type,m=e.keys,g=e.values,b=e.range;return new Promise(function(t,e){t=We(t);var n=y.objectStore(_),r=null==n.keyPath,i="put"===v||"add"===v;if(!i&&"delete"!==v&&"deleteRange"!==v)throw new Error("Invalid operation type: "+v);var o,a=(m||g||{length:1}).length;if(m&&g&&m.length!==g.length)throw new Error("Given keys array must have same length as given values array.");if(0===a)return t({numFailures:0,failures:{},results:[],lastResult:void 0});function u(e){++l,$t(e)}var s=[],c=[],l=0;if("deleteRange"===v){if(4===b.type)return t({numFailures:l,failures:c,results:[],lastResult:void 0});3===b.type?s.push(o=n.clear()):s.push(o=n.delete(w(b)))}else{var r=i?r?[g,m]:[g,null]:[m,null],f=r[0],h=r[1];if(i)for(var d=0;d<a;++d)s.push(o=h&&void 0!==h[d]?n[v](f[d],h[d]):n[v](f[d])),o.onerror=u;else for(d=0;d<a;++d)s.push(o=n[v](f[d])),o.onerror=u}function p(e){e=e.target.result,s.forEach(function(e,t){return null!=e.error&&(c[t]=e.error)}),t({numFailures:l,failures:c,results:"delete"===v?m:s.map(function(e){return e.result}),lastResult:e})}o.onerror=function(e){u(e),p(e)},o.onsuccess=p})},getMany:function(e){var f=e.trans,h=e.keys;return new Promise(function(t,e){t=We(t);for(var n,r=f.objectStore(_),i=h.length,o=new Array(i),a=0,u=0,s=function(e){e=e.target;o[e._pos]=e.result,++u===a&&t(o)},c=Jt(e),l=0;l<i;++l)null!=h[l]&&((n=r.get(h[l]))._pos=l,n.onsuccess=s,n.onerror=c,++a);0===a&&t(o)})},get:function(e){var r=e.trans,i=e.key;return new Promise(function(t,e){t=We(t);var n=r.objectStore(_).get(i);n.onsuccess=function(e){return t(e.target.result)},n.onerror=Jt(e)})},query:(h=s,function(f){return new Promise(function(n,e){n=We(n);var r,i,o,t=f.trans,a=f.values,u=f.limit,s=f.query,c=u===1/0?void 0:u,l=s.index,s=s.range,t=t.objectStore(_),l=l.isPrimaryKey?t:t.index(l.name),s=w(s);if(0===u)return n({result:[]});h?((c=a?l.getAll(s,c):l.getAllKeys(s,c)).onsuccess=function(e){return n({result:e.target.result})},c.onerror=Jt(e)):(r=0,i=!a&&"openKeyCursor"in l?l.openKeyCursor(s):l.openCursor(s),o=[],i.onsuccess=function(e){var t=i.result;return t?(o.push(a?t.value:t.primaryKey),++r===u?n({result:o}):void t.continue()):n({result:o})},i.onerror=Jt(e))})}),openCursor:function(e){var c=e.trans,o=e.values,a=e.query,u=e.reverse,l=e.unique;return new Promise(function(t,n){t=We(t);var e=a.index,r=a.range,i=c.objectStore(_),i=e.isPrimaryKey?i:i.index(e.name),e=u?l?"prevunique":"prev":l?"nextunique":"next",s=!o&&"openKeyCursor"in i?i.openKeyCursor(w(r),e):i.openCursor(w(r),e);s.onerror=Jt(n),s.onsuccess=We(function(e){var r,i,o,a,u=s.result;u?(u.___id=++fn,u.done=!1,r=u.continue.bind(u),i=(i=u.continuePrimaryKey)&&i.bind(u),o=u.advance.bind(u),a=function(){throw new Error("Cursor not stopped")},u.trans=c,u.stop=u.continue=u.continuePrimaryKey=u.advance=function(){throw new Error("Cursor not started")},u.fail=We(n),u.next=function(){var e=this,t=1;return this.start(function(){return t--?e.continue():e.stop()}).then(function(){return e})},u.start=function(e){function t(){if(s.result)try{e()}catch(e){u.fail(e)}else u.done=!0,u.start=function(){throw new Error("Cursor behind last entry")},u.stop()}var n=new Promise(function(t,e){t=We(t),s.onerror=Jt(e),u.fail=e,u.stop=function(e){u.stop=u.continue=u.continuePrimaryKey=u.advance=a,t(e)}});return s.onsuccess=We(function(e){s.onsuccess=t,t()}),u.continue=r,u.continuePrimaryKey=i,u.advance=o,t(),n},t(u)):t(null)},n)})},count:function(e){var t=e.query,i=e.trans,o=t.index,a=t.range;return new Promise(function(t,e){var n=i.objectStore(_),r=o.isPrimaryKey?n:n.index(o.name),n=w(a),r=n?r.count(n):r.count();r.onsuccess=We(function(e){return t(e.target.result)}),r.onerror=Jt(e)})}}}var r,o,a,u=(o=t,a=ln((r=e).objectStoreNames),{schema:{name:r.name,tables:a.map(function(e){return o.objectStore(e)}).map(function(t){var e=t.keyPath,n=t.autoIncrement,r=b(e),i={},n={name:t.name,primaryKey:{name:null,isPrimaryKey:!0,outbound:null==e,compound:r,keyPath:e,autoIncrement:n,unique:!0,extractKey:cn(e)},indexes:ln(t.indexNames).map(function(e){return t.index(e)}).map(function(e){var t=e.name,n=e.unique,r=e.multiEntry,e=e.keyPath,r={name:t,compound:b(e),keyPath:e,unique:n,multiEntry:r,extractKey:cn(e)};return i[hn(e)]=r}),getIndexByKeyPath:function(e){return i[hn(e)]}};return i[":id"]=n.primaryKey,null!=e&&(i[hn(e)]=n.primaryKey),n})},hasGetAll:0<a.length&&"getAll"in o.objectStore(a[0])&&!("undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604)}),t=u.schema,s=u.hasGetAll,u=t.tables.map(n),c={};return u.forEach(function(e){return c[e.name]=e}),{stack:"dbcore",transaction:e.transaction.bind(e),table:function(e){if(!c[e])throw new Error("Table '"+e+"' not found");return c[e]},MIN_KEY:-1/0,MAX_KEY:sn(i),schema:t}}function pn(e,t,n,r){var i=n.IDBKeyRange;return n.indexedDB,{dbcore:(r=dn(t,i,r),e.dbcore.reduce(function(e,t){t=t.create;return g(g({},e),t(e))},r))}}function yn(e,t){var n=e._novip,e=t.db,t=pn(n._middlewares,e,n._deps,t);n.core=t.dbcore,n.tables.forEach(function(e){var t=e.name;n.core.schema.tables.some(function(e){return e.name===t})&&(e.core=n.core.table(t),n[t]instanceof n.Table&&(n[t].core=e.core))})}function vn(e,t,n,i){var o=e._novip;n.forEach(function(n){var r=i[n];t.forEach(function(e){var t=f(e,n);(!t||"value"in t&&void 0===t.value)&&(e===o.Transaction.prototype||e instanceof o.Transaction?c(e,n,{get:function(){return this.table(n)},set:function(e){a(this,n,{value:e,writable:!0,configurable:!0,enumerable:!0})}}):e[n]=new o.Table(n,r))})})}function mn(e,t){var n=e._novip;t.forEach(function(e){for(var t in e)e[t]instanceof n.Table&&delete e[t]})}function gn(e,t){return e._cfg.version-t._cfg.version}function bn(n,r,i,e){var o=n._dbSchema,a=n._createTransaction("readwrite",n._storeNames,o);a.create(i),a._completion.catch(e);var u=a._reject.bind(a),p=Oe.transless||Oe;Je(function(){var e,s,c,l,f,t,h,d;Oe.trans=a,Oe.transless=p,0===r?(x(o).forEach(function(e){wn(i,e,o[e].primKey,o[e].indexes)}),yn(n,i),je.follow(function(){return n.on.populate.fire(a)}).catch(u)):(s=r,c=a,l=i,f=(e=n)._novip,t=[],e=f._versions,h=f._dbSchema=kn(0,f.idbdb,l),d=!1,e.filter(function(e){return e._cfg.version>=s}).forEach(function(u){t.push(function(){var t=h,e=u._cfg.dbschema;En(f,t,l),En(f,e,l),h=f._dbSchema=e;var n=_n(t,e);n.add.forEach(function(e){wn(l,e[0],e[1].primKey,e[1].indexes)}),n.change.forEach(function(e){if(e.recreate)throw new J.Upgrade("Not yet support for changing primary key");var t=l.objectStore(e.name);e.add.forEach(function(e){return xn(t,e)}),e.change.forEach(function(e){t.deleteIndex(e.name),xn(t,e)}),e.del.forEach(function(e){return t.deleteIndex(e)})});var r=u._cfg.contentUpgrade;if(r&&u._cfg.version>s){yn(f,l),c._memoizedTables={},d=!0;var i=P(e);n.del.forEach(function(e){i[e]=t[e]}),mn(f,[f.Transaction.prototype]),vn(f,[f.Transaction.prototype],x(i),i),c.schema=i;var o,a=R(r);a&&$e();n=je.follow(function(){var e;(o=r(c))&&a&&(e=Ze.bind(null,null),o.then(e,e))});return o&&"function"==typeof o.then?je.resolve(o):n.then(function(){return o})}}),t.push(function(e){var t,n,r;d&&mt||(t=u._cfg.dbschema,n=t,r=e,[].slice.call(r.db.objectStoreNames).forEach(function(e){return null==n[e]&&r.db.deleteObjectStore(e)})),mn(f,[f.Transaction.prototype]),vn(f,[f.Transaction.prototype],f._storeNames,f._dbSchema),c.schema=f._dbSchema})}),function e(){return t.length?je.resolve(t.shift()(c.idbtrans)).then(e):je.resolve()}().then(function(){var t,n;n=l,x(t=h).forEach(function(e){n.db.objectStoreNames.contains(e)||wn(n,e,t[e].primKey,t[e].indexes)})}).catch(u))})}function _n(e,t){var n,r={del:[],add:[],change:[]};for(n in e)t[n]||r.del.push(n);for(n in t){var i=e[n],o=t[n];if(i){var a={name:n,def:o,recreate:!1,del:[],add:[],change:[]};if(""+(i.primKey.keyPath||"")!=""+(o.primKey.keyPath||"")||i.primKey.auto!==o.primKey.auto&&!vt)a.recreate=!0,r.change.push(a);else{var u=i.idxByName,s=o.idxByName,c=void 0;for(c in u)s[c]||a.del.push(c);for(c in s){var l=u[c],f=s[c];l?l.src!==f.src&&a.change.push(f):a.add.push(f)}(0<a.del.length||0<a.add.length||0<a.change.length)&&r.change.push(a)}}else r.add.push([n,o])}return r}function wn(e,t,n,r){var i=e.db.createObjectStore(t,n.keyPath?{keyPath:n.keyPath,autoIncrement:n.auto}:{autoIncrement:n.auto});return r.forEach(function(e){return xn(i,e)}),i}function xn(e,t){e.createIndex(t.name,t.keyPath,{unique:t.unique,multiEntry:t.multi})}function kn(e,t,u){var s={};return y(t.objectStoreNames,0).forEach(function(e){for(var t=u.objectStore(e),n=on(an(a=t.keyPath),a||"",!1,!1,!!t.autoIncrement,a&&"string"!=typeof a,!0),r=[],i=0;i<t.indexNames.length;++i){var o=t.index(t.indexNames[i]),a=o.keyPath,o=on(o.name,a,!!o.unique,!!o.multiEntry,!1,a&&"string"!=typeof a,!1);r.push(o)}s[e]=un(e,n,r)}),s}function En(e,t,n){for(var r=e._novip,i=n.db.objectStoreNames,o=0;o<i.length;++o){var a=i[o],u=n.objectStore(a);r._hasGetAll="getAll"in u;for(var s=0;s<u.indexNames.length;++s){var c=u.indexNames[s],l=u.index(c).keyPath,f="string"==typeof l?l:"["+y(l).join("+")+"]";!t[a]||(l=t[a].idxByName[f])&&(l.name=c,delete t[a].idxByName[f],t[a].idxByName[c]=l)}}"undefined"!=typeof navigator&&/Safari/.test(navigator.userAgent)&&!/(Chrome\/|Edge\/)/.test(navigator.userAgent)&&h.WorkerGlobalScope&&h instanceof h.WorkerGlobalScope&&[].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]<604&&(r._hasGetAll=!1)}var Pn=(Kn.prototype._parseStoresSpec=function(r,i){x(r).forEach(function(e){if(null!==r[e]){var t=r[e].split(",").map(function(e,t){var n=(e=e.trim()).replace(/([&*]|\+\+)/g,""),r=/^\[/.test(n)?n.match(/^\[(.*)\]$/)[1].split("+"):n;return on(n,r||null,/\&/.test(e),/\*/.test(e),/\+\+/.test(e),b(r),0===t)}),n=t.shift();if(n.multi)throw new J.Schema("Primary key cannot be multi-valued");t.forEach(function(e){if(e.auto)throw new J.Schema("Only primary key can be marked as autoIncrement (++)");if(!e.keyPath)throw new J.Schema("Index must have a name and cannot be an empty string")}),i[e]=un(e,n,t)}})},Kn.prototype.stores=function(e){var t=this.db;this._cfg.storesSource=this._cfg.storesSource?u(this._cfg.storesSource,e):e;var e=t._versions,n={},r={};return e.forEach(function(e){u(n,e._cfg.storesSource),r=e._cfg.dbschema={},e._parseStoresSpec(n,r)}),t._dbSchema=r,mn(t,[t._allTables,t,t.Transaction.prototype]),vn(t,[t._allTables,t,t.Transaction.prototype,this._cfg.tables],x(r),r),t._storeNames=x(r),this},Kn.prototype.upgrade=function(e){return this._cfg.contentUpgrade=ue(this._cfg.contentUpgrade||Z,e),this},Kn);function Kn(){}function On(e,t){var n=e._dbNamesDB;return n||(n=e._dbNamesDB=new Gn(bt,{addons:[],indexedDB:e,IDBKeyRange:t})).version(1).stores({dbnames:"name"}),n.table("dbnames")}function Sn(e){return e&&"function"==typeof e.databases}function An(e){return Je(function(){return Oe.letThrough=!0,e()})}function Cn(f){var h=f._state,r=f._deps.indexedDB;if(h.isBeingOpened||f.idbdb)return h.dbReadyPromise.then(function(){return h.dbOpenError?lt(h.dbOpenError):f});F&&(h.openCanceller._stackHolder=U()),h.isBeingOpened=!0,h.dbOpenError=null,h.openComplete=!1;var t=h.openCanceller;function e(){if(h.openCanceller!==t)throw new J.DatabaseClosed("db.open() was cancelled")}var n,i=h.dbReadyResolve,d=null,p=!1;return je.race([t,("undefined"==typeof navigator?je.resolve():!navigator.userAgentData&&/Safari\//.test(navigator.userAgent)&&!/Chrom(e|ium)\//.test(navigator.userAgent)&&indexedDB.databases?new Promise(function(e){function t(){return indexedDB.databases().finally(e)}n=setInterval(t,100),t()}).finally(function(){return clearInterval(n)}):Promise.resolve()).then(function(){return new je(function(s,n){if(e(),!r)throw new J.MissingAPI;var c=f.name,l=h.autoSchema?r.open(c):r.open(c,Math.round(10*f.verno));if(!l)throw new J.MissingAPI;l.onerror=Jt(n),l.onblocked=We(f._fireOnBlocked),l.onupgradeneeded=We(function(e){var t;d=l.transaction,h.autoSchema&&!f._options.allowEmptyDB?(l.onerror=$t,d.abort(),l.result.close(),(t=r.deleteDatabase(c)).onsuccess=t.onerror=We(function(){n(new J.NoSuchDatabase("Database "+c+" doesnt exist"))})):(d.onerror=Jt(n),e=e.oldVersion>Math.pow(2,62)?0:e.oldVersion,p=e<1,f._novip.idbdb=l.result,bn(f,e/10,d,n))},n),l.onsuccess=We(function(){d=null;var e,t,n,r,i,o=f._novip.idbdb=l.result,a=y(o.objectStoreNames);if(0<a.length)try{var u=o.transaction(1===(r=a).length?r[0]:r,"readonly");h.autoSchema?(t=o,n=u,(e=(e=f)._novip).verno=t.version/10,n=e._dbSchema=kn(0,t,n),e._storeNames=y(t.objectStoreNames,0),vn(e,[e._allTables],x(n),n)):(En(f,f._dbSchema,u),((i=_n(kn(0,(i=f).idbdb,u),i._dbSchema)).add.length||i.change.some(function(e){return e.add.length||e.change.length}))&&console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.")),yn(f,u)}catch(e){}yt.push(f),o.onversionchange=We(function(e){h.vcFired=!0,f.on("versionchange").fire(e)}),o.onclose=We(function(e){f.on("close").fire(e)}),p&&(i=f._deps,u=c,o=i.indexedDB,i=i.IDBKeyRange,Sn(o)||u===bt||On(o,i).put({name:u}).catch(Z)),s()},n)})})]).then(function(){return e(),h.onReadyBeingFired=[],je.resolve(An(function(){return f.on.ready.fire(f.vip)})).then(function e(){if(0<h.onReadyBeingFired.length){var t=h.onReadyBeingFired.reduce(ue,Z);return h.onReadyBeingFired=[],je.resolve(An(function(){return t(f.vip)})).then(e)}})}).finally(function(){h.onReadyBeingFired=null,h.isBeingOpened=!1}).then(function(){return f}).catch(function(e){h.dbOpenError=e;try{d&&d.abort()}catch(e){}return t===h.openCanceller&&f._close(),lt(e)}).finally(function(){h.openComplete=!0,i()})}function jn(t){function e(e){return t.next(e)}var r=n(e),i=n(function(e){return t.throw(e)});function n(n){return function(e){var t=n(e),e=t.value;return t.done?e:e&&"function"==typeof e.then?e.then(r,i):b(e)?Promise.all(e).then(r,i):r(e)}}return n(e)()}function Dn(e,t,n){for(var r=b(e)?e.slice():[e],i=0;i<n;++i)r.push(t);return r}var In={stack:"dbcore",name:"VirtualIndexMiddleware",level:1,create:function(f){return g(g({},f),{table:function(e){var a=f.table(e),t=a.schema,u={},s=[];function c(e,t,n){var r=hn(e),i=u[r]=u[r]||[],o=null==e?0:"string"==typeof e?1:e.length,r=0<t,r=g(g({},n),{isVirtual:r,keyTail:t,keyLength:o,extractKey:cn(e),unique:!r&&n.unique});return i.push(r),r.isPrimaryKey||s.push(r),1<o&&c(2===o?e[0]:e.slice(0,o-1),t+1,n),i.sort(function(e,t){return e.keyTail-t.keyTail}),r}e=c(t.primaryKey.keyPath,0,t.primaryKey);u[":id"]=[e];for(var n=0,r=t.indexes;n<r.length;n++){var i=r[n];c(i.keyPath,0,i)}function l(e){var t,n=e.query.index;return n.isVirtual?g(g({},e),{query:{index:n,range:(t=e.query.range,n=n.keyTail,{type:1===t.type?2:t.type,lower:Dn(t.lower,t.lowerOpen?f.MAX_KEY:f.MIN_KEY,n),lowerOpen:!0,upper:Dn(t.upper,t.upperOpen?f.MIN_KEY:f.MAX_KEY,n),upperOpen:!0})}}):e}return g(g({},a),{schema:g(g({},t),{primaryKey:e,indexes:s,getIndexByKeyPath:function(e){return(e=u[hn(e)])&&e[0]}}),count:function(e){return a.count(l(e))},query:function(e){return a.query(l(e))},openCursor:function(t){var e=t.query.index,r=e.keyTail,n=e.isVirtual,i=e.keyLength;return n?a.openCursor(l(t)).then(function(e){return e&&o(e)}):a.openCursor(t);function o(n){return Object.create(n,{continue:{value:function(e){null!=e?n.continue(Dn(e,t.reverse?f.MAX_KEY:f.MIN_KEY,r)):t.unique?n.continue(n.key.slice(0,i).concat(t.reverse?f.MIN_KEY:f.MAX_KEY,r)):n.continue()}},continuePrimaryKey:{value:function(e,t){n.continuePrimaryKey(Dn(e,f.MAX_KEY,r),t)}},primaryKey:{get:function(){return n.primaryKey}},key:{get:function(){var e=n.key;return 1===i?e[0]:e.slice(0,i)}},value:{get:function(){return n.value}}})}}})}})}};function Bn(i,o,a,u){return a=a||{},u=u||"",x(i).forEach(function(e){var t,n,r;m(o,e)?(t=i[e],n=o[e],"object"==typeof t&&"object"==typeof n&&t&&n?(r=j(t))!==j(n)?a[u+e]=o[e]:"Object"===r?Bn(t,n,a,u+e+"."):t!==n&&(a[u+e]=o[e]):t!==n&&(a[u+e]=o[e])):a[u+e]=void 0}),x(o).forEach(function(e){m(i,e)||(a[u+e]=o[e])}),a}var Tn={stack:"dbcore",name:"HooksMiddleware",level:2,create:function(e){return g(g({},e),{table:function(r){var y=e.table(r),v=y.schema.primaryKey;return g(g({},y),{mutate:function(e){var t=Oe.trans,n=t.table(r).hook,h=n.deleting,d=n.creating,p=n.updating;switch(e.type){case"add":if(d.fire===Z)break;return t._promise("readwrite",function(){return a(e)},!0);case"put":if(d.fire===Z&&p.fire===Z)break;return t._promise("readwrite",function(){return a(e)},!0);case"delete":if(h.fire===Z)break;return t._promise("readwrite",function(){return a(e)},!0);case"deleteRange":if(h.fire===Z)break;return t._promise("readwrite",function(){return function n(r,i,o){return y.query({trans:r,values:!1,query:{index:v,range:i},limit:o}).then(function(e){var t=e.result;return a({type:"delete",keys:t,trans:r}).then(function(e){return 0<e.numFailures?Promise.reject(e.failures[0]):t.length<o?{failures:[],numFailures:0,lastResult:void 0}:n(r,g(g({},i),{lower:t[t.length-1],lowerOpen:!0}),o)})})}(e.trans,e.range,1e4)},!0)}return y.mutate(e);function a(c){var e,t,n,l=Oe.trans,f=c.keys||(t=v,"delete"===(n=c).type?n.keys:n.keys||n.values.map(t.extractKey));if(!f)throw new Error("Keys missing");return"delete"!==(c="add"===c.type||"put"===c.type?g(g({},c),{keys:f}):g({},c)).type&&(c.values=i([],c.values,!0)),c.keys&&(c.keys=i([],c.keys,!0)),e=y,n=f,("add"===(t=c).type?Promise.resolve([]):e.getMany({trans:t.trans,keys:n,cache:"immutable"})).then(function(u){var s=f.map(function(e,t){var n,r,i,o=u[t],a={onerror:null,onsuccess:null};return"delete"===c.type?h.fire.call(a,e,o,l):"add"===c.type||void 0===o?(n=d.fire.call(a,e,c.values[t],l),null==e&&null!=n&&(c.keys[t]=e=n,v.outbound||E(c.values[t],v.keyPath,e))):(n=Bn(o,c.values[t]),(r=p.fire.call(a,n,e,o,l))&&(i=c.values[t],Object.keys(r).forEach(function(e){m(i,e)?i[e]=r[e]:E(i,e,r[e])}))),a});return y.mutate(c).then(function(e){for(var t=e.failures,n=e.results,r=e.numFailures,e=e.lastResult,i=0;i<f.length;++i){var o=(n||f)[i],a=s[i];null==o?a.onerror&&a.onerror(t[i]):a.onsuccess&&a.onsuccess("put"===c.type&&u[i]?c.values[i]:o)}return{failures:t,results:n,numFailures:r,lastResult:e}}).catch(function(t){return s.forEach(function(e){return e.onerror&&e.onerror(t)}),Promise.reject(t)})})}}})}})}};function Rn(e,t,n){try{if(!t)return null;if(t.keys.length<e.length)return null;for(var r=[],i=0,o=0;i<t.keys.length&&o<e.length;++i)0===Rt(t.keys[i],e[o])&&(r.push(n?A(t.values[i]):t.values[i]),++o);return r.length===e.length?r:null}catch(e){return null}}var Fn={stack:"dbcore",level:-1,create:function(t){return{table:function(e){var n=t.table(e);return g(g({},n),{getMany:function(t){if(!t.cache)return n.getMany(t);var e=Rn(t.keys,t.trans._cache,"clone"===t.cache);return e?je.resolve(e):n.getMany(t).then(function(e){return t.trans._cache={keys:t.keys,values:"clone"===t.cache?A(e):e},e})},mutate:function(e){return"add"!==e.type&&(e.trans._cache=null),n.mutate(e)}})}}}};function Mn(e){return!("from"in e)}var Nn=function(e,t){if(!this){var n=new Nn;return e&&"d"in e&&u(n,e),n}u(this,arguments.length?{d:1,from:e,to:1<arguments.length?t:e}:{d:0})};function qn(e,t,n){var r=Rt(t,n);if(!isNaN(r)){if(0<r)throw RangeError();if(Mn(e))return u(e,{from:t,to:n,d:1});var i=e.l,r=e.r;if(Rt(n,e.from)<0)return i?qn(i,t,n):e.l={from:t,to:n,d:1,l:null,r:null},Wn(e);if(0<Rt(t,e.to))return r?qn(r,t,n):e.r={from:t,to:n,d:1,l:null,r:null},Wn(e);Rt(t,e.from)<0&&(e.from=t,e.l=null,e.d=r?r.d+1:1),0<Rt(n,e.to)&&(e.to=n,e.r=null,e.d=e.l?e.l.d+1:1);n=!e.r;i&&!e.l&&Un(e,i),r&&n&&Un(e,r)}}function Un(e,t){Mn(t)||function e(t,n){var r=n.from,i=n.to,o=n.l,n=n.r;qn(t,r,i),o&&e(t,o),n&&e(t,n)}(e,t)}function Ln(e,t){var n=Vn(t),r=n.next();if(r.done)return!1;for(var i=r.value,o=Vn(e),a=o.next(i.from),u=a.value;!r.done&&!a.done;){if(Rt(u.from,i.to)<=0&&0<=Rt(u.to,i.from))return!0;Rt(i.from,u.from)<0?i=(r=n.next(u.from)).value:u=(a=o.next(i.from)).value}return!1}function Vn(e){var n=Mn(e)?null:{s:0,n:e};return{next:function(e){for(var t=0<arguments.length;n;)switch(n.s){case 0:if(n.s=1,t)for(;n.n.l&&Rt(e,n.n.from)<0;)n={up:n,n:n.n.l,s:1};else for(;n.n.l;)n={up:n,n:n.n.l,s:1};case 1:if(n.s=2,!t||Rt(e,n.n.to)<=0)return{value:n.n,done:!1};case 2:if(n.n.r){n.s=3,n={up:n,n:n.n.r,s:0};continue}case 3:n=n.up}return{done:!0}}}}function Wn(e){var t,n,r=((null===(t=e.r)||void 0===t?void 0:t.d)||0)-((null===(n=e.l)||void 0===n?void 0:n.d)||0),i=1<r?"r":r<-1?"l":"";i&&(t="r"==i?"l":"r",n=g({},e),r=e[i],e.from=r.from,e.to=r.to,e[i]=r[i],n[i]=r[t],(e[t]=n).d=zn(n)),e.d=zn(e)}function zn(e){var t=e.r,e=e.l;return(t?e?Math.max(t.d,e.d):t.d:e?e.d:0)+1}r(Nn.prototype,((e={add:function(e){return Un(this,e),this},addKey:function(e){return qn(this,e,e),this},addKeys:function(e){var t=this;return e.forEach(function(e){return qn(t,e,e)}),this}})[D]=function(){return Vn(this)},e));var Yn={stack:"dbcore",level:0,create:function(r){var v=r.schema.name,m=new Nn(r.MIN_KEY,r.MAX_KEY);return g(g({},r),{table:function(d){function e(e){var e=(t=e.query).index,t=t.range;return[e,new Nn(null!==(e=t.lower)&&void 0!==e?e:r.MIN_KEY,null!==(t=t.upper)&&void 0!==t?t:r.MAX_KEY)]}var p=r.table(d),y=p.schema,t=y.primaryKey,c=t.extractKey,l=t.outbound,n=g(g({},p),{mutate:function(e){function n(e){return r[e="idb://"+v+"/"+d+"/"+e]||(r[e]=new Nn)}var t=e.trans,r=t.mutatedParts||(t.mutatedParts={}),i=n(""),s=n(":dels"),c=e.type,t="deleteRange"===e.type?[e.range]:"delete"===e.type?[e.keys]:e.values.length<50?[[],e.values]:[],l=t[0],f=t[1],h=e.trans._cache;return p.mutate(e).then(function(e){var t,o,a,u;return b(l)?("delete"!==c&&(l=e.results),i.addKeys(l),(t=Rn(l,h))||"add"===c||s.addKeys(l),(t||f)&&(o=n,a=t,u=f,y.indexes.forEach(function(t){var n=o(t.name||"");function r(e){return null!=e?t.extractKey(e):null}function i(e){return t.multiEntry&&b(e)?e.forEach(function(e){return n.addKey(e)}):n.addKey(e)}(a||u).forEach(function(e,t){var n=a&&r(a[t]),t=u&&r(u[t]);0!==Rt(n,t)&&(null!=n&&i(n),null!=t&&i(t))})}))):l?(t={from:l.lower,to:l.upper},s.add(t),i.add(t)):(i.add(m),s.add(m),y.indexes.forEach(function(e){return n(e.name).add(m)})),e})}}),f={get:function(e){return[t,new Nn(e.key)]},getMany:function(e){return[t,(new Nn).addKeys(e.keys)]},count:e,query:e,openCursor:e};return x(f).forEach(function(s){n[s]=function(i){var t=Oe.subscr;if(t){var e=function(e){e="idb://"+v+"/"+d+"/"+e;return t[e]||(t[e]=new Nn)},o=e(""),a=e(":dels"),n=f[s](i),r=n[0],n=n[1];if(e(r.name||"").add(n),!r.isPrimaryKey){if("count"!==s){var u="query"===s&&l&&i.values&&p.query(g(g({},i),{values:!1}));return p[s].apply(this,arguments).then(function(t){if("query"===s){if(l&&i.values)return u.then(function(e){e=e.result;return o.addKeys(e),t});var e=i.values?t.result.map(c):t.result;(i.values?o:a).addKeys(e)}else if("openCursor"===s){var n=t,r=i.values;return n&&Object.create(n,{key:{get:function(){return a.addKey(n.primaryKey),n.key}},primaryKey:{get:function(){var e=n.primaryKey;return a.addKey(e),e}},value:{get:function(){return r&&o.addKey(n.primaryKey),n.value}}})}return t})}a.add(m)}}return p[s].apply(this,arguments)}}),n}})}};var Gn=(Hn.prototype.version=function(t){if(isNaN(t)||t<.1)throw new J.Type("Given version is not a positive number");if(t=Math.round(10*t)/10,this.idbdb||this._state.isBeingOpened)throw new J.Schema("Cannot add version when database is open");this.verno=Math.max(this.verno,t);var e=this._versions,n=e.filter(function(e){return e._cfg.version===t})[0];return n||(n=new this.Version(t),e.push(n),e.sort(gn),n.stores({}),this._state.autoSchema=!1,n)},Hn.prototype._whenReady=function(e){var n=this;return this.idbdb&&(this._state.openComplete||Oe.letThrough||this._vip)?e():new je(function(e,t){if(n._state.openComplete)return t(new J.DatabaseClosed(n._state.dbOpenError));if(!n._state.isBeingOpened){if(!n._options.autoOpen)return void t(new J.DatabaseClosed);n.open().catch(Z)}n._state.dbReadyPromise.then(e,t)}).then(e)},Hn.prototype.use=function(e){var t=e.stack,n=e.create,r=e.level,i=e.name;i&&this.unuse({stack:t,name:i});e=this._middlewares[t]||(this._middlewares[t]=[]);return e.push({stack:t,create:n,level:null==r?10:r,name:i}),e.sort(function(e,t){return e.level-t.level}),this},Hn.prototype.unuse=function(e){var t=e.stack,n=e.name,r=e.create;return t&&this._middlewares[t]&&(this._middlewares[t]=this._middlewares[t].filter(function(e){return r?e.create!==r:!!n&&e.name!==n})),this},Hn.prototype.open=function(){return Cn(this)},Hn.prototype._close=function(){var n=this._state,e=yt.indexOf(this);if(0<=e&&yt.splice(e,1),this.idbdb){try{this.idbdb.close()}catch(e){}this._novip.idbdb=null}n.dbReadyPromise=new je(function(e){n.dbReadyResolve=e}),n.openCanceller=new je(function(e,t){n.cancelOpen=t})},Hn.prototype.close=function(){this._close();var e=this._state;this._options.autoOpen=!1,e.dbOpenError=new J.DatabaseClosed,e.isBeingOpened&&e.cancelOpen(e.dbOpenError)},Hn.prototype.delete=function(){var i=this,n=0<arguments.length,o=this._state;return new je(function(r,t){function e(){i.close();var e=i._deps.indexedDB.deleteDatabase(i.name);e.onsuccess=We(function(){var e,t,n;e=i._deps,t=i.name,n=e.indexedDB,e=e.IDBKeyRange,Sn(n)||t===bt||On(n,e).delete(t).catch(Z),r()}),e.onerror=Jt(t),e.onblocked=i._fireOnBlocked}if(n)throw new J.InvalidArgument("Arguments not allowed in db.delete()");o.isBeingOpened?o.dbReadyPromise.then(e):e()})},Hn.prototype.backendDB=function(){return this.idbdb},Hn.prototype.isOpen=function(){return null!==this.idbdb},Hn.prototype.hasBeenClosed=function(){var e=this._state.dbOpenError;return e&&"DatabaseClosed"===e.name},Hn.prototype.hasFailed=function(){return null!==this._state.dbOpenError},Hn.prototype.dynamicallyOpened=function(){return this._state.autoSchema},Object.defineProperty(Hn.prototype,"tables",{get:function(){var t=this;return x(this._allTables).map(function(e){return t._allTables[e]})},enumerable:!1,configurable:!0}),Hn.prototype.transaction=function(){var e=function(e,t,n){var r=arguments.length;if(r<2)throw new J.InvalidArgument("Too few arguments");for(var i=new Array(r-1);--r;)i[r-1]=arguments[r];return n=i.pop(),[e,K(i),n]}.apply(this,arguments);return this._transaction.apply(this,e)},Hn.prototype._transaction=function(e,t,n){var r=this,i=Oe.trans;i&&i.db===this&&-1===e.indexOf("!")||(i=null);var o,a,u=-1!==e.indexOf("?");e=e.replace("!","").replace("?","");try{if(a=t.map(function(e){e=e instanceof r.Table?e.name:e;if("string"!=typeof e)throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");return e}),"r"==e||e===_t)o=_t;else{if("rw"!=e&&e!=wt)throw new J.InvalidArgument("Invalid transaction mode: "+e);o=wt}if(i){if(i.mode===_t&&o===wt){if(!u)throw new J.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");i=null}i&&a.forEach(function(e){if(i&&-1===i.storeNames.indexOf(e)){if(!u)throw new J.SubTransaction("Table "+e+" not included in parent transaction.");i=null}}),u&&i&&!i.active&&(i=null)}}catch(n){return i?i._promise(null,function(e,t){t(n)}):lt(n)}var s=function i(o,a,u,s,c){return je.resolve().then(function(){var e=Oe.transless||Oe,t=o._createTransaction(a,u,o._dbSchema,s),e={trans:t,transless:e};if(s)t.idbtrans=s.idbtrans;else try{t.create(),o._state.PR1398_maxLoop=3}catch(e){return e.name===Q.InvalidState&&o.isOpen()&&0<--o._state.PR1398_maxLoop?(console.warn("Dexie: Need to reopen db"),o._close(),o.open().then(function(){return i(o,a,u,null,c)})):lt(e)}var n,r=R(c);return r&&$e(),e=je.follow(function(){var e;(n=c.call(t,t))&&(r?(e=Ze.bind(null,null),n.then(e,e)):"function"==typeof n.next&&"function"==typeof n.throw&&(n=jn(n)))},e),(n&&"function"==typeof n.then?je.resolve(n).then(function(e){return t.active?e:lt(new J.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"))}):e.then(function(){return n})).then(function(e){return s&&t._resolve(),t._completion.then(function(){return e})}).catch(function(e){return t._reject(e),lt(e)})})}.bind(null,this,o,a,i,n);return i?i._promise(o,s,"lock"):Oe.trans?it(Oe.transless,function(){return r._whenReady(s)}):this._whenReady(s)},Hn.prototype.table=function(e){if(!m(this._allTables,e))throw new J.InvalidTable("Table "+e+" does not exist");return this._allTables[e]},Hn);function Hn(e,t){var o=this;this._middlewares={},this.verno=0;var n=Hn.dependencies;this._options=t=g({addons:Hn.addons,autoOpen:!0,indexedDB:n.indexedDB,IDBKeyRange:n.IDBKeyRange},t),this._deps={indexedDB:t.indexedDB,IDBKeyRange:t.IDBKeyRange};n=t.addons;this._dbSchema={},this._versions=[],this._storeNames=[],this._allTables={},this.idbdb=null,this._novip=this;var a,r,u,i,s,c={dbOpenError:null,isBeingOpened:!1,onReadyBeingFired:null,openComplete:!1,dbReadyResolve:Z,dbReadyPromise:null,cancelOpen:Z,openCanceller:null,autoSchema:!0,PR1398_maxLoop:3};c.dbReadyPromise=new je(function(e){c.dbReadyResolve=e}),c.openCanceller=new je(function(e,t){c.cancelOpen=t}),this._state=c,this.name=e,this.on=Ot(this,"populate","blocked","versionchange","close",{ready:[ue,Z]}),this.on.ready.subscribe=p(this.on.ready.subscribe,function(i){return function(n,r){Hn.vip(function(){var t,e=o._state;e.openComplete?(e.dbOpenError||je.resolve().then(n),r&&i(n)):e.onReadyBeingFired?(e.onReadyBeingFired.push(n),r&&i(n)):(i(n),t=o,r||i(function e(){t.on.ready.unsubscribe(n),t.on.ready.unsubscribe(e)}))})}}),this.Collection=(a=this,St(Nt.prototype,function(e,t){this.db=a;var n=kt,r=null;if(t)try{n=t()}catch(e){r=e}var i=e._ctx,t=i.table,e=t.hook.reading.fire;this._ctx={table:t,index:i.index,isPrimKey:!i.index||t.schema.primKey.keyPath&&i.index===t.schema.primKey.name,range:n,keysOnly:!1,dir:"next",unique:"",algorithm:null,filter:null,replayFilter:null,justLimit:!0,isMatch:null,offset:0,limit:1/0,error:r,or:i.or,valueMapper:e!==ee?e:null}})),this.Table=(r=this,St(Pt.prototype,function(e,t,n){this.db=r,this._tx=n,this.name=e,this.schema=t,this.hook=r._allTables[e]?r._allTables[e].hook:Ot(null,{creating:[re,Z],reading:[te,ee],updating:[oe,Z],deleting:[ie,Z]})})),this.Transaction=(u=this,St(nn.prototype,function(e,t,n,r,i){var o=this;this.db=u,this.mode=e,this.storeNames=t,this.schema=n,this.chromeTransactionDurability=r,this.idbtrans=null,this.on=Ot(this,"complete","error","abort"),this.parent=i||null,this.active=!0,this._reculock=0,this._blockedFuncs=[],this._resolve=null,this._reject=null,this._waitingFor=null,this._waitingQueue=null,this._spinCount=0,this._completion=new je(function(e,t){o._resolve=e,o._reject=t}),this._completion.then(function(){o.active=!1,o.on.complete.fire()},function(e){var t=o.active;return o.active=!1,o.on.error.fire(e),o.parent?o.parent._reject(e):t&&o.idbtrans&&o.idbtrans.abort(),lt(e)})})),this.Version=(i=this,St(Pn.prototype,function(e){this.db=i,this._cfg={version:e,storesSource:null,dbschema:{},tables:{},contentUpgrade:null}})),this.WhereClause=(s=this,St(Qt.prototype,function(e,t,n){this.db=s,this._ctx={table:e,index:":id"===t?null:t,or:n};var r=s._deps.indexedDB;if(!r)throw new J.MissingAPI;this._cmp=this._ascending=r.cmp.bind(r),this._descending=function(e,t){return r.cmp(t,e)},this._max=function(e,t){return 0<r.cmp(e,t)?e:t},this._min=function(e,t){return r.cmp(e,t)<0?e:t},this._IDBKeyRange=s._deps.IDBKeyRange})),this.on("versionchange",function(e){0<e.newVersion?console.warn("Another connection wants to upgrade database '"+o.name+"'. Closing db now to resume the upgrade."):console.warn("Another connection wants to delete database '"+o.name+"'. Closing db now to resume the delete request."),o.close()}),this.on("blocked",function(e){!e.newVersion||e.newVersion<e.oldVersion?console.warn("Dexie.delete('"+o.name+"') was blocked"):console.warn("Upgrade '"+o.name+"' blocked by other connection holding version "+e.oldVersion/10)}),this._maxKey=sn(t.IDBKeyRange),this._createTransaction=function(e,t,n,r){return new o.Transaction(e,t,n,o._options.chromeTransactionDurability,r)},this._fireOnBlocked=function(t){o.on("blocked").fire(t),yt.filter(function(e){return e.name===o.name&&e!==o&&!e._state.vcFired}).map(function(e){return e.on("versionchange").fire(t)})},this.use(In),this.use(Tn),this.use(Yn),this.use(Fn),this.vip=Object.create(this,{_vip:{value:!0}}),n.forEach(function(e){return e(o)})}var e="undefined"!=typeof Symbol&&"observable"in Symbol?Symbol.observable:"@@observable",Qn=(Xn.prototype.subscribe=function(e,t,n){return this._subscribe(e&&"function"!=typeof e?e:{next:e,error:t,complete:n})},Xn.prototype[e]=function(){return this},Xn);function Xn(e){this._subscribe=e}function Jn(t,n){return x(n).forEach(function(e){Un(t[e]||(t[e]=new Nn),n[e])}),t}function $n(d){var p=!1,y=void 0,e=new Qn(function(n){var r=R(d);var i=!1,o={},a={},u={get closed(){return i},unsubscribe:function(){i=!0,tn.storagemutated.unsubscribe(f)}};n.start&&n.start(u);var s=!1,c=!1;function l(){return x(a).some(function(e){return o[e]&&Ln(o[e],a[e])})}var f=function(e){Jn(o,e),l()&&h()},h=function(){var t,e;s||i||(o={},e=function(e){r&&$e();var t=function(){return Je(d,{subscr:e,trans:null})},t=Oe.trans?it(Oe.transless,t):t();return r&&t.then(Ze,Ze),t}(t={}),c||(tn(Zt,f),c=!0),s=!0,Promise.resolve(e).then(function(e){y=e,s=!(p=!0),i||(l()?h():(o={},a=t,n.next&&n.next(e)))},function(e){p=s=!1,n.error&&n.error(e),u.unsubscribe()}))};return h(),u});return e.hasValue=function(){return p},e.getValue=function(){return y},e}try{nr={indexedDB:h.indexedDB||h.mozIndexedDB||h.webkitIndexedDB||h.msIndexedDB,IDBKeyRange:h.IDBKeyRange||h.webkitIDBKeyRange}}catch(e){nr={indexedDB:null,IDBKeyRange:null}}var Zn=Gn;function er(e){var t=rr;try{rr=!0,tn.storagemutated.fire(e)}finally{rr=t}}r(Zn,g(g({},V),{delete:function(e){return new Zn(e,{addons:[]}).delete()},exists:function(e){return new Zn(e,{addons:[]}).open().then(function(e){return e.close(),!0}).catch("NoSuchDatabaseError",function(){return!1})},getDatabaseNames:function(e){try{return t=Zn.dependencies,n=t.indexedDB,t=t.IDBKeyRange,(Sn(n)?Promise.resolve(n.databases()).then(function(e){return e.map(function(e){return e.name}).filter(function(e){return e!==bt})}):On(n,t).toCollection().primaryKeys()).then(e)}catch(e){return lt(new J.MissingAPI)}var t,n},defineClass:function(){return function(e){u(this,e)}},ignoreTransaction:function(e){return Oe.trans?it(Oe.transless,e):e()},vip:An,async:function(t){return function(){try{var e=jn(t.apply(this,arguments));return e&&"function"==typeof e.then?e:je.resolve(e)}catch(e){return lt(e)}}},spawn:function(e,t,n){try{var r=jn(e.apply(n,t||[]));return r&&"function"==typeof r.then?r:je.resolve(r)}catch(e){return lt(e)}},currentTransaction:{get:function(){return Oe.trans||null}},waitFor:function(e,t){t=je.resolve("function"==typeof e?Zn.ignoreTransaction(e):e).timeout(t||6e4);return Oe.trans?Oe.trans.waitFor(t):t},Promise:je,debug:{get:function(){return F},set:function(e){M(e,"dexie"===e?function(){return!0}:ft)}},derive:o,extend:u,props:r,override:p,Events:Ot,on:tn,liveQuery:$n,extendObservabilitySet:Jn,getByKeyPath:k,setByKeyPath:E,delByKeyPath:function(t,e){"string"==typeof e?E(t,e,void 0):"length"in e&&[].map.call(e,function(e){E(t,e,void 0)})},shallowClone:P,deepClone:A,getObjectDiff:Bn,cmp:Rt,asap:_,minKey:-1/0,addons:[],connections:yt,errnames:Q,dependencies:nr,semVer:"3.2.4",version:"3.2.4".split(".").map(function(e){return parseInt(e)}).reduce(function(e,t,n){return e+t/Math.pow(10,2*n)})})),Zn.maxKey=sn(Zn.dependencies.IDBKeyRange),"undefined"!=typeof dispatchEvent&&"undefined"!=typeof addEventListener&&(tn(Zt,function(e){var t;rr||(vt?(t=document.createEvent("CustomEvent")).initCustomEvent(en,!0,!0,e):t=new CustomEvent(en,{detail:e}),rr=!0,dispatchEvent(t),rr=!1)}),addEventListener(en,function(e){e=e.detail;rr||er(e)}));var tr,nr,rr=!1;return"undefined"!=typeof BroadcastChannel?("function"==typeof(tr=new BroadcastChannel(en)).unref&&tr.unref(),tn(Zt,function(e){rr||tr.postMessage(e)}),tr.onmessage=function(e){e.data&&er(e.data)}):"undefined"!=typeof self&&"undefined"!=typeof navigator&&(tn(Zt,function(t){try{rr||("undefined"!=typeof localStorage&&localStorage.setItem(en,JSON.stringify({trig:Math.random(),changedParts:t})),"object"==typeof self.clients&&i([],self.clients.matchAll({includeUncontrolled:!0}),!0).forEach(function(e){return e.postMessage({type:en,changedParts:t})}))}catch(e){}}),"undefined"!=typeof addEventListener&&addEventListener("storage",function(e){e.key!==en||(e=JSON.parse(e.newValue))&&er(e.changedParts)}),(nr=self.document&&navigator.serviceWorker)&&nr.addEventListener("message",function(e){e=e.data;e&&e.type===en&&er(e.changedParts)})),je.rejectionMapper=function(e,t){return!e||e instanceof z||e instanceof TypeError||e instanceof SyntaxError||!e.name||!$[e.name]?e:(t=new $[e.name](t||e.message,e),"stack"in e&&c(t,"stack",{get:function(){return this.inner.stack}}),t)},M(F,ft),g(Gn,Object.freeze({__proto__:null,Dexie:Gn,liveQuery:$n,default:Gn,RangeSet:Nn,mergeRanges:Un,rangesOverlap:Ln}),{default:Gn}),Gn});
//# sourceMappingURL=dexie.min.js.map
</file>

<file path="evdata.js">
/* ============================================================
   WattTrack veri dosyası (v5)
   COUNTRIES: Avrupa (RU/UA hariç, TR dahil) + ABD + Kanada
   CHARGERS: ülke bazlı şarj operatörleri
   BANKS_BY: ülke bazlı bankalar / ödeme yöntemleri
   EV_DB: yıl / donanım / batarya bazlı EV listesi
   Not: teknik değerler üretici WLTP/EPA verilerinden derlenmiş
   yaklaşık değerlerdir; sürüm notlarında kaynak tarihi belirtilir.
   ============================================================ */

// [kod, bayrak, ad, para kodu, para sembolü, birim, varsayılan dil]
const COUNTRIES = [
  ['TR','🇹🇷','Türkiye','TRY','₺','km','tr'],
  ['DE','🇩🇪','Deutschland','EUR','€','km','de'],
  ['FR','🇫🇷','France','EUR','€','km','fr'],
  ['GB','🇬🇧','United Kingdom','GBP','£','mi','en'],
  ['US','🇺🇸','United States','USD','$','mi','en'],
  ['CA','🇨🇦','Canada','CAD','$','km','en'],
  ['ES','🇪🇸','España','EUR','€','km','es'],
  ['IT','🇮🇹','Italia','EUR','€','km','it'],
  ['NL','🇳🇱','Nederland','EUR','€','km','en'],
  ['BE','🇧🇪','België / Belgique','EUR','€','km','fr'],
  ['AT','🇦🇹','Österreich','EUR','€','km','de'],
  ['CH','🇨🇭','Schweiz / Suisse','CHF','CHF','km','de'],
  ['PT','🇵🇹','Portugal','EUR','€','km','en'],
  ['IE','🇮🇪','Ireland','EUR','€','km','en'],
  ['NO','🇳🇴','Norge','NOK','kr','km','en'],
  ['SE','🇸🇪','Sverige','SEK','kr','km','en'],
  ['DK','🇩🇰','Danmark','DKK','kr','km','en'],
  ['FI','🇫🇮','Suomi','EUR','€','km','en'],
  ['IS','🇮🇸','Ísland','ISK','kr','km','en'],
  ['PL','🇵🇱','Polska','PLN','zł','km','en'],
  ['CZ','🇨🇿','Česko','CZK','Kč','km','en'],
  ['SK','🇸🇰','Slovensko','EUR','€','km','en'],
  ['HU','🇭🇺','Magyarország','HUF','Ft','km','en'],
  ['RO','🇷🇴','România','RON','lei','km','en'],
  ['BG','🇧🇬','България','BGN','лв','km','en'],
  ['GR','🇬🇷','Ελλάδα','EUR','€','km','en'],
  ['HR','🇭🇷','Hrvatska','EUR','€','km','en'],
  ['SI','🇸🇮','Slovenija','EUR','€','km','en'],
  ['RS','🇷🇸','Srbija','RSD','дин','km','en'],
  ['BA','🇧🇦','Bosna i Hercegovina','BAM','KM','km','en'],
  ['ME','🇲🇪','Crna Gora','EUR','€','km','en'],
  ['MK','🇲🇰','Северна Македонија','MKD','ден','km','en'],
  ['AL','🇦🇱','Shqipëri','ALL','L','km','en'],
  ['XK','🇽🇰','Kosovë','EUR','€','km','en'],
  ['MD','🇲🇩','Moldova','MDL','L','km','en'],
  ['EE','🇪🇪','Eesti','EUR','€','km','en'],
  ['LV','🇱🇻','Latvija','EUR','€','km','en'],
  ['LT','🇱🇹','Lietuva','EUR','€','km','en'],
  ['LU','🇱🇺','Luxembourg','EUR','€','km','fr'],
  ['MT','🇲🇹','Malta','EUR','€','km','en'],
  ['CY','🇨🇾','Κύπρος','EUR','€','km','en'],
  ['LI','🇱🇮','Liechtenstein','CHF','CHF','km','de'],
  ['MC','🇲🇨','Monaco','EUR','€','km','fr'],
  ['AD','🇦🇩','Andorra','EUR','€','km','es'],
  ['SM','🇸🇲','San Marino','EUR','€','km','it'],
];

const CURRENCY_SYMBOLS = {
  TRY:'₺', EUR:'€', USD:'$', CAD:'$', GBP:'£', CHF:'CHF', NOK:'kr', SEK:'kr',
  DKK:'kr', ISK:'kr', PLN:'zł', CZK:'Kč', HUF:'Ft', RON:'lei', BGN:'лв',
  RSD:'дин', BAM:'KM', MKD:'ден', ALL:'L', MDL:'L'
};

// ---------- ülke bazlı şarj operatörleri (yaygınlık sırasıyla) ----------
const PAN_EU = ['Ionity','Tesla Supercharger','Fastned','Allego','Shell Recharge','TotalEnergies','EVBox'];
const CHARGERS = {
  TR: ['Trugo','Eşarj','ZES','Tesla Supercharger','Voltrun','Beefull','Astor Şarj','Otowatt','Aksa Şarj','e-POint','Opet Ultra Hızlı','Sharz.net','D-Charge','On.Enerji','Vale','Borusan Otomotiv Şarj'],
  DE: ['EnBW mobility+','Ionity','Tesla Supercharger','EWE Go','Aral pulse','Shell Recharge','E.ON Drive','Allego','Fastned','Mer'],
  FR: ['Ionity','Tesla Supercharger','Electra','TotalEnergies','Engie Vianeo','Allego','Fastned','Izivia','Freshmile'],
  GB: ['Tesla Supercharger','InstaVolt','Gridserve','bp pulse','Ionity','Osprey','Pod Point','Shell Recharge','Fastned','ChargePlace Scotland'],
  US: ['Tesla Supercharger','Electrify America','EVgo','ChargePoint','Blink','Shell Recharge','Rivian Adventure Network'],
  CA: ['Tesla Supercharger','Circuit électrique','FLO','Petro-Canada','ChargePoint','Electrify Canada','Ivy'],
  ES: ['Iberdrola','Tesla Supercharger','Endesa X','Ionity','Zunder','Repsol','Wenea','Powerdot'],
  IT: ['Enel X Way','Tesla Supercharger','Be Charge','Ionity','Free To X','A2A','Ewiva'],
  NL: ['Fastned','Tesla Supercharger','Vattenfall InCharge','Shell Recharge','Allego','Ionity','TotalEnergies'],
  BE: ['TotalEnergies','Fastned','Tesla Supercharger','Allego','Ionity','Shell Recharge','Sparki'],
  AT: ['SMATRICS','Ionity','Tesla Supercharger','EnBW mobility+','Wien Energie','da emobil'],
  CH: ['GOFAST','evpass','Tesla Supercharger','Ionity','MOVE','Swisscharge'],
  PT: ['Mobi.E','EDP','Galp','Ionity','Tesla Supercharger','Powerdot'],
  IE: ['ESB ecars','Ionity','Tesla Supercharger','EasyGo','Applegreen Electric'],
  NO: ['Tesla Supercharger','Circle K Lade','Mer','Eviny','Recharge','Ionity','Kople'],
  SE: ['Tesla Supercharger','Recharge','Ionity','Circle K','OKQ8','Vattenfall InCharge','Mer'],
  DK: ['Clever','E.ON Drive','Tesla Supercharger','Ionity','Spirii','OK'],
  FI: ['Recharge','K-Lataus','Helen','Ionity','Tesla Supercharger','Virta'],
  PL: ['Orlen Charge','GreenWay','Tesla Supercharger','Ionity','PGE eMobility','Elocity'],
  CZ: ['ČEZ','PRE','E.ON Drive','Tesla Supercharger','Ionity','MOL Plugee'],
  GR: ['ΔΕΗ blue','Protergia','NRG','Tesla Supercharger','Chargespot'],
  RO: ['Renovatio e-charge','Enel X Way','MOL Plugee','Tesla Supercharger','Eldrive'],
  HU: ['MOL Plugee','Mobiliti','E.ON Drive','Tesla Supercharger','Ionity'],
};
const CHARGERS_DEFAULT = PAN_EU;

// ---------- ülke bazlı banka / ödeme (yaygın olanlar) ----------
const BANKS_BY = {
  TR: ['Garanti BBVA','İş Bankası','Akbank','Yapı Kredi','Ziraat','QNB','DenizBank','Enpara','VakıfBank','Halkbank','Kuveyt Türk','Papara'],
  DE: ['Sparkasse','Deutsche Bank','Commerzbank','ING','DKB','N26','Volksbank','Postbank'],
  FR: ['BNP Paribas','Crédit Agricole','Société Générale','Banque Populaire','Crédit Mutuel','La Banque Postale','Boursorama'],
  GB: ['Barclays','HSBC','Lloyds','NatWest','Santander UK','Monzo','Revolut','Halifax'],
  US: ['Chase','Bank of America','Wells Fargo','Citi','Capital One','Amex','Discover','US Bank'],
  CA: ['RBC','TD','Scotiabank','BMO','CIBC','Desjardins','Tangerine'],
  ES: ['CaixaBank','Santander','BBVA','Sabadell','Bankinter','ING España'],
  IT: ['Intesa Sanpaolo','UniCredit','Banco BPM','BPER','Poste Italiane','Fineco'],
  NL: ['ING','Rabobank','ABN AMRO','SNS','bunq','Revolut'],
  BE: ['KBC','Belfius','BNP Paribas Fortis','ING België','Argenta'],
  AT: ['Erste Bank','Raiffeisen','Bank Austria','BAWAG','N26'],
  CH: ['UBS','Raiffeisen','PostFinance','ZKB','Credit Suisse'],
  NO: ['DNB','Nordea','SpareBank 1','Danske Bank','Sbanken'],
  SE: ['Swedbank','SEB','Handelsbanken','Nordea','ICA Banken'],
  DK: ['Danske Bank','Nordea','Jyske Bank','Nykredit','Lunar'],
  PL: ['PKO BP','Pekao','mBank','ING Polska','Santander PL','Millennium'],
  CZ: ['Česká spořitelna','ČSOB','Komerční banka','Moneta','Air Bank'],
  PT: ['Caixa Geral','Millennium BCP','Santander Totta','Novo Banco'],
  GR: ['Piraeus','Alpha Bank','Eurobank','NBG'],
};
const BANKS_DEFAULT = ['Visa','Mastercard','Amex','Revolut','N26','Wise'];

/* ============================================================
   EV veritabanı
   [marka, model, donanım, yılBaş, yılSon(0=devam), batarya kWh (brüt),
    mimari V, maks DC kW, AC kW, WLTP menzil km, kasa]
   kasa: hatch | sedan | suv | pickup | van
   ============================================================ */
const EV_DB = [
  // --- Togg ---
  ['Togg','T10X','V1 Standart Menzil',2023,0,52.4,400,150,11,314,'suv'],
  ['Togg','T10X','V2 Uzun Menzil',2023,0,88.5,400,180,11,523,'suv'],
  ['Togg','T10F','V2 Uzun Menzil',2025,0,88.5,400,180,11,610,'sedan'],
  // --- Tesla (2025 yenilenmiş seri: Standard / Premium / Performance) ---
  ['Tesla','Model Y','RWD 60 kWh (LFP)',2021,2025,60,400,170,11,455,'suv'],
  ['Tesla','Model Y','Long Range AWD',2021,2025,78.1,400,250,11,533,'suv'],
  ['Tesla','Model Y','Standard RWD',2025,0,69,400,225,11,500,'suv'],
  ['Tesla','Model Y','Premium RWD',2025,0,84,400,250,11,622,'suv'],
  ['Tesla','Model Y','Premium AWD',2025,0,84,400,250,11,586,'suv'],
  ['Tesla','Model Y','Performance',2025,0,84,400,250,11,580,'suv'],
  ['Tesla','Model 3','RWD (LFP)',2024,0,60,400,170,11,513,'sedan'],
  ['Tesla','Model 3','Long Range RWD',2024,0,78.1,400,250,11,702,'sedan'],
  ['Tesla','Model 3','Long Range AWD',2024,0,78.1,400,250,11,678,'sedan'],
  ['Tesla','Model 3','Performance',2024,0,78.1,400,250,11,528,'sedan'],
  ['Tesla','Model S','Dual Motor',2021,0,100,400,250,11,634,'sedan'],
  ['Tesla','Model X','Dual Motor',2021,0,100,400,250,11,576,'suv'],
  ['Tesla','Cybertruck','AWD',2023,0,123,800,250,11,545,'pickup'],
  // --- KGM (SsangYong) ---
  ['KGM','Torres EVX','73.4 kWh (LFP)',2023,2025,73.4,400,120,11,462,'suv'],
  ['KGM','Torres EVX','80.6 kWh (LFP, MY26)',2025,0,80.6,400,120,11,505,'suv'],
  ['KGM','Korando e-Motion','61.5 kWh',2021,0,61.5,400,80,11,339,'suv'],
  ['KGM','Musso EV','80.6 kWh (LFP)',2025,0,80.6,400,120,11,420,'pickup'],
  // --- BYD ---
  ['BYD','Atto 3','60.5 kWh',2022,0,60.5,400,88,11,420,'suv'],
  ['BYD','Dolphin','Active 45',2023,0,44.9,400,65,11,340,'hatch'],
  ['BYD','Dolphin','Comfort 60',2023,0,60.5,400,88,11,427,'hatch'],
  ['BYD','Dolphin Surf','43.2 kWh',2025,0,43.2,400,85,11,322,'hatch'],
  ['BYD','Seal','Design RWD',2023,0,82.5,800,150,11,570,'sedan'],
  ['BYD','Seal','Excellence AWD',2023,0,82.5,800,150,11,520,'sedan'],
  ['BYD','Seal U','Comfort 71.8',2024,0,71.8,400,115,11,420,'suv'],
  ['BYD','Sealion 7','Comfort RWD',2024,0,82.5,800,150,11,482,'suv'],
  ['BYD','Han','Executive AWD',2022,0,85.4,400,120,11,521,'sedan'],
  // --- Volkswagen Grubu ---
  ['Volkswagen','ID.3','Pro 58',2020,0,62,400,120,11,426,'hatch'],
  ['Volkswagen','ID.3','Pro S 77',2021,0,82,400,170,11,546,'hatch'],
  ['Volkswagen','ID.4','Pro 77',2021,0,82,400,135,11,522,'suv'],
  ['Volkswagen','ID.4','Pro (APP550)',2023,0,82,400,175,11,550,'suv'],
  ['Volkswagen','ID.5','Pro',2022,0,82,400,175,11,556,'suv'],
  ['Volkswagen','ID.7','Pro 77',2023,0,82,400,175,11,621,'sedan'],
  ['Volkswagen','ID.7','Pro S 86',2024,0,91,400,200,11,709,'sedan'],
  ['Volkswagen','ID.Buzz','Pro 77',2022,0,82,400,170,11,423,'van'],
  ['Volkswagen','ID.Buzz','Pro 86 (LWB)',2024,0,91,400,200,11,487,'van'],
  ['Škoda','Enyaq','60',2021,0,62,400,120,11,412,'suv'],
  ['Škoda','Enyaq','85',2021,0,82,400,175,11,567,'suv'],
  ['Škoda','Elroq','50',2024,0,55,400,145,11,375,'suv'],
  ['Škoda','Elroq','85',2024,0,82,400,175,11,580,'suv'],
  ['Cupra','Born','58 kWh',2021,0,62,400,120,11,424,'hatch'],
  ['Cupra','Born','77 kWh',2022,0,82,400,170,11,548,'hatch'],
  ['Cupra','Tavascan','VZ 77',2024,0,82,400,135,11,522,'suv'],
  ['Audi','Q4 e-tron','45',2021,0,82,400,175,11,533,'suv'],
  ['Audi','Q4 e-tron','55 quattro',2021,0,82,400,175,11,519,'suv'],
  ['Audi','Q6 e-tron','quattro 100',2024,0,100,800,270,11,625,'suv'],
  ['Audi','A6 e-tron','performance 100',2024,0,100,800,270,11,756,'sedan'],
  ['Audi','Q8 e-tron','55 quattro',2023,0,114,400,170,11,582,'suv'],
  ['Audi','e-tron GT','quattro',2021,0,105,800,320,11,622,'sedan'],
  ['Porsche','Taycan','4S (2024)',2024,0,105,800,320,11,590,'sedan'],
  ['Porsche','Macan Electric','4',2024,0,100,800,270,11,613,'suv'],
  // --- BMW / Mini ---
  ['BMW','i4','eDrive40',2021,0,83.9,400,205,11,590,'sedan'],
  ['BMW','i4','M50 xDrive',2021,0,83.9,400,205,11,521,'sedan'],
  ['BMW','iX1','xDrive30',2022,0,66.5,400,130,11,440,'suv'],
  ['BMW','iX2','xDrive30',2023,0,66.5,400,130,11,449,'suv'],
  ['BMW','iX3','50 xDrive (Neue Klasse)',2025,0,108.7,800,400,11,805,'suv'],
  ['BMW','iX','xDrive50',2021,0,111.5,400,195,11,633,'suv'],
  ['BMW','i5','eDrive40',2023,0,84.3,400,205,11,582,'sedan'],
  ['BMW','i7','xDrive60',2022,0,105.7,400,195,11,625,'sedan'],
  ['Mini','Cooper E','40.7 kWh',2024,0,40.7,400,75,11,305,'hatch'],
  ['Mini','Cooper SE','54.2 kWh',2024,0,54.2,400,95,11,402,'hatch'],
  ['Mini','Countryman E','66.5 kWh',2024,0,66.5,400,130,11,462,'suv'],
  ['Mini','Aceman E','54.2 kWh',2024,0,54.2,400,95,11,406,'suv'],
  // --- Mercedes / Smart ---
  ['Mercedes','EQA','250+',2021,0,70.5,400,100,11,540,'suv'],
  ['Mercedes','EQB','300 4MATIC',2021,0,69.7,400,100,11,445,'suv'],
  ['Mercedes','EQE','350+',2022,0,96,400,170,11,669,'sedan'],
  ['Mercedes','EQE SUV','350+',2023,0,96,400,170,11,596,'suv'],
  ['Mercedes','EQS','450+',2021,0,118,400,200,11,783,'sedan'],
  ['Mercedes','CLA EQ','250+ (2025)',2025,0,85,800,320,11,792,'sedan'],
  ['Smart','#1','Pro+',2022,0,66,400,150,22,440,'suv'],
  ['Smart','#3','Premium',2023,0,66,400,150,22,455,'suv'],
  ['Smart','#5','Premium 100',2025,0,100,800,400,22,590,'suv'],
  // --- Stellantis ---
  ['Peugeot','e-208','51 kWh',2023,0,51,400,100,11,410,'hatch'],
  ['Peugeot','e-2008','54 kWh',2023,0,54,400,100,11,406,'suv'],
  ['Peugeot','e-308','54 kWh',2023,0,54,400,100,11,416,'hatch'],
  ['Peugeot','e-3008','73 kWh',2024,0,73,400,160,11,527,'suv'],
  ['Peugeot','e-3008','98 kWh (Long Range)',2024,0,98,400,160,11,701,'suv'],
  ['Peugeot','e-5008','73 kWh',2024,0,73,400,160,11,502,'suv'],
  ['Opel','Corsa Electric','51 kWh',2023,0,51,400,100,11,405,'hatch'],
  ['Opel','Mokka Electric','54 kWh',2023,0,54,400,100,11,406,'suv'],
  ['Opel','Astra Electric','54 kWh',2023,0,54,400,100,11,418,'hatch'],
  ['Opel','Grandland Electric','73 kWh',2024,0,73,400,160,11,523,'suv'],
  ['Citroën','ë-C3','44 kWh (LFP)',2024,0,44,400,100,11,320,'hatch'],
  ['Citroën','ë-C4','54 kWh',2023,0,54,400,100,11,420,'hatch'],
  ['Citroën','ë-C3 Aircross','44 kWh',2024,0,44,400,100,11,303,'suv'],
  ['Fiat','500e','24 kWh',2020,0,23.8,400,50,11,190,'hatch'],
  ['Fiat','500e','42 kWh',2020,0,42,400,85,11,320,'hatch'],
  ['Fiat','600e','54 kWh',2023,0,54,400,100,11,409,'suv'],
  ['Fiat','Grande Panda','44 kWh (LFP)',2024,0,44,400,100,11,320,'hatch'],
  ['Jeep','Avenger','Electric 54',2023,0,54,400,100,11,400,'suv'],
  ['Alfa Romeo','Junior','Elettrica 54',2024,0,54,400,100,11,410,'suv'],
  ['Lancia','Ypsilon','Elettrica 51',2024,0,51,400,100,11,403,'hatch'],
  ['DS','DS 3 E-Tense','54 kWh',2023,0,54,400,100,11,404,'suv'],
  // --- Renault / Dacia ---
  ['Renault','Zoe','R135 ZE50',2019,2024,55,400,50,22,395,'hatch'],
  ['Renault','Megane E-Tech','EV60',2022,0,60,400,130,22,468,'hatch'],
  ['Renault','Scenic E-Tech','EV87',2024,0,87,400,150,22,620,'suv'],
  ['Renault','5 E-Tech','40 kWh',2024,0,40,400,80,11,312,'hatch'],
  ['Renault','5 E-Tech','52 kWh',2024,0,52,400,100,11,410,'hatch'],
  ['Renault','4 E-Tech','52 kWh',2025,0,52,400,100,11,409,'suv'],
  ['Dacia','Spring','Electric 65',2021,0,26.8,400,30,7,220,'hatch'],
  // --- Hyundai / Kia / Genesis ---
  ['Hyundai','Inster','42 kWh',2024,0,42,400,85,11,327,'hatch'],
  ['Hyundai','Inster','49 kWh',2024,0,49,400,85,11,370,'hatch'],
  ['Hyundai','Kona Electric','48.6 kWh',2023,0,48.6,400,75,11,377,'suv'],
  ['Hyundai','Kona Electric','65.4 kWh',2023,0,65.4,400,100,11,514,'suv'],
  ['Hyundai','IONIQ 5','58 kWh RWD',2021,2023,58,800,175,11,384,'suv'],
  ['Hyundai','IONIQ 5','77.4 kWh RWD',2022,2024,77.4,800,235,11,507,'suv'],
  ['Hyundai','IONIQ 5','84 kWh RWD (2025)',2024,0,84,800,257,11,570,'suv'],
  ['Hyundai','IONIQ 6','77.4 kWh RWD',2022,0,77.4,800,235,11,614,'sedan'],
  ['Hyundai','IONIQ 9','110.3 kWh AWD',2025,0,110.3,800,233,11,620,'suv'],
  ['Kia','EV3','58.3 kWh',2024,0,58.3,400,105,11,436,'suv'],
  ['Kia','EV3','81.4 kWh',2024,0,81.4,400,130,11,605,'suv'],
  ['Kia','EV4','58.3 kWh',2025,0,58.3,400,105,11,440,'sedan'],
  ['Kia','EV4','81.4 kWh',2025,0,81.4,400,130,11,630,'sedan'],
  ['Kia','EV5','88.1 kWh (LFP)',2025,0,88.1,400,150,11,530,'suv'],
  ['Kia','EV6','77.4 kWh RWD',2021,2024,77.4,800,235,11,528,'suv'],
  ['Kia','EV6','84 kWh RWD (2025)',2024,0,84,800,258,11,582,'suv'],
  ['Kia','EV6','GT',2022,0,84,800,258,11,450,'suv'],
  ['Kia','EV9','99.8 kWh AWD',2023,0,99.8,800,210,11,512,'suv'],
  ['Kia','Niro EV','64.8 kWh',2022,0,64.8,400,85,11,460,'suv'],
  // --- Nissan / Toyota / Honda / Mazda / Suzuki / Subaru / Lexus ---
  ['Nissan','Leaf','40 kWh',2018,2024,40,400,50,7,270,'hatch'],
  ['Nissan','Leaf','e+ 62 kWh',2019,2024,62,400,100,7,385,'hatch'],
  ['Nissan','Leaf','75 kWh (2025)',2025,0,75,400,150,11,604,'suv'],
  ['Nissan','Ariya','63 kWh',2022,0,66,400,130,22,403,'suv'],
  ['Nissan','Ariya','87 kWh',2022,0,91,400,130,22,533,'suv'],
  ['Nissan','Micra EV','52 kWh',2025,0,52,400,100,11,408,'hatch'],
  ['Toyota','bZ4X','71.4 kWh FWD',2022,0,71.4,400,150,11,516,'suv'],
  ['Toyota','Urban Cruiser','61 kWh',2025,0,61,400,120,11,420,'suv'],
  ['Toyota','C-HR+','77 kWh FWD',2025,0,77,400,150,11,600,'suv'],
  ['Honda','e:Ny1','68.8 kWh',2023,0,68.8,400,78,11,412,'suv'],
  ['Honda','Prologue','85 kWh AWD (NA)',2024,0,85,400,155,11,455,'suv'],
  ['Mazda','MX-30','35.5 kWh',2020,0,35.5,400,50,11,200,'suv'],
  ['Suzuki','eVitara','61 kWh',2025,0,61,400,120,11,428,'suv'],
  ['Subaru','Solterra','71.4 kWh AWD',2022,0,71.4,400,150,11,466,'suv'],
  ['Lexus','RZ 450e','71.4 kWh',2023,0,71.4,400,150,11,440,'suv'],
  // --- MG / Çin markaları ---
  ['MG','MG4','Standard 51',2022,0,51,400,117,11,350,'hatch'],
  ['MG','MG4','Comfort 64',2022,0,64,400,135,11,450,'hatch'],
  ['MG','MG4','Extended 77',2023,0,77,400,144,11,520,'hatch'],
  ['MG','ZS EV','Long Range 72',2021,0,72.6,400,92,11,440,'suv'],
  ['MG','MG5','Long Range 61',2022,0,61.1,400,87,11,400,'sedan'],
  ['MG','S5 EV','64 kWh',2025,0,64,400,150,11,480,'suv'],
  ['Chery','Omoda E5','61 kWh',2024,0,61,400,80,9.9,430,'suv'],
  ['Skywell','ET5','72 kWh',2022,0,72,400,80,11,400,'suv'],
  ['Zeekr','X','66 kWh RWD',2023,0,66,400,150,22,440,'suv'],
  ['Zeekr','001','100 kWh AWD',2023,0,100,400,200,22,590,'sedan'],
  ['Xpeng','G6','87.5 kWh RWD',2024,0,87.5,800,280,11,570,'suv'],
  ['Xpeng','G9','98 kWh RWD',2024,0,98,800,300,11,570,'suv'],
  ['Leapmotor','T03','37.3 kWh',2024,0,37.3,400,48,6.6,265,'hatch'],
  ['Leapmotor','C10','69.9 kWh',2024,0,69.9,400,84,6.6,420,'suv'],
  // --- Volvo / Polestar ---
  ['Volvo','EX30','Single Extended 69',2023,0,69,400,153,11,476,'suv'],
  ['Volvo','EX40','Twin 78',2021,0,78,400,150,11,437,'suv'],
  ['Volvo','EX90','Twin 111',2024,0,111,400,250,11,585,'suv'],
  ['Polestar','2','Long Range Single',2021,0,82,400,205,11,655,'sedan'],
  ['Polestar','3','Long Range Dual',2024,0,111,400,250,11,631,'suv'],
  ['Polestar','4','Long Range Dual',2024,0,100,400,200,22,590,'suv'],
  // --- Ford / GM / Rivian / Lucid ---
  ['Ford','Mustang Mach-E','Extended RWD',2021,0,91,400,150,11,600,'suv'],
  ['Ford','Explorer EV','77 kWh (EU)',2024,0,82,400,185,11,602,'suv'],
  ['Ford','Capri','77 kWh (EU)',2024,0,82,400,185,11,627,'suv'],
  ['Ford','Puma Gen-E','43 kWh',2024,0,43,400,100,11,376,'suv'],
  ['Ford','F-150 Lightning','Extended Range',2022,0,131,400,155,19,515,'pickup'],
  ['Chevrolet','Bolt EUV','65 kWh',2022,2023,65,400,55,11,397,'suv'],
  ['Chevrolet','Equinox EV','85 kWh',2024,0,85,400,150,11,513,'suv'],
  ['Chevrolet','Blazer EV','85 kWh AWD',2024,0,85,400,190,11,450,'suv'],
  ['Chevrolet','Silverado EV','200 kWh (NA)',2024,0,200,800,350,19,720,'pickup'],
  ['Cadillac','Lyriq','102 kWh RWD',2023,0,102,400,190,19,530,'suv'],
  ['Rivian','R1T','Large Pack',2022,0,135,400,220,11,505,'pickup'],
  ['Rivian','R1S','Large Pack',2022,0,135,400,220,11,494,'suv'],
  ['Lucid','Air','Touring',2022,0,92,900,250,19,725,'sedan'],
];
</file>

<file path="manifest.json">
{
  "id": "watttrack",
  "name": "WattTrack — EV Şarj Harcama Takibi",
  "short_name": "WattTrack",
  "description": "Elektrikli araç şarj harcamalarını takip et: net/indirimli maliyet, yakıtlı araç kıyaslaması, çok para birimli kayıt. Tüm veriler cihazında kalır.",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "display_override": [
    "standalone",
    "minimal-ui",
    "window-controls-overlay",
    "tabbed"
  ],
  "orientation": "portrait-primary",
  "background_color": "#F1F7F2",
  "theme_color": "#F1F7F2",
  "lang": "tr",
  "dir": "ltr",
  "categories": [
    "finance",
    "utilities",
    "productivity"
  ],
  "prefer_related_applications": false,
  "launch_handler": {
    "client_mode": "auto"
  },
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "screenshot-narrow.png",
      "sizes": "402x874",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Ana sayfa — harcama özeti"
    },
    {
      "src": "screenshot-wide.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Masaüstü görünümü"
    }
  ],
  "shortcuts": [
    {
      "name": "Yeni Şarj Kaydı",
      "short_name": "Yeni Kayıt",
      "url": "./?action=add",
      "icons": [
        {
          "src": "icon-192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Geçmiş",
      "url": "./?page=history",
      "icons": [
        {
          "src": "icon-192.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "file_handlers": [
    {
      "action": "./",
      "accept": {
        "application/json": [
          ".json"
        ]
      }
    }
  ],
  "protocol_handlers": [
    {
      "protocol": "web+watttrack",
      "url": "./?proto=%s"
    }
  ],
  "share_target": {
    "action": "./",
    "method": "GET",
    "params": {
      "title": "share_title",
      "text": "share_text",
      "url": "share_url"
    }
  },
  "edge_side_panel": {
    "preferred_width": 412
  },
  "note_taking": {
    "new_note_url": "./?action=add"
  },
  "related_applications": [
    {
      "platform": "play",
      "id": "app.watttrack.twa"
    }
  ],
  "scope_extensions": []
}
</file>

<file path="KURULUM.md">
# ⚠️ PLAY STORE YAYIN KONTROL LİSTESİ (unutma!)

Yayına çıkarken bu listeyi aç — sohbette "Play listesine bakalım" demen yeterli.

[ ] 1. GİZLİLİK: Play Console > Store listing > Privacy policy alanına:
       https://rino-06.github.io/WattTrack/privacy.html
[ ] 2. DATA SAFETY formu: "Veri toplanmıyor / paylaşılmıyor" işaretle.
       Konum: "isteğe bağlı (opsiyonel), yalnız cihazda işlenir, paylaşılmaz,
       toplanmaz" — çünkü koordinat yalnız harici servise anlık sorgu için
       kullanılır, geliştirici görmez. Hesap yok, analitik yok, reklam yok.
[ ] 3. IARC yaş anketi: Console yönlendirir; içerik yok → "Herkes" çıkar.
       Çıkan IARC kimliğini istersen manifest'e sonra ekleriz.
[ ] 4. ASSETLINKS: PWABuilder paket indirirken assetlinks.json verir →
       repoda .well-known/assetlinks.json yoluna koy (Claude'a "assetlinks
       zamanı" yaz, birlikte yaparız). Bu olmadan TWA üstte adres çubuğu
       gösterir.
[ ] 5. PAKET KİMLİĞİ: PWABuilder'da Package ID = app.watttrack.twa
       (uygulamadaki "Play'de Değerlendir" butonu ve manifest
       related_applications bu kimliğe bağlı — DEĞİŞTİRME, değiştirirsen
       Claude'a söyle ikisini güncellesin).
[ ] 6. KAPALI TEST: kişisel geliştirici hesaplarında üretime çıkmadan önce
       12+ testçiyle 14 gün kapalı test şartı var — testçi e-postalarını
       hazırla.
[ ] 7. Uygulama yayına girince: "Play'de Değerlendir" butonunu telefonda
       test et (mağaza sayfası açılmalı).
[ ] 8. LICENSE ve privacy.html dosyalarının repoda olduğunu doğrula.

# WattTrack — Kurulum ve Yayınlama Rehberi

## Dosyalar

| Dosya | Görevi |
|---|---|
| `index.html` | Uygulamanın arayüzü (HTML + CSS) |
| `app.js` | Uygulama mantığı: Dexie.js veritabanı, form, istatistik, yedekleme |
| `manifest.json` | PWA kimliği ("Ana ekrana ekle" için gerekli) |
| `sw.js` | Service worker — çevrimdışı çalışmayı sağlar |
| `icon-*.png` | Uygulama ikonları |

## 1) Yerelde deneme

Dosyaları bir klasöre koy ve `index.html`'i tarayıcıda aç.
Not: Service worker yalnızca HTTPS veya localhost'ta çalışır; dosyadan açınca
uygulama yine tam çalışır ama "çevrimdışı önbellek" devreye girmez. Kurum
ağında localhost kısıtın olduğundan asıl testi GitHub Pages üzerinden yap.

## 2) GitHub Pages'e yayınlama (ücretsiz)

1. GitHub'da yeni bir repo aç: örn. `watttrack`
2. Bu klasördeki tüm dosyaları repoya yükle (Add file → Upload files)
3. Repo → Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, klasör: `/ (root)` → Save
4. 1-2 dakika sonra adresin hazır: `https://KULLANICIADIN.github.io/watttrack/`

Bu adres Tesla tarayıcısında, telefonda ve bilgisayarda aynı şekilde çalışır.

## 3) Telefona kurulum (PWA)

- **Android (Chrome):** Adresi aç → menü (⋮) → "Ana ekrana ekle" / "Uygulamayı yükle"
- **iPhone (Safari):** Adresi aç → Paylaş → "Ana Ekrana Ekle"
- **Tesla:** Tarayıcıdan adresi aç, yer imlerine ekle

## 4) Google Play'e paketleme (TWA)

1. Uygulama GitHub Pages'te yayında olmalı (adım 2)
2. https://www.pwabuilder.com adresine git, site adresini yapıştır
3. "Package for Stores" → Android → `.aab` dosyasını indir
4. PWABuilder'ın verdiği `assetlinks.json` dosyasını repoda
   `.well-known/assetlinks.json` yoluna koy (adres doğrulaması için şart)
5. Google Play Console'da geliştirici hesabı aç (tek seferlik 25$)
6. Yeni uygulama oluştur, `.aab` dosyasını yükle
7. Yeni bireysel hesaplar için kapalı test şartını unutma
   (12+ testçi, 14 gün) — testçileri EV forumlarından/çevrenden toplayabilirsin

## 5) Veri modeli (ileride .NET + PostgreSQL sürümü için referans)

```
sessions: id, tarih (ISO), tip (DC|AC|Ev), firma, kwh,
          listeTutar, indirimTip (none|pct|amt), indirimDeger,
          indirim (hesaplanmış ₺), odenen, banka, km, sehir, aracId, not
vehicles: id, ad
settings: key, value   (şimdilik: budget)
```

CSV çıktısı Türkçe Excel uyumludur (UTF-8 BOM, `;` ayraç, ondalık virgül) —
doğrudan Power BI'a da bağlanabilir.

## Sürüm notu (v17)

1. ARAÇ GİDERLERİ: Kıyasla sayfasından vergi (MTV), sigorta/kasko, bakım,
   lastik, muayene, onarım, otopark/otoyol, ekipman ve diğer kalemleri
   ekleyebilirsin (tarih, tutar, para birimi, araç, not). Yeni "expenses"
   tablosu; yedeklerde de yer alır, mükerrer koruması vardır.
2. TOPLAM SAHİP OLMA MALİYETİ (TCO): şarj + giderler; EV toplamı,
   gider dahil 1 km maliyeti, yakıtlı aracın gider dahil toplamı ve gider
   dahil kazanç. Yakıtlı araç için "yıllık sabit gider" alanı eklendi
   (dönem uzunluğuna oranlanır). Adil kıyas için "yıllık giderleri döneme
   oranla" seçeneği (vergi/sigorta) varsayılan olarak açık.
3. GENİŞ EKRAN DESTEĞİ: 760px üstünde telefon çerçevesi yerine gerçek
   responsive yerleşim — 2 sütun (Tesla ekranı ~1200px), 1240px üstünde
   ana sayfa 3 sütun; alt menü ortalanmış hap biçiminde; formlar ortalı
   pencere olarak açılır. Geçmiş/Ayarlar okunabilirlik için 820-900px
   genişlikte ortalanır.
4. Negatif tutarlar artık "−₺586" biçiminde düzgün gösteriliyor.

## Sürüm notu (v16)

1. Ana sayfa düzeni: Kilometre sayacı + Detay istatistikler, harcama
   grafiğinin üstüne taşındı
2. Yeni 1 km maliyet kutuları (net + indirimsiz) — ana sayfada kWh
   satırının altında, Kıyasla'da 100 km kutularının üstünde
3. Firma dağılımı ile şarj tipi donutu yan yana kompakt kutulara alındı
4. Yükleme animasyonları: kartlar aşağıdan belirir, barlar büyüyerek,
   donut dönerek, kıyas çizgileri çizilerek gelir
Not: Kıyasla'da fiyat/tüketim değişince yalnız YAKITLI tarafı değişir;
EV net/indirimsiz değerleri kayıtlarından gelir, yakıt fiyatından
bağımsızdır (5. maddedeki gözlemin hata değil, tasarım gereğidir).

## Sürüm notu (v14)

1. SAYAÇ OTOMATİK: formdan girilen her kayıttaki sürülen mesafe aracın
   güncel km'sine EKLENİR; kayıt düzenlenince fark kadar düzeltilir,
   silinince geri düşülür. İçe aktarma sayaca dokunmaz (yedekteki sayaç
   o kayıtları zaten içerir — çift sayım engellenir).
2. Güncelleme tazeliği: yeni service worker devreye girdiğinde sayfa bir
   kez otomatik yenilenir — sürüm numarası artık ilk açılışta doğru görünür
3. Destek bölümü güvenli biçime alındı: "tamamen ücretsiz ve reklamsız...
   GitHub sayfamıza göz atabilirsiniz" metni + yalnız "GitHub Proje
   Sayfası" butonu (bağış/kahve ifadesi ve ödeme linki YOK — Play uyumlu)
4. .github/FUNDING.yml eklendi (repoya bu klasör yapısıyla yükle) —
   repo sayfasında pembe Sponsor butonunu bu dosya çıkarır

## Sürüm notu (v12)

1. Gerçek verilere kWh oranıyla mesafe dağıtıldı (yeni JSON: toplam tam
   4.343 km, verim 5,63 km/kWh ≈ 17,8 kWh/100km) + araç düzeltildi
   (Premium RWD, kmStart 9.271 / kmNow 13.614)
2. Odometre araç seçimi: seçili → tek → VARSAYILAN araç (çoklu araçta da
   çalışır); km düzenlemede başlangıç değeri her seferinde düzeltilebilir,
   başlangıç > güncel girilirse otomatik yer değiştirir (100km ve kıyas
   kutularının boş kalma sebebi buydu)
3. km✎ rozeti (🛣️ yerine) — araç satırında net "kilometre düzenle" butonu
4. Hakkında: sürüm no + tarih, GitHub iletişim bağlantısı, Gizlilik
   Politikası sayfası (privacy.html — Play Data Safety için URL olarak
   kullan), ★ Play'de Değerlendir ve ☕ Destek (GitHub Sponsors) butonları
5. privacy.html eklendi (TR+EN) — repoya yüklemeyi unutma

## Sürüm notu (v11)

1. Ana sayfa varsayılan dönemi YIL
2. Detay istatistiklere (ort. süre + ort. şarj aralığı) Tümü/DC/AC filtresi
3. kWh girişi sıkılaştı: 0 olan kayıt boş gösterilir, kutulara yalnız rakam
   girilebilir (tam 3, ondalık 2 hane), alt satırda 45,27 örnekli açıklama
4. KIYASLAMA + 100 KM MALİYETİ artık kayıt mesafesi yoksa KİLOMETRE
   SAYACINDAN hesaplanır (kmNow − kmStart). Kıyas ekranında "Mesafe
   kaynağı" notu hangi yöntemin kullanıldığını söyler; grafik ve aylık
   kazanç, mesafeyi harcamayla orantılı dağıtarak çizilir
5. JSON içe aktarmada araç birleştirme: aynı isimli araç varsa yedekteki
   km başlangıç/güncel ve fotoğraf bilgisi mevcut araca işlenir (yedekten
   gelen gerçek başlangıç km'si onboarding değerini düzeltir)

## Sürüm notu (v10)

1. Ortadaki şimşek+artı ikonu büyütüldü (32→42 px)
2. Onboarding'de güncel km alanı araç özet kartının ÜSTÜNE alındı —
   araç seçilir seçilmez göz önünde
3. Ayarlar: araç satırına belirgin 🛣️ butonu (kilometre güncelleme) —
   araç bilgisinin sağında, 📷'nin yanında; ipucu metni güncellendi
4. Onboarding 2. adıma "← Geri" butonu (ülke adımına dönüş)

## Sürüm notu (v9)

1. PWABuilder önerileri: manifest'e file_handlers (JSON yedeği uygulamayla
   açılınca otomatik içe aktarılır), protocol_handlers, share_target
   (paylaşılan metin yeni kayıt notuna gelir), edge_side_panel, note_taking,
   related_applications, display_override genişletmesi eklendi.
   Not: IARC derecelendirmesi mağaza başvurusunda alınır (uydurulamaz);
   scope_extensions tek alan adı kullanıldığından boş.
2. Her sayfanın üstünde 🌙/☀️ hızlı tema düğmesi (senkron çalışır)
3. Ortadaki + butonu: beyaz/koyu çember + yeşil şimşek-artı logosu
   (nav-plus.png — repoya yüklemeyi unutma)
4. KİLOMETRE SAYACI: onboarding'de araç seçince güncel km sorulur;
   Ayarlar'da araca dokununca güncellenir (ilk seferde başlangıç km de
   sorulur); ana sayfada "Araç sayacı" ve "Başlangıçtan beri yapılan"
   kutuları (araç bazlı, mil destekli)
5. Uygulama ikonları büyütüldü: beyaz boşluk %14→%5 (maskable güvenli
   bölgesi korunarak %16) — ana ekranda logo artık dolgun görünür

## Sürüm notu (v8)

1. Service worker kaydı window load sarmalayıcısına alındı (en iyi pratik)
2. Erişilebilirlik: tüm select alanlarına aria-label; soluk metin renkleri
   WCAG AA kontrastına koyulaştırıldı (Lighthouse accessibility artışı)
3. "L0" ve "{u}" hataları giderildi: harf sembollü para birimleri
   (ALL=Arnavutluk Leki, kr, Ft…) artık "1.250 L" biçiminde; kıyas
   etiketlerindeki {u} yer tutucusu birimle dolduruluyor
4. PWABuilder için manifest zenginleştirildi: id, scope, display_override,
   categories, screenshots (dar+geniş), shortcuts (Yeni Kayıt / Geçmiş),
   launch_handler — kısayol URL'leri uygulama içinde işleniyor
5. KOYU MOD: Ayarlar → Görünüm (Açık/Koyu); sarj_app paletiyle
   (#0f172a zemin, #1e293b kart, #16a34a yeşil, #3b82f6 mavi)
6. Alt menü ikonları emoji oldu (📊 📋 🆚 ⚙️), seçili sekme renklenir
7. screenshot-narrow.png ve screenshot-wide.png dosyaları eklendi
   (manifest ekran görüntüleri — repoya yüklemeyi unutma)

## Sürüm notu (v7)

1. Araç ARŞİVİ: kayıtları olan araç silinince artık kayıtlar kaybolmuyor —
   araç arşive taşınır (satılan/kazalı araçlar için), geçmişi ve
   istatistikleri korunur, "Geri al" ile döner; kaydı olmayan araç
   gerçekten silinir
2. Kıyasla: "Bugüne kadar" kümülatif özet (toplam mesafe, EV toplam,
   yakıtlıyla olurdu, toplam kazanç) + EV vs yakıtlı KÜMÜLATİF ÇİZGİ GRAFİK
3. Ana sayfa: haftalık harcama bölümü kaldırıldı; tek harcama grafiği
   kendi Hafta(günlük)/Ay/Yıl filtresiyle
4. JSON geri yükleme akıllandı: tümü mükerrerse uyarır ve eklemez;
   kısmen mükerrerse yalnız yenileri ekler ve sayıları bildirir
5. Özel banka ekleme: formdaki banka listesine "+ Yeni banka" ile kendi
   bankanı ekleyebilirsin, listede kalıcı olur
6. Geçmiş filtreleri kısaldı: kapalıyken "Banka"/"Lokasyon" yazar,
   açınca "Tümü" en üsttedir
7. Araç satırında belirgin 📷 butonu (fotoğraf ekle/değiştir)
8. Görsel tazeleme: hero'da yeşil gradyan, bar grafiklerde gradyan +
   animasyon, DC (#16A34A yeşil) / AC (#1B5FAA mavi) / Ev (açık yeşil)
   ayrışık tonlar — palet yeşil/mavi kaldı

## Sürüm notu (v6 — yayın sürümü)

1. Örnek veri sistemi tamamen kaldırıldı — uygulama yayına hazır, temiz açılır
2. İNDİRİM MATEMATİĞİ DÜZELTİLDİ: girilen tutar indirim ÖNCESİ tutardır;
   yüzde/tutar indirim bundan düşülür, formda "Ödenen (net)" canlı hesaplanır
3. KUR HATASI DÜZELTİLDİ (çift yönlü dönüşüm): her kayıt kendi para birimini
   korur ve kaydedildiği günün ECB kur TABLOSUNU saklar; temel para birimi
   değişince kayıtlar kendi günün kuruyla doğru çevrilir. Tablo yoksa
   (çevrimdışı kayıt) kayıt yanlış 1:1 çevrilmek yerine toplam dışında
   tutulur ve çevrimiçi olununca arka planda otomatik tamamlanır
4. Ana sayfa: logo + iki sütunlu özet (net | indirimsiz, ikisi de büyük),
   önceki döneme göre ▲/▼ % değişim
5. Banka Ülkelerim: bankaların şarj edilen ülkeden bağımsız; ayarlardan bir
   veya birden çok banka ülkesi seçilir, formdaki liste bunların birleşimi
6. GPS artık isim getiriyor: mahalle/semt adı (OpenStreetMap) + 1 km
   içindeki şarj istasyonları çip olarak önerilir (Open Charge Map)
7. Yeni ana sayfa bölümleri: DC/AC/Ev kWh donut grafiği, ort. şarj süresi,
   ort. şarj aralığı, en çok kazandıran bankalar, en çok şarj edilen
   lokasyonlar; aylık bara dokununca o yılın geçmişi açılır
8. Geçmiş'e banka ve lokasyon filtreleri eklendi
9. Uygulama ikonları ve ana sayfa logosu senin WattTrack logondan üretildi

## Sürüm notu (v5)

1. Kompakt onboarding: ülke/para/birim/dil tek ekranda açılır listelerle
2. EV veritabanı ~140 sürüme çıktı (KGM Torres EVX 73.4 & 80.6, Korando
   e-Motion, Musso EV; 2025+ Tesla Standard/Premium/Performance serisi;
   Inster, EV4/EV5, Elroq, ID.Buzz, Grande Panda, Xpeng, Leapmotor vb.)
   — teknik değerler Oca 2026 üretici verilerinden derlendi (yaklaşıktır)
3. Araca kendi fotoğrafını ekleme (galeri/kamera → cihazda saklanır);
   ayarlarda araca dokunarak da eklenir/değiştirilir
4. Net (ödenen) ve indirimsiz (liste) istatistikler ayrı ayrı: toplamlar,
   kWh başı, 100 km — ana sayfada ve Kıyasla'da
5. Ana sayfa / Geçmiş / Kıyasla ekranlarına araç filtresi (2+ araçta)
6. Form: ülke bazlı firma listesi (16 TR + 20+ ülke; en çok kullandıkların
   üstte), bölünmüş kWh girişi (tam,ondalık), virgüllü tutar, banka
   Gelişmiş'e taşındı ve ülkeye göre listeleniyor, saat+dakika süre,
   rakamla SoC aralığı, lokasyon önerileri + GPS (📍) butonu
7. Yurt dışı kayıt: ülke seçilince o günün ECB kuru otomatik çekilir
   (frankfurter API — yalnız para birimi kodları gider), bulunamazsa elle
   girilir; istatistikler temel para birimine çevrilerek hesaplanır
8. Güvenlik: CSP başlığı, CSV formül-enjeksiyon koruması, tüm kullanıcı
   girdilerinde HTML kaçışı (XSS koruması)

## Sürüm notu (v4 — büyük özellik sürümü)

1. İlk açılış sihirbazı: ülke (Avrupa + ABD + Kanada, aranabilir bayraklı liste),
   para birimi ve km/mil seçimi — dil otomatik önerilir
2. Araç seçimi: ~100 EV sürümü içeren gömülü veritabanı; yıl, donanım ve
   batarya kapasitesine göre ayırt etme; seçimde silüet + batarya / mimari
   (400V-800V) / maks DC-AC / menzil özet kartı
3. Tüm istatistikler ana sayfada (İstatistik sekmesi kaldırıldı):
   Hafta/Ay/Yıl dönem seçici, kWh başı ort., 100 km/mi maliyet, enerji,
   şarj/firma, alınan indirim, ücretsiz şarj sayısı, haftalık + aylık
   grafikler, firma dağılımı, son şarjlar
4. Alt menüde ortada büyük + butonu; yeni form: bugünün tarihi hazır,
   ülke kaydı başına değiştirilebilir (seyahat), AC/DC, ev/firma, kWh,
   sürülen mesafe, tutar, %/tutar indirim, ÜCRETSİZ ŞARJ anahtarı;
   Gelişmiş bölümü: süre, lokasyon, %20→80 şarj aralığı kaydırıcısı
   (Ayarlar'dan "hep açık" yapılabilir)
5. Geçmiş: yıl + firma + tip (DC/AC/Ücretsiz) filtreleri; kayıtlara
   dokununca DÜZENLEME açılır (sadece silme değil)
6. Kıyasla: Benzin/Dizel/Hibrit/LPG aracıyla karşılaştırma — yakıt fiyatı
   ve lt/100km tüketim girilir; km başına ve 100 birimde kazanç + aylara
   göre kazanç grafiği
7. Ayarlar: ülke/para birimi/birim/dil (TR, EN, DE, FR, ES, IT tam çeviri;
   diğer ülkeler İngilizce'ye düşer), çoklu araç + yıldızla varsayılan seçimi

## Sürüm notu (v3)

- Dexie.js artık uygulamayla birlikte geliyor (dexie.min.js) — internet ve
  CDN erişimi olmadan, kısıtlı kurum ağlarında bile çalışır
- İlk açılışta prototipteki gibi örnek veriler yüklenir; ana sayfadaki
  "Temizle" ile tek dokunuşta silinir
- Tüm metinler HTML'de gömülü — JS yüklenemese bile arayüz boş kalmaz
- Masaüstü/geniş ekranda prototipteki gibi bej zemin üzerinde telefon
  çerçevesi görünümü; telefonda tam ekran
- Playwright ile ekran görüntüsü testinden geçirildi

## Sürüm notu (v2 — Claude Design prototipine göre yeniden tasarım)

- Arayüz: açık yeşil tema, beyaz kartlar, firma baş harfli renkli avatarlar,
  5 sekme (Ana Sayfa / Geçmiş / İstatistik / Kıyasla / Ayarlar) + yüzen "+" butonu
- Ana sayfa: "Bu ay toplam" hero kartı + tasarruf rozeti, kWh başı ort.,
  haftalık harcama barları, son şarjlar
- Kayıt formu: ödenen tutar + indirim (tutar/yüzde) → tasarruf otomatik,
  hızlı firma ve %0/10/20 çipleri, SoC öncesi/sonrası, DC/AC/Ev,
  "Detay ekle" altında km / şehir / araç / not
- Geçmiş: ay bazlı gruplama, tek dokunuşla silme
- Kıyasla: firma bazlı toplam, şarj sayısı, ₺/kWh ve oran çubuğu
- Ayarlar: Türkçe/İngilizce dil, ₺/$/€ para birimi, araç yönetimi,
  JSON + CSV dışa aktarma, JSON geri yükleme, sıfırlama
- Chart.js kaldırıldı (grafikler saf CSS/div) → daha hafif, araç
  tarayıcılarında daha hızlı; tek harici bağımlılık Dexie.js
- Tam çevrimdışı çalışma (service worker, cache v2)
</file>

<file path="sw.js">
/* WattTrack service worker — çevrimdışı çalışma */
const CACHE = 'watttrack-v19';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './dexie.min.js',
  './evdata.js',
  './logo.png',
  './nav-plus.png',
  './privacy.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit ||
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
</file>

<file path="index.html">
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.frankfurter.dev https://api.frankfurter.app https://nominatim.openstreetmap.org https://api.openchargemap.io; manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>WattTrack</title>
<meta name="description" content="EV şarj harcama takibi — verileriniz cihazınızda kalır.">
<meta name="theme-color" content="#F1F7F2">
<link rel="manifest" href="manifest.json">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<script src="dexie.min.js"></script>
<script src="evdata.js"></script>
<style>
:root{
  --bg:#F1F7F2; --card:#FFFFFF; --text:#131714; --muted:#5F6560;
  --muted2:#5C625D; --faint:#666C67; --accent:#1C8742; --accent-dark:#00682A;
  --accent-text:#115629; --chip:#D7EBDA; --pill:#C9F1D0; --border:#D5D8D6;
  --track:#E3EAE4; --circle:#EAF0EB; --red:#C53637; --blue:#007DAA;
  --shadow:0 1px 3px rgba(0,0,0,.06); --shadow-big:0 8px 20px rgba(0,0,0,.15);
}
[data-theme="dark"]{
  --bg:#0f172a; --card:#1e293b; --text:#f1f5f9; --muted:#94a3b8;
  --muted2:#94a3b8; --faint:#8ea0b5; --accent:#16a34a; --accent-dark:#22c55e;
  --accent-text:#86efac; --chip:#14532d; --pill:#14532d; --border:#334155;
  --track:#334155; --circle:#0a1628; --red:#ef4444; --blue:#3b82f6;
  --shadow:0 1px 3px rgba(0,0,0,.4); --shadow-big:0 8px 20px rgba(0,0,0,.5);
}
[data-theme="dark"] .hero{background:linear-gradient(150deg,#1e293b 30%,#16223a 100%)}
[data-theme="dark"] input,[data-theme="dark"] select{background:#0a1628}
[data-theme="dark"] .spec{background:#0a1628}
[data-theme="dark"] .mb .bar{background:linear-gradient(180deg,#22c55e,#15803d)}
[data-theme="dark"] nav{border-top-color:#334155}
[data-theme="dark"] .gps-btn{background:#14532d;color:#86efac}
[data-theme="dark"] .toast{background:#334155}
[data-theme="dark"] .ev-summary svg [fill="#F1F7F2"]{fill:#1e293b}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  font-size:15px;line-height:1.45;min-height:100vh}

.splash{position:fixed;inset:0;z-index:1000;
  background:linear-gradient(150deg,#FFFFFF 30%,#EAF6EE 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
  transition:opacity .55s ease,transform .55s ease}
[data-theme="dark"] .splash{background:linear-gradient(150deg,#1e293b 30%,#16223a 100%)}
.splash.hide{opacity:0;transform:scale(1.03);pointer-events:none}
.splash-logo{width:auto;height:132px;opacity:0;
  animation:splashLogoIn 1s cubic-bezier(.16,1,.3,1) .15s forwards}
.splash-word{display:flex;font-size:27px;font-weight:700;letter-spacing:-.3px;opacity:0;
  animation:splashWordIn .8s cubic-bezier(.16,1,.3,1) .8s forwards}
.splash-word b{color:#6CB33F;font-weight:700}
.splash-word i{color:#1B5FAA;font-style:normal;font-weight:700}
@keyframes splashLogoIn{
  0%{opacity:0;transform:translateY(18px) scale(.78)}
  60%{opacity:1}
  100%{opacity:1;transform:none}
}
@keyframes splashWordIn{
  from{opacity:0;transform:translateY(10px)}
  to{opacity:1;transform:none}
}
@media(prefers-reduced-motion:reduce){
  .splash-logo,.splash-word{animation:none;opacity:1}
  .splash{transition:none}
}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font-family:inherit;font-size:15px;color:var(--text);
  width:100%;padding:12px 14px;border-radius:12px;
  border:1px solid var(--border);background:var(--card)}
input:focus,select:focus{outline:2px solid var(--accent);outline-offset:-1px}
.lbl{font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:600}
.section-lbl{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}

.app{max-width:520px;margin:0 auto;min-height:100vh;position:relative;display:flex;flex-direction:column}
.content{flex:1;overflow:auto;padding:20px 20px 24px;padding-bottom:calc(96px + env(safe-area-inset-bottom))}
.page{display:none}
.page.active{display:block}

.hero{background:linear-gradient(150deg,#FFFFFF 30%,#EAF6EE 100%);border-radius:20px;padding:20px;margin-bottom:12px;box-shadow:var(--shadow)}
.hero .k{font-size:12px;color:var(--muted);margin-bottom:4px}
.hero .v{font-size:29px;font-weight:700;letter-spacing:-.5px}
.hero .v.gross{color:var(--muted)}
.hero2{display:flex;align-items:stretch;gap:14px}
.hero2>div:not(.hero-sep){flex:1;min-width:0}
.hero-sep{width:1px;background:var(--track);flex:none}
.hero .delta{font-size:12px;font-weight:600;margin-top:6px;min-height:16px}
.hero .delta.up{color:var(--red)}
.hero .delta.down{color:var(--accent-dark)}
.hero .sub2{font-size:13px;color:var(--muted);margin-top:6px}
.hero .sub2 b{color:var(--text)}
.hero .pill{display:inline-block;margin-top:6px;padding:5px 10px;border-radius:100px;background:var(--pill);color:var(--accent-text);font-size:12px;font-weight:600}
.donut-wrap{display:flex;align-items:center;gap:16px;background:var(--card);border-radius:16px;padding:14px 16px;box-shadow:var(--shadow);margin-bottom:14px}
.donut-wrap svg{width:96px;height:96px;flex-shrink:0}
.legend{flex:1;display:flex;flex-direction:column;gap:7px;font-size:12.5px}
.legend .li{display:flex;align-items:center;gap:8px}
.legend .dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
.legend .lv{margin-left:auto;font-weight:700}
.dstat{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.dstat .tile .v{font-size:15px}
.toplist{background:var(--card);border-radius:16px;padding:6px 16px;box-shadow:var(--shadow);margin-bottom:14px}
.toplist .tl{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--circle);font-size:13.5px}
.toplist .tl:last-child{border-bottom:none}
.toplist .rank{width:20px;height:20px;border-radius:6px;background:var(--chip);color:var(--accent-text);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.toplist .tn{flex:1;font-weight:600;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toplist .ts{font-size:11.5px;color:var(--muted2)}
.toplist .tv{font-weight:700;flex-shrink:0}
.toplist .tbar{flex:0 0 68px;height:6px;background:var(--track);border-radius:100px;overflow:hidden}
.toplist .tbar>div{height:100%;background:var(--accent);border-radius:100px}
.side2{display:flex;gap:10px;align-items:stretch;margin-bottom:6px}
.side2>div{flex:1;min-width:0}
.stack2{display:flex;flex-direction:column;gap:14px;margin-bottom:14px}
.compactfirm{gap:8px}
.compactfirm .cmp{padding:10px}
.compactfirm .cmp-head{gap:7px;margin-bottom:7px}
.compactfirm .cmp-head .avatar{width:24px;height:24px;font-size:11px;border-radius:7px}
.compactfirm .cmp-head .name{font-size:12px}
.compactfirm .cmp-head .sub{display:none}
.compactfirm .cmp-head .total{font-size:12px}
.donut-col{flex-direction:column;height:calc(100% - 26px);justify-content:center}
.donut-col svg{width:84px;height:84px}
.donut-col .legend{width:100%;font-size:11.5px}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.page.active .hero,.page.active .tiles,.page.active .card,.page.active .monthbars,
.page.active .donut-wrap,.page.active .toplist,.page.active .side2,.page.active .dstat,
.page.active .chart-card,.page.active .rows{animation:fadeUp .35s ease both}
@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.mb .bar{transform-origin:bottom;animation:barGrow .5s ease both}
@keyframes donutIn{from{opacity:0;transform:rotate(-40deg) scale(.85)}to{opacity:1;transform:none}}
#d-donut{animation:donutIn .55s ease both;transform-origin:center}
@keyframes dashIn{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.chart-card path{stroke-dasharray:1;animation:dashIn 1s ease .1s both}
.chart-card circle{opacity:0;animation:fadeUp .3s ease .8s both}
.chart-card{background:var(--card);border-radius:16px;padding:14px;box-shadow:var(--shadow);margin-bottom:14px}
.chart-card svg{width:100%;height:170px;display:block}
.vlist .cam{width:30px;height:30px;border-radius:8px;background:var(--chip);color:var(--accent-text);font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.vlist .undo{color:var(--accent);font-size:12.5px;font-weight:700}
.tiles{display:flex;gap:10px;margin-bottom:10px}
.tile{flex:1;background:var(--card);border-radius:16px;padding:13px 14px;box-shadow:var(--shadow);min-width:0}
.tile .k{font-size:11px;color:var(--muted2);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile .v{font-size:16px;font-weight:600}
.tile .yd{font-size:11px;font-weight:600;margin-top:3px;min-height:14px}
.h2{font-size:14px;font-weight:600;margin-bottom:12px}
.h2row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;margin-top:20px}
.h2row .h2{margin:0}
.h2row .link{font-size:12px;color:var(--accent);font-weight:500}
.page-title{font-size:20px;font-weight:700;margin-bottom:18px}
.card{background:var(--card);border-radius:16px;padding:16px;box-shadow:var(--shadow);margin-bottom:14px}

.rows{display:flex;flex-direction:column;gap:10px}
.crow{display:flex;align-items:center;gap:12px;background:var(--card);border-radius:14px;padding:12px;box-shadow:var(--shadow);cursor:pointer}
.crow .avatar{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:15px}
.crow .mid{flex:1;min-width:0}
.crow .name{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.crow .sub{font-size:12px;color:var(--muted2)}
.crow .right{text-align:right;margin-right:2px}
.crow .amt{font-size:14px;font-weight:600}
.crow .sav{font-size:11px;color:#007834;min-height:13px}
.crow .del{width:26px;height:26px;border-radius:50%;background:var(--circle);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--muted2);font-size:14px}
.crow .free-tag{color:var(--blue)}
.month-group{margin-bottom:20px}
.empty{text-align:center;color:var(--faint);font-size:14px;padding:36px 0}

.seg{display:flex;gap:8px}
.seg button{flex:1;text-align:center;padding:10px 6px;border-radius:10px;font-size:13px;font-weight:600;background:var(--card);color:var(--muted);border:1px solid var(--border)}
.seg button.sel{background:var(--accent);color:#fff;border-color:var(--accent)}
.seg.mini button{padding:7px 4px;font-size:12px;border-radius:9px}

.monthbars{display:flex;align-items:flex-end;gap:10px;height:130px;background:var(--card);border-radius:16px;padding:16px;box-shadow:var(--shadow);margin-bottom:14px}
.mb{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end;min-width:0}
.mb .amt{font-size:9.5px;color:var(--muted);white-space:nowrap}
.mb .bar{width:100%;background:linear-gradient(180deg,#2BA35C,#0E6B33);border-radius:6px 6px 0 0;transition:height .35s ease}
.mb .m{font-size:10.5px;color:var(--muted2)}

.cmp{background:var(--card);border-radius:16px;padding:14px;box-shadow:var(--shadow)}
.cmp-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.cmp-head .avatar{width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:13px}
.cmp-head .mid{flex:1;min-width:0}
.cmp-head .name{font-size:14px;font-weight:600}
.cmp-head .sub{font-size:11px;color:var(--muted2)}
.cmp-head .total{font-size:15px;font-weight:700}
.cmp .track{height:6px;background:var(--track);border-radius:100px;overflow:hidden}
.cmp .fill{height:100%;background:var(--accent);border-radius:100px}

.filters{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.filters select{flex:1;min-width:96px;padding:9px 10px;font-size:13px;border-radius:10px}

.overlay{position:fixed;inset:0;z-index:30;background:var(--bg);display:none;flex-direction:column;max-width:520px;margin:0 auto}
.overlay.active{display:flex}
.ov-head{display:flex;align-items:center;justify-content:space-between;padding:calc(14px + env(safe-area-inset-top)) 20px 6px;flex-shrink:0}
.ov-head .close{width:32px;height:32px;border-radius:50%;background:var(--card);box-shadow:var(--shadow);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--muted)}
.ov-head .title{font-size:16px;font-weight:700}
.ov-body{flex:1;overflow:auto;padding:14px 20px 30px;display:flex;flex-direction:column;gap:16px}
.chips{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
.chip{padding:6px 12px;border-radius:100px;background:var(--chip);color:var(--accent-text);font-size:12px;font-weight:600}
.row2{display:flex;gap:10px}
.row2>div{flex:1;min-width:0}
.calcline{display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:var(--pill);border-radius:10px;padding:9px 12px;font-size:13px;color:var(--accent-text);font-weight:600}
.calcline b{font-size:16px;color:var(--accent-dark)}
.form-err{color:var(--red);font-size:13px;font-weight:600;display:none}
.form-err.show{display:block}
.save-btn{background:var(--accent);color:#fff;text-align:center;padding:15px;border-radius:14px;font-weight:600;font-size:15px;box-shadow:var(--shadow-big);width:100%}
.save-btn:disabled{opacity:.45}
.details-toggle{font-size:13px;color:var(--accent);font-weight:600;text-align:left;padding:2px 0}
#adv-fields{display:none;flex-direction:column;gap:16px}
#adv-fields.open{display:flex}
.switchrow{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--card);border-radius:12px;padding:12px 14px;box-shadow:var(--shadow)}
.switchrow .t{font-size:14px;font-weight:600}
.switchrow .d{font-size:11.5px;color:var(--muted2)}
.sw{position:relative;width:46px;height:27px;flex-shrink:0}
.sw input{opacity:0;width:0;height:0}
.sw i{position:absolute;inset:0;background:var(--track);border-radius:100px;transition:.2s;cursor:pointer;display:block}
.sw i::after{content:"";position:absolute;left:3px;top:3px;width:21px;height:21px;background:#fff;border-radius:50%;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.sw input:checked+i{background:var(--accent)}
.sw input:checked+i::after{transform:translateX(19px)}

.kwh-split{display:flex;align-items:center;gap:6px}
.kwh-split input{text-align:center}
.kwh-split .comma{font-size:22px;font-weight:700;color:var(--muted)}
.loc-row{display:flex;gap:8px}
.loc-row input{flex:1}
.gps-btn{flex-shrink:0;width:48px;border-radius:12px;background:var(--chip);color:var(--accent-text);font-size:18px;border:1px solid var(--border)}

.ob-progress{display:flex;gap:6px;padding:0 20px;margin-top:4px}
.ob-progress div{flex:1;height:4px;border-radius:4px;background:var(--track)}
.ob-progress div.on{background:var(--accent)}
.ob-title{font-size:22px;font-weight:700;letter-spacing:-.3px}
.ob-sub{font-size:13.5px;color:var(--muted);margin-top:4px;margin-bottom:10px}
.country-list{display:flex;flex-direction:column;gap:8px}
.country-item{display:flex;align-items:center;gap:12px;background:var(--card);border-radius:12px;padding:11px 14px;box-shadow:var(--shadow);cursor:pointer;border:2px solid transparent}
.country-item.sel{border-color:var(--accent)}
.country-item .flag{font-size:22px}
.country-item .n{flex:1;font-size:14px;font-weight:600}
.country-item .c{font-size:12px;color:var(--muted2)}
.ev-item{background:var(--card);border-radius:12px;padding:11px 14px;box-shadow:var(--shadow);cursor:pointer;border:2px solid transparent}
.ev-item.sel{border-color:var(--accent)}
.ev-item .n{font-size:14px;font-weight:600}
.ev-item .d{font-size:12px;color:var(--muted2)}
.ev-summary{background:var(--card);border-radius:16px;padding:16px;box-shadow:var(--shadow)}
.ev-summary svg,.ev-summary img.carphoto{width:100%;height:110px;display:block;margin-bottom:6px;object-fit:cover;border-radius:12px}
.ev-summary svg{height:84px;object-fit:unset}
.ev-summary .name{font-size:16px;font-weight:700;text-align:center;margin-bottom:2px}
.ev-summary .trim{font-size:12.5px;color:var(--muted2);text-align:center;margin-bottom:12px}
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.spec{background:var(--bg);border-radius:10px;padding:9px 11px}
.spec .k{font-size:10.5px;color:var(--muted2)}
.spec .v{font-size:13.5px;font-weight:700}
.photo-btn{margin-top:10px;width:100%;background:var(--chip);color:var(--accent-text);font-weight:600;border-radius:10px;padding:10px;font-size:13px}

.setting-btn{display:block;width:100%;text-align:left;background:var(--card);border-radius:12px;padding:13px 14px;font-size:14px;font-weight:600;box-shadow:var(--shadow);margin-bottom:10px}
.setting-btn.danger{color:var(--red)}
.about{font-size:13px;line-height:1.5;color:var(--muted);margin-bottom:20px}
.vlist{list-style:none;margin-bottom:10px}
.vlist li{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:12px;padding:11px 14px;box-shadow:var(--shadow);margin-bottom:8px;font-size:14px}
.vlist .vthumb{width:44px;height:32px;border-radius:8px;object-fit:cover;flex-shrink:0}
.vlist .vn{flex:1;font-weight:600;min-width:0}
.vlist .vd{font-size:11px;color:var(--muted2);font-weight:400}
.vlist .star{font-size:17px;color:var(--faint)}
.vlist .star.on{color:#C87B00}
.vlist .rm{color:var(--red);font-size:15px}
.theme-btn{width:34px;height:34px;border-radius:50%;background:var(--card);box-shadow:var(--shadow);border:1px solid var(--border);font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mini-btn{background:var(--chip);color:var(--accent-text);font-weight:600;border-radius:10px;padding:9px 14px;font-size:13px}

nav{position:fixed;bottom:0;left:0;right:0;z-index:10;max-width:520px;margin:0 auto;
  display:flex;justify-content:space-around;align-items:center;
  padding:8px 0 calc(12px + env(safe-area-inset-bottom));
  background:var(--card);border-top:1px solid #DCDFDC}
nav button{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10.5px;font-weight:500;color:var(--faint);flex:1;min-width:0}
nav button svg{width:22px;height:22px;stroke-width:1.8;stroke:currentColor;fill:none;
  stroke-linecap:round;stroke-linejoin:round;opacity:.6}
nav button.sel svg{opacity:1;stroke-width:2}
nav button span{filter:grayscale(1);opacity:.55}
nav button span:last-child{white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
nav button.sel span{filter:none;opacity:1}
nav button.sel{color:var(--accent)}
@media(max-width:380px){
  nav button{font-size:9px}
}
nav .plus>div{width:58px;height:58px;border-radius:50%;background:var(--card);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 20px rgba(0,104,42,.35);margin-top:-30px;border:3px solid var(--accent)}

.toast{position:fixed;left:50%;bottom:calc(100px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(8px);background:var(--text);color:#fff;padding:10px 18px;border-radius:100px;font-size:13.5px;font-weight:500;opacity:0;transition:all .25s;pointer-events:none;z-index:60;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ---- Tablet / araç ekranı / masaüstü ---- */
@media(min-width:760px){
  .app{max-width:1200px}
  .content{padding:26px 30px 130px}
  .page-title{font-size:24px}
  nav{left:50%;right:auto;transform:translateX(-50%);max-width:560px;width:min(560px,92vw);
    bottom:calc(16px + env(safe-area-inset-bottom));border-radius:24px;border:1px solid var(--border);
    box-shadow:0 12px 34px rgba(0,0,0,.16);padding:6px 10px 8px}
  nav .plus>div{margin-top:-26px}
  .overlay{top:22px;bottom:22px;left:50%;right:auto;transform:translateX(-50%);
    width:min(780px,94vw);max-width:none;border-radius:26px;overflow:hidden;
    box-shadow:0 30px 80px rgba(0,0,0,.28);border:1px solid var(--border)}
  .toast{bottom:110px}
  /* iki sütunlu yerleşim: uzun sayfalar ekranı doldursun */
  #page-dashboard,#page-compare{columns:2;column-gap:26px}
  #page-dashboard>*,#page-compare>*{break-inside:avoid;-webkit-column-break-inside:avoid}
  #page-dashboard>.h2row:first-child,#page-compare>.page-title,#page-dashboard>.seg{column-span:all}
  .h2{break-after:avoid}
  #page-history,#page-settings,#page-vehicle,#page-stats{max-width:820px;margin:0 auto}
  .side2{display:block}
  .side2>div+div{margin-top:14px}
  .donut-col{flex-direction:row;height:auto}
  .donut-col svg{width:110px;height:110px}
}
@media(min-width:1240px){
  #page-dashboard{columns:3}
  #page-history,#page-settings,#page-vehicle,#page-stats{max-width:900px}
  .side2{display:flex}
  .side2>div+div{margin-top:0}
  .donut-col{flex-direction:column}
}
@media(min-width:760px) and (orientation:landscape){
  .content{padding-bottom:120px}
}
</style>
</head>
<body>
<div class="splash" id="splash" aria-hidden="true">
  <img class="splash-logo" src="logo.png" alt="">
  <div class="splash-word"><b>Watt</b><i>Track</i></div>
</div>
<div class="app">
<div class="content">

<!-- ============ ANA SAYFA ============ -->
<section class="page active" id="page-dashboard">
  <div class="h2row" style="margin-top:0;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:8px">
      <img src="logo.png" alt="" style="height:30px;width:auto">
      <div class="ob-title" style="font-size:17px"><span style="color:#6CB33F">Watt</span><span style="color:#1B5FAA">Track</span></div>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <select id="d-vehsel" aria-label="Araç filtresi" style="width:auto;max-width:160px;padding:7px 10px;font-size:12.5px;border-radius:10px"></select>
      <button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button>
    </div>
  </div>

  <div class="seg mini" id="d-period" style="margin-bottom:12px">
    <button data-v="week" data-i18n="week">Hafta</button>
    <button data-v="month" data-i18n="month">Ay</button>
    <button data-v="year" class="sel" data-i18n="year">Yıl</button>
  </div>

  <div class="hero">
    <div class="hero2">
      <div>
        <div class="k"><span id="d-period-lbl">Bu ay</span> · <span data-i18n="netLbl">net</span></div>
        <div class="v" id="d-total">0</div>
        <div class="delta" id="d-delta"></div>
      </div>
      <div class="hero-sep"></div>
      <div>
        <div class="k" data-i18n="grossLbl">indirimsiz</div>
        <div class="v gross" id="d-gross">0</div>
        <div class="pill" id="d-savings"></div>
      </div>
    </div>
  </div>

  <div id="d-odo-wrap" style="display:none">
    <div class="h2" data-i18n="odometer">Kilometre sayacı</div>
    <div class="dstat">
      <div class="tile"><div class="k" data-i18n="odoNow">Araç sayacı</div><div class="v" id="d-odo">—</div></div>
      <div class="tile"><div class="k" data-i18n="odoTracked">Alımdan beri yapılan</div><div class="v" id="d-odo-total">—</div></div>
    </div>
  </div>

  <div class="tiles">
    <div class="tile"><div class="k"><span data-i18n="avgPerKwh">kWh başı</span> · <span data-i18n="netLbl">net</span></div><div class="v" id="d-avg">—</div></div>
    <div class="tile"><div class="k"><span data-i18n="avgPerKwh">kWh başı</span> · <span data-i18n="grossLbl">indirimsiz</span></div><div class="v" id="d-avg-g">—</div></div>
  </div>
  <div class="tiles">
    <div class="tile"><div class="k"><span id="d-1km-lbl">1 km</span> · <span data-i18n="netLbl">net</span></div><div class="v" id="d-1km">—</div></div>
    <div class="tile"><div class="k"><span id="d-1km-lbl2">1 km</span> · <span data-i18n="grossLbl">indirimsiz</span></div><div class="v" id="d-1km-g">—</div></div>
  </div>
  <div class="tiles">
    <div class="tile"><div class="k"><span id="d-100-lbl">100 km</span> · <span data-i18n="netLbl">net</span></div><div class="v" id="d-100">—</div></div>
    <div class="tile"><div class="k"><span id="d-100-lbl2">100 km</span> · <span data-i18n="grossLbl">indirimsiz</span></div><div class="v" id="d-100-g">—</div></div>
  </div>
  <div class="tiles">
    <div class="tile"><div class="k" data-i18n="totalKwhP">Enerji (kWh)</div><div class="v" id="d-kwh">0</div></div>
    <div class="tile"><div class="k" data-i18n="sessionsCompanies">Şarj / Firma</div><div class="v" id="d-sess">0 / 0</div></div>
  </div>
  <div class="tiles" style="margin-bottom:20px">
    <div class="tile"><div class="k" data-i18n="totalDiscP">Alınan indirim</div><div class="v" id="d-disc" style="color:var(--accent-dark)">0</div></div>
    <div class="tile"><div class="k" data-i18n="freeCount">Ücretsiz şarj</div><div class="v" id="d-free" style="color:var(--blue)">0</div></div>
  </div>

  <div class="h2row" style="margin-top:0">
    <div class="h2" data-i18n="detailStats">Detay istatistikler</div>
    <div class="seg mini" id="d-dstat-type" style="width:170px">
      <button data-v="" class="sel" data-i18n="viewAll">Tümü</button>
      <button data-v="DC">DC</button>
      <button data-v="AC">AC</button>
    </div>
  </div>
  <div class="dstat">
    <div class="tile"><div class="k" data-i18n="avgDuration">Ort. şarj süresi</div><div class="v" id="d-dur">—</div></div>
    <div class="tile"><div class="k" data-i18n="avgSocRange">Ort. şarj aralığı</div><div class="v" id="d-soc">—</div></div>
  </div>
  <div class="tiles" style="margin-bottom:20px">
    <div class="tile"><div class="k" data-i18n="chargePower">Ort. şarj gücü</div><div class="v" id="d-power">—</div></div>
  </div>

  <div class="h2" data-i18n="yearlyCompare">Yıllık karşılaştırma</div>
  <div class="tiles">
    <div class="tile"><div class="k" data-i18n="yearlySpendLbl">Toplam harcama (bu yıl)</div><div class="v" id="d-yr-spend">—</div><div class="yd" id="d-yr-spend-d"></div></div>
    <div class="tile"><div class="k" data-i18n="yearlyKwhLbl">Enerji (bu yıl)</div><div class="v" id="d-yr-kwh">—</div><div class="yd" id="d-yr-kwh-d"></div></div>
  </div>
  <div class="tiles" style="margin-bottom:20px">
    <div class="tile"><div class="k" data-i18n="yearlyPriceLbl">kWh fiyatı (bu yıl)</div><div class="v" id="d-yr-price">—</div><div class="yd" id="d-yr-price-d"></div></div>
  </div>

  <div class="h2row" style="margin-top:0">
    <div class="h2" data-i18n="recentCharges">Son şarjlar</div>
    <button class="link" id="d-viewall" data-i18n="viewAll">Tümü</button>
  </div>
  <div class="rows" id="d-recent"></div>
</section>

<!-- ============ İSTATİSTİK ============ -->
<section class="page" id="page-stats">
  <div class="page-title" style="display:flex;justify-content:space-between;align-items:center">
    <span data-i18n="statsTitle">İstatistikler</span>
    <div style="display:flex;align-items:center;gap:8px">
      <select id="s-vehsel" aria-label="Araç filtresi" style="width:auto;max-width:160px;padding:7px 10px;font-size:12.5px;border-radius:10px"></select>
      <button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button>
    </div>
  </div>

  <div class="h2row" style="margin-top:0">
    <div class="h2" data-i18n="spendChart">Harcama grafiği</div>
    <div class="seg mini" id="d-gran" style="width:170px">
      <button data-v="week" data-i18n="week">Hafta</button>
      <button data-v="month" class="sel" data-i18n="month">Ay</button>
      <button data-v="year" data-i18n="year">Yıl</button>
    </div>
  </div>
  <div class="monthbars" id="d-months"></div>

  <div class="h2" data-i18n="weekdayDist">Haftanın günlerine göre dağılım</div>
  <div class="monthbars" id="d-weekdays"></div>

  <div class="h2" data-i18n="firmDist">Firma dağılımı</div>
  <div class="rows" id="d-firms" style="margin-bottom:14px"></div>

  <div class="h2" data-i18n="typeSplit">Şarj tipi dağılımı</div>
  <div class="donut-wrap">
    <svg viewBox="0 0 42 42" id="d-donut"></svg>
    <div class="legend" id="d-donut-legend"></div>
  </div>

  <div class="h2" data-i18n="topBanks">Bankalar (indirim kazancı)</div>
  <div class="toplist" id="d-banks"></div>

  <div class="h2" data-i18n="topLocations">En çok şarj edilen lokasyonlar</div>
  <div class="toplist" id="d-locs"></div>
</section>

<!-- ============ GEÇMİŞ ============ -->
<section class="page" id="page-history">
  <div class="page-title" style="display:flex;justify-content:space-between;align-items:center"><span data-i18n="historyTitle">Geçmiş</span><button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button></div>
  <div class="filters">
    <select id="f-year" aria-label="Yıl filtresi"></select>
    <select id="f-firm" aria-label="Firma filtresi"></select>
    <select id="f-type" aria-label="Tip filtresi"></select>
    <select id="f-veh" aria-label="Araç filtresi" style="display:none"></select>
    <select id="f-bank" aria-label="Banka filtresi"></select>
    <select id="f-loc" aria-label="Lokasyon filtresi"></select>
  </div>
  <div id="h-groups"></div>
</section>

<!-- ============ KIYASLA ============ -->
<section class="page" id="page-compare">
  <div class="page-title" style="display:flex;justify-content:space-between;align-items:center"><span data-i18n="compareTitle">Yakıtlı Araçla Kıyasla</span><button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button></div>

  <div class="card">
    <div id="wrap-c-veh" style="display:none;margin-bottom:14px">
      <div class="lbl" data-i18n="vehicle">Araç</div>
      <select id="c-vehsel" aria-label="Araç filtresi"></select>
    </div>
    <div class="lbl" data-i18n="fuelType">Diğer aracın yakıt tipi</div>
    <div class="seg mini" id="c-fuel" style="margin-bottom:6px">
      <button data-v="petrol" class="sel" data-i18n="petrol">Benzin</button>
      <button data-v="diesel" data-i18n="diesel">Dizel</button>
      <button data-v="hybrid" data-i18n="hybrid">Hibrit</button>
      <button data-v="lpg">LPG</button>
    </div>
    <div class="about" id="c-hybrid-note" style="display:none;margin-bottom:10px;font-size:12px" data-i18n="hybridNote">Şarj edilmeyen (tam) hibritler de litre/100km ile ölçülür — sadece tüketimi düşüktür (~4-5 lt). Şarjlı hibrit (PHEV) için ortalama karma tüketimi gir.</div>
    <div class="row2" style="margin-bottom:14px;margin-top:8px">
      <div>
        <div class="lbl" id="c-price-lbl">Yakıt fiyatı (lt)</div>
        <input type="text" inputmode="decimal" id="c-price" placeholder="47,50">
      </div>
      <div>
        <div class="lbl" id="c-cons-lbl">Tüketim (lt/100km)</div>
        <input type="text" inputmode="decimal" id="c-cons" placeholder="6,5">
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div class="lbl" id="c-icefix-lbl">Yakıtlı aracın yıllık sabit gideri (vergi + sigorta + bakım)</div>
      <input type="text" inputmode="decimal" id="c-icefix" placeholder="0">
      <label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px;cursor:pointer">
        <input type="checkbox" id="c-prorate" checked style="width:16px;height:16px">
        <span data-i18n="prorateLbl">Yıllık giderleri (vergi, sigorta) izlenen döneme oranla</span>
      </label>
      <div class="about" style="margin-top:5px;font-size:11px" data-i18n="iceFixHint">İsteğe bağlı. Benzer bir yakıtlı aracın yıllık vergi, sigorta/kasko ve bakım toplamını yaz — adil kıyas için kendi giderlerinle karşılaştırılır.</div>
    </div>
    <button class="save-btn" id="c-calc" style="box-shadow:none" data-i18n="calc">Kıyasla</button>
  </div>

  <div id="c-result" style="display:none">
    <div class="h2" data-i18n="unitCostTitle">Birim maliyet — EV ve Yakıtlı yan yana</div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-1km-lbl">EV 1 km (net)</div><div class="v" id="c-1km" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" id="c-ice1km-lbl">Yakıtlı 1 km</div><div class="v" id="c-ice1km" style="color:var(--red)">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-ev-lbl">EV 100 km (net)</div><div class="v" id="c-ev" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" id="c-ice-lbl">Yakıtlı 100 km</div><div class="v" id="c-ice" style="color:var(--red)">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-1km-g-lbl">EV 1 km (indirimsiz)</div><div class="v" id="c-1km-g">—</div></div>
      <div class="tile"><div class="k" id="c-evg-lbl">EV 100 km (indirimsiz)</div><div class="v" id="c-ev-g">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-discfx-lbl">İndirim etkisi</div><div class="v" id="c-disc-fx" style="color:var(--accent-dark)">—</div></div>
    </div>
    <div class="hero" style="margin-top:2px">
      <div class="k" id="c-perkm-lbl">Km başına kazanç</div>
      <div class="v" id="c-perkm" style="font-size:28px">—</div>
      <div class="pill" id="c-per100">—</div>
    </div>
    <div class="h2" data-i18n="cumTitle">Bugüne kadar: aynı km yakıtlıyla gidilseydi</div>
    <div class="tiles">
      <div class="tile"><div class="k" data-i18n="evSpent">EV toplam (net)</div><div class="v" id="c-evtot" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" data-i18n="iceWould">Yakıtlıyla olurdu</div><div class="v" id="c-icetot" style="color:var(--blue)">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-dist-lbl">Toplam mesafe</div><div class="v" id="c-dist">—</div></div>
      <div class="tile"><div class="k" data-i18n="totalSaved">Toplam kazanç</div><div class="v" id="c-savetot" style="color:var(--accent-dark)">—</div></div>
    </div>
    <div class="about" id="c-dist-src" style="margin:-6px 0 10px;font-size:11.5px"></div>
    <div class="chart-card">
      <svg id="c-line" viewBox="0 0 340 170" preserveAspectRatio="none"></svg>
      <div class="legend" style="flex-direction:row;justify-content:center;gap:18px;margin-top:8px">
        <div class="li"><span class="dot" style="background:var(--accent)"></span><span data-i18n="evLine">EV (gerçek)</span></div>
        <div class="li"><span class="dot" style="background:var(--blue)"></span><span data-i18n="iceLine">Yakıtlı (aynı km)</span></div>
      </div>
    </div>

    <div class="h2" data-i18n="tcoTitle">Toplam sahip olma maliyeti (şarj + giderler)</div>
    <div class="about" data-i18n="tcoExplain" style="margin:-4px 0 10px;font-size:11.5px">Giderler toplamı, Aracım sekmesine girdiğin vergi, sigorta, bakım gibi kalemlerdir.</div>
    <div class="tiles">
      <div class="tile"><div class="k" data-i18n="tcoExpEv">EV sabit giderleri (Aracım)</div><div class="v" id="c-exptot" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" data-i18n="tcoExpIce">Yakıtlı sabit gider (döneme oranlı)</div><div class="v" id="c-icefixtot" style="color:var(--blue)">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" data-i18n="tcoEv">EV toplam (şarj + gider)</div><div class="v" id="c-tcoev" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" data-i18n="tcoIce">Yakıtlı toplam (gider dahil)</div><div class="v" id="c-tcoice" style="color:var(--blue)">—</div></div>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" id="c-tco1km-lbl">EV 1 km (gider dahil)</div><div class="v" id="c-tco1km" style="color:var(--accent-dark)">—</div></div>
      <div class="tile"><div class="k" id="c-tcoice1km-lbl">Yakıtlı 1 km (gider dahil)</div><div class="v" id="c-tcoice1km" style="color:var(--blue)">—</div></div>
    </div>
    <div class="hero" style="margin-top:2px">
      <div class="k" data-i18n="tcoSaved">Gider dahil toplam kazanç</div>
      <div class="v" id="c-tcosave" style="font-size:26px">—</div>
      <div class="pill" id="c-tcopill">—</div>
    </div>
    <div class="about" id="c-tco-note" style="margin:-4px 0 14px;font-size:11.5px"></div>

    <div id="c-nf-wrap" style="display:none">
      <div class="h2" data-i18n="nonFuelTitle">Yakıt dışı gider kıyaslaması</div>
      <div class="tiles">
        <div class="tile"><div class="k" id="c-nf-ev-km-lbl">—</div><div class="v" id="c-nf-ev-km" style="color:var(--accent-dark)">—</div></div>
        <div class="tile"><div class="k" id="c-nf-ice-km-lbl">—</div><div class="v" id="c-nf-ice-km" style="color:var(--blue)">—</div></div>
      </div>
      <div class="tiles">
        <div class="tile"><div class="k" id="c-nf-ev-100-lbl">—</div><div class="v" id="c-nf-ev-100" style="color:var(--accent-dark)">—</div></div>
        <div class="tile"><div class="k" id="c-nf-ice-100-lbl">—</div><div class="v" id="c-nf-ice-100" style="color:var(--blue)">—</div></div>
      </div>
      <div class="tiles">
        <div class="tile"><div class="k" id="c-nf-ev-yr-lbl">—</div><div class="v" id="c-nf-ev-yr" style="color:var(--accent-dark)">—</div></div>
        <div class="tile"><div class="k" id="c-nf-ice-yr-lbl">—</div><div class="v" id="c-nf-ice-yr" style="color:var(--blue)">—</div></div>
      </div>
      <div class="tiles" style="margin-bottom:14px">
        <div class="tile"><div class="k" id="c-nf-kwh-lbl">—</div><div class="v" id="c-nf-kwh">—</div></div>
      </div>
      <div class="hero" style="margin-top:2px">
        <div class="k" data-i18n="nonFuelDiffYear">Yıllık yakıt dışı gider farkı</div>
        <div class="v" id="c-nf-diff" style="font-size:26px">—</div>
        <div class="pill" id="c-nf-diff-pill">—</div>
      </div>
      <div class="cmp" style="margin:14px 0">
        <div class="cmp-head" style="margin-bottom:6px">
          <div class="mid"><div class="name" data-i18n="nonFuelChart">Yıllık yakıt dışı gider (EV / Yakıtlı)</div></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted2);margin-bottom:3px"><span>EV</span><span id="c-nf-bar-ev-lbl">—</span></div>
        <div class="track" style="margin-bottom:8px"><div class="fill" id="c-nf-bar-ev" style="width:0%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted2);margin-bottom:3px"><span id="c-nf-bar-ice-name">Yakıtlı</span><span id="c-nf-bar-ice-lbl">—</span></div>
        <div class="track"><div class="fill" id="c-nf-bar-ice" style="width:0%;background:var(--blue)"></div></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ ARACIM ============ -->
<section class="page" id="page-vehicle">
  <div class="page-title" style="display:flex;justify-content:space-between;align-items:center"><span data-i18n="vehicleTitle">Aracım</span><button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button></div>

  <div class="section-lbl" data-i18n="vehicles">Araçlarım</div>
  <ul class="vlist" id="set-vehicles"></ul>
  <button class="mini-btn" id="btn-add-vehicle" data-i18n="addVehicle">+ Araç ekle</button>
  <div class="about" style="margin-top:8px" data-i18n="defaultHint">★ varsayılan araç · 📷 fotoğraf ekle/değiştir · × arşivle</div>
  <div class="section-lbl" id="arch-lbl" style="display:none" data-i18n="archived">Arşiv (satılan/kullanılmayan)</div>
  <ul class="vlist" id="set-archived" style="opacity:.75"></ul>

  <div class="card" style="margin-top:20px">
    <div id="wrap-veh-exp" style="display:none;margin-bottom:14px">
      <div class="lbl" data-i18n="vehicle">Araç</div>
      <select id="veh-exp-sel" aria-label="Araç filtresi"></select>
    </div>
    <div class="h2row" style="margin-top:0">
      <div class="h2" id="c-exp-title" data-i18n="expenses">Araç giderleri</div>
      <button class="mini-btn" id="btn-add-exp" style="margin:0">+ <span data-i18n="addExpense">Gider ekle</span></button>
    </div>
    <div class="tiles">
      <div class="tile"><div class="k" data-i18n="totalCostAll">Toplam gider (şarj + sabit)</div><div class="v" id="v-total-cost">—</div></div>
      <div class="tile"><div class="k" data-i18n="fixedExpTotal">Sabit giderler toplamı</div><div class="v" id="v-exp-total" style="color:var(--accent-dark)">—</div></div>
    </div>
    <div id="v-exp-chart-wrap" style="display:none">
      <div class="h2row" style="margin-top:6px">
        <div class="h2" data-i18n="expChart">Sabit gider grafiği</div>
        <div class="seg mini" id="v-exp-gran" style="width:120px">
          <button data-v="month" class="sel" data-i18n="month">Ay</button>
          <button data-v="year" data-i18n="year">Yıl</button>
        </div>
      </div>
      <div class="monthbars" id="v-exp-chart"></div>
    </div>
    <div class="rows" id="c-exp-list"></div>
    <div id="c-exp-cats-wrap" style="display:none">
      <div class="h2" data-i18n="expByCat">Gider dağılımı</div>
      <div class="toplist" id="c-exp-cats"></div>
    </div>
  </div>
</section>

<!-- ============ AYARLAR ============ -->
<section class="page" id="page-settings">
  <div class="page-title" style="display:flex;justify-content:space-between;align-items:center"><span data-i18n="settingsTitle">Ayarlar</span><button class="theme-btn" data-themetoggle aria-label="Tema">🌙</button></div>

  <div class="section-lbl" data-i18n="regionSection">Ülke ve Bölge</div>
  <button class="setting-btn" id="btn-country" style="display:flex;justify-content:space-between;align-items:center">
    <span data-i18n="country">Ülke</span><span id="set-country-val" style="color:var(--muted)"></span>
  </button>
  <div class="lbl" style="margin-top:6px" data-i18n="currency">Para Birimi</div>
  <select id="set-currency" aria-label="Para birimi" style="margin-bottom:12px"></select>
  <div class="lbl" data-i18n="unit">Mesafe Birimi</div>
  <div class="seg" id="set-unit" style="margin-bottom:12px">
    <button data-v="km">km</button>
    <button data-v="mi">mi</button>
  </div>
  <div class="lbl" data-i18n="language">Dil</div>
  <select id="set-lang" aria-label="Dil" style="margin-bottom:12px"></select>
  <div class="lbl" data-i18n="theme">Görünüm</div>
  <div class="seg" id="set-theme" style="margin-bottom:20px">
    <button data-v="light" data-i18n="themeLight">Açık</button>
    <button data-v="dark" data-i18n="themeDark">Koyu</button>
  </div>

  <div class="section-lbl" data-i18n="bankCountries">Banka Ülkelerim</div>
  <div class="chips" id="set-bankc" style="margin:0 0 8px"></div>
  <button class="mini-btn" id="btn-add-bankc" data-i18n="addCountry">+ Ülke ekle</button>
  <div class="about" style="margin-top:8px" data-i18n="bankCountriesD">Kartların hangi ülkelerden ise seç — formdaki banka listesi bunlara göre gelir. Şarj ettiğin ülke değişse de bankaların değişmez.</div>

  <div class="section-lbl" data-i18n="formSection">Kayıt Formu</div>
  <div class="switchrow" style="margin-bottom:20px">
    <div>
      <div class="t" data-i18n="advAlways">Gelişmiş alanlar hep açık</div>
      <div class="d" data-i18n="advAlwaysD">Banka, süre, lokasyon ve şarj aralığı formda açık gelsin</div>
    </div>
    <label class="sw"><input type="checkbox" id="set-adv"><i></i></label>
  </div>

  <div class="section-lbl" data-i18n="dataSection">Veri</div>
  <button class="setting-btn" id="btn-export-json" data-i18n="exportJson">Dışa Aktar (JSON)</button>
  <button class="setting-btn" id="btn-export-csv" data-i18n="exportCsv">Dışa Aktar (CSV — Excel/Power BI)</button>
  <button class="setting-btn" id="btn-import" data-i18n="importJson">Yedeği Geri Yükle (JSON)</button>
  <input type="file" id="file-import" accept=".json" style="display:none">
  <button class="setting-btn danger" id="btn-wipe" data-i18n="reset" style="margin-bottom:22px">Verileri Sıfırla</button>

  <div class="section-lbl" data-i18n="about">Hakkında</div>
  <div class="about" data-i18n="aboutText">WattTrack — tüm verileriniz yalnızca bu cihazda saklanır.</div>
  <div class="about" style="margin-top:-8px">
    <span data-i18n="version">Sürüm</span>: <b id="app-version"></b><br>
    <span data-i18n="contactDev">Soru ve katkı</span>:
    <a href="https://github.com/Rino-06" target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">github.com/Rino-06</a><br>
    <a href="privacy.html" target="_blank" style="color:var(--accent);font-weight:600" data-i18n="privacy">Gizlilik Politikası</a>
  </div>
  <button class="setting-btn" id="btn-rate" style="color:var(--accent-dark)">★ <span data-i18n="rateApp">Play Store'da Değerlendir</span></button>
  <div class="about" data-i18n="supportNote">Bu uygulama tamamen ücretsiz ve reklamsız olarak geliştirilmiştir. Projeye destek olmak veya bir kahve ısmarlamak isterseniz GitHub sayfamıza göz atabilirsiniz.</div>
  <button class="setting-btn" id="btn-support"><span data-i18n="supportDev">GitHub Proje Sayfası</span></button>
</section>

</div>
</div>

<!-- ============ YENİ KAYIT / DÜZENLE ============ -->
<section class="overlay" id="page-add">
  <div class="ov-head">
    <button class="close" id="btn-close-add">×</button>
    <div class="title" id="add-title" data-i18n="addTitle">Yeni Şarj Kaydı</div>
    <div style="width:32px"></div>
  </div>
  <div class="ov-body">

    <div class="row2">
      <div>
        <div class="lbl" data-i18n="date">Tarih</div>
        <input type="date" id="in-date">
      </div>
      <div>
        <div class="lbl" data-i18n="country">Ülke</div>
        <select id="in-country" aria-label="Ülke"></select>
      </div>
    </div>

    <div id="wrap-rate" style="display:none">
      <div class="lbl" id="rate-lbl">Kur</div>
      <input type="text" inputmode="decimal" id="in-rate" placeholder="—">
      <div class="about" style="margin:6px 0 0;font-size:11.5px" id="rate-note"></div>
    </div>

    <div>
      <div class="lbl" data-i18n="chargeType">Şarj Tipi</div>
      <div class="seg" id="in-tip">
        <button data-v="DC" class="sel">DC</button>
        <button data-v="AC">AC</button>
      </div>
    </div>

    <div>
      <div class="lbl" data-i18n="company">Ev ya da Şarj Firması</div>
      <select id="in-firm" aria-label="Şarj firması"></select>
      <input type="text" id="in-firm-other" style="display:none;margin-top:8px" placeholder="">
    </div>

    <div class="row2">
      <div>
        <div class="lbl" data-i18n="kwh">Enerji (kWh)</div>
        <div class="kwh-split">
          <input type="text" id="in-kwh-int" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="45" aria-label="kWh tam kısım">
          <span class="comma">,</span>
          <input type="text" id="in-kwh-dec" inputmode="numeric" pattern="[0-9]*" maxlength="2" placeholder="27" aria-label="kWh ondalık kısım">
        </div>
        <div class="about" style="margin:5px 0 0;font-size:11px" data-i18n="kwhHint">Sol kutu tam kısım, sağ kutu 2 haneli ondalık — 45,27 = 45,27 kWh. Sadece rakam.</div>
      </div>
      <div>
        <div class="lbl" id="in-dist-lbl">Sürülen mesafe (km)</div>
        <input type="number" id="in-dist" inputmode="decimal" min="0" placeholder="0">
      </div>
    </div>

    <div id="wrap-paid">
      <div class="lbl" id="in-amount-lbl">Ödenen Tutar</div>
      <input type="text" inputmode="decimal" id="in-amount" placeholder="0,00">
    </div>

    <div id="wrap-disc">
      <div class="lbl" data-i18n="discountType">İndirim Türü</div>
      <div class="seg" id="in-disc-type" style="margin-bottom:8px">
        <button data-v="amount" class="sel" data-i18n="amountType">Tutar</button>
        <button data-v="percent" data-i18n="percentType">Yüzde (%)</button>
      </div>
      <input type="text" inputmode="decimal" id="in-disc-val" placeholder="0">
      <div class="chips" id="disc-chips"></div>
      <div class="calcline"><span data-i18n="netPaid">Ödenen (net)</span><b id="calc-net">—</b></div>
    </div>

    <div class="switchrow" style="box-shadow:none;border:1px solid var(--border)">
      <div>
        <div class="t" data-i18n="freeCharge">Ücretsiz şarj</div>
        <div class="d" data-i18n="freeChargeD">Kampanya, ev güneş vb. — tutar 0 kaydedilir</div>
      </div>
      <label class="sw"><input type="checkbox" id="in-free"><i></i></label>
    </div>

    <div id="wrap-vehicle" style="display:none">
      <div class="lbl" data-i18n="vehicle">Araç</div>
      <select id="in-vehicle" aria-label="Araç"></select>
    </div>

    <button class="details-toggle" id="btn-adv" type="button">+ Gelişmiş</button>
    <div id="adv-fields">
      <div>
        <div class="lbl" data-i18n="duration">Şarj süresi</div>
        <div class="row2">
          <input type="number" id="in-dur-h" inputmode="numeric" min="0" max="48" placeholder="0">
          <input type="number" id="in-dur-m" inputmode="numeric" min="0" max="59" placeholder="35">
        </div>
        <div class="row2" style="margin-top:4px">
          <div class="lbl" style="text-align:center" data-i18n="hours">saat</div>
          <div class="lbl" style="text-align:center" data-i18n="minutes">dakika</div>
        </div>
      </div>
      <div id="wrap-bank">
        <div class="lbl" data-i18n="bank">Banka / Kampanya</div>
        <select id="in-bank" aria-label="Banka"></select>
      </div>
      <div>
        <div class="lbl" data-i18n="location">Lokasyon</div>
        <div class="loc-row">
          <input type="text" id="in-loc" placeholder="Ankara" list="loc-list" autocomplete="off">
          <button class="gps-btn" id="btn-gps" type="button" title="GPS">📍</button>
        </div>
        <datalist id="loc-list"></datalist>
        <div class="chips" id="loc-chips"></div>
      </div>
      <div>
        <div class="lbl" data-i18n="socRange">Şarj aralığı (%)</div>
        <div class="row2">
          <input type="number" id="in-socb" inputmode="numeric" min="0" max="100" placeholder="20">
          <input type="number" id="in-soca" inputmode="numeric" min="0" max="100" placeholder="80">
        </div>
        <div class="chips" id="soc-chips"></div>
      </div>
      <div>
        <div class="lbl" data-i18n="note">Not</div>
        <input type="text" id="in-note">
      </div>
    </div>

    <div class="form-err" id="form-err" data-i18n="formError">Firma, kWh ve tutar gerekli</div>
    <button class="save-btn" id="btn-save" data-i18n="save">Kaydet</button>
  </div>
</section>

<!-- ============ ONBOARDING ============ -->
<section class="overlay" id="ob">
  <div class="ov-head" style="justify-content:center">
    <div class="title" style="font-size:18px">⚡ WattTrack</div>
  </div>
  <div class="ob-progress"><div class="on" id="obp1"></div><div id="obp2"></div></div>
  <div class="ov-body">

    <div id="ob-step1">
      <div class="ob-title" data-i18n="obWelcome">Hoş geldin!</div>
      <div class="ob-sub" data-i18n="obCountryQ">Hangi ülkede şarj oluyorsun? Para birimi ve mesafe birimini buna göre ayarlayalım.</div>
      <div class="lbl" data-i18n="country">Ülke</div>
      <select id="ob-country" aria-label="Ülke" style="margin-bottom:14px"></select>
      <div class="row2">
        <div>
          <div class="lbl" data-i18n="currency">Para Birimi</div>
          <select id="ob-currency" aria-label="Para birimi"></select>
        </div>
        <div>
          <div class="lbl" data-i18n="unit">Mesafe</div>
          <div class="seg" id="ob-unit">
            <button data-v="km" class="sel">km</button>
            <button data-v="mi">mi</button>
          </div>
        </div>
      </div>
      <div class="lbl" style="margin-top:14px" data-i18n="language">Dil</div>
      <select id="ob-lang" aria-label="Dil"></select>
      <button class="save-btn" id="ob-next" style="margin-top:20px" data-i18n="continue">Devam</button>
    </div>

    <div id="ob-step2" style="display:none">
      <div class="ob-title" data-i18n="obCarQ">Aracını seç</div>
      <div class="ob-sub" data-i18n="obCarSub">Marka veya model yaz — yıl ve donanıma göre farklı batarya sürümlerini ayırt edebilirsin.</div>
      <input type="text" id="ob-ev-search" placeholder="ör. Model Y, Togg, Torres…" style="margin-bottom:12px">
      <div class="rows" id="ob-ev-results"></div>
      <div id="ob-ev-summary" style="display:none;margin-top:14px"></div>
      <button type="button" class="details-toggle" id="ob-change-car" style="display:none" data-i18n="changeCar">Aracı değiştir</button>
      <div id="ob-km-wrap" style="display:none;margin-top:14px">
        <div class="lbl" id="ob-km-lbl" data-i18n="odoAsk">Aracın güncel kilometresi (sayaç)</div>
        <input type="number" id="ob-km" inputmode="numeric" min="0" placeholder="13614">
      </div>
      <div class="row2" style="margin-top:16px">
        <button class="save-btn" id="ob-skip" style="background:var(--card);color:var(--muted);box-shadow:var(--shadow)" data-i18n="skip">Atla</button>
        <button class="save-btn" id="ob-done" disabled data-i18n="start">Başla</button>
      </div>
      <button class="save-btn" id="ob-back" style="margin-top:10px;background:transparent;color:var(--muted);box-shadow:none;border:1px solid var(--border)" data-i18n="back">← Geri</button>
    </div>

  </div>
</section>

<!-- ============ GİDER FORMU ============ -->
<section class="overlay" id="page-expense">
  <div class="ov-head">
    <button class="close" id="btn-close-exp">×</button>
    <div class="title" id="exp-title" data-i18n="addExpense">Gider ekle</div>
    <button class="close" id="btn-del-exp" style="color:var(--red);font-size:18px">🗑</button>
  </div>
  <div class="ov-body">
    <div>
      <div class="lbl" data-i18n="expType">Gider türü</div>
      <select id="in-exp-type" aria-label="Gider türü"></select>
      <input type="text" id="in-exp-altad" style="display:none;margin-top:8px" maxlength="30" placeholder="">
    </div>
    <div class="row2">
      <div>
        <div class="lbl" data-i18n="date">Tarih</div>
        <input type="date" id="in-exp-date" aria-label="Tarih">
      </div>
      <div>
        <div class="lbl" data-i18n="currency">Para birimi</div>
        <select id="in-exp-cur" aria-label="Para birimi"></select>
      </div>
    </div>
    <div>
      <div class="lbl" id="in-exp-amt-lbl">Tutar</div>
      <input type="text" inputmode="decimal" id="in-exp-amount" placeholder="0">
    </div>
    <div id="wrap-exp-veh" style="display:none">
      <div class="lbl" data-i18n="vehicle">Araç</div>
      <select id="in-exp-veh" aria-label="Araç"></select>
    </div>
    <div>
      <div class="lbl" data-i18n="noteLbl">Not</div>
      <input type="text" id="in-exp-note" maxlength="120" placeholder="">
    </div>
    <button class="save-btn" id="btn-save-exp" data-i18n="save">Kaydet</button>
  </div>
</section>

<!-- ============ ÜLKE SEÇİCİ ============ -->
<section class="overlay" id="page-country">
  <div class="ov-head">
    <button class="close" id="btn-close-country">×</button>
    <div class="title" data-i18n="country">Ülke</div>
    <div style="width:32px"></div>
  </div>
  <div class="ov-body">
    <input type="text" id="country-search" placeholder="Ülke ara…">
    <div class="country-list" id="country-list"></div>
  </div>
</section>

<!-- ============ ARAÇ EKLE / DÜZENLE ============ -->
<section class="overlay" id="page-addcar">
  <div class="ov-head">
    <button class="close" id="btn-close-addcar">×</button>
    <div class="title" id="addcar-title" data-i18n="addVehicle">+ Araç ekle</div>
    <div style="width:32px"></div>
  </div>
  <div class="ov-body">
    <input type="text" id="car-search" placeholder="ör. EV6, Torres…">
    <div class="rows" id="car-results"></div>
    <div id="car-summary" style="display:none"></div>
    <input type="file" id="car-photo" accept="image/*" style="display:none">
    <button class="save-btn" id="car-save" disabled data-i18n="add">Ekle</button>
  </div>
</section>

<nav>
  <button data-page="dashboard" class="sel">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.2 9V21h13.6V9"/><path d="M9.8 21v-6.2h4.4V21"/></svg>
    <span data-i18n="navHome">Ana Sayfa</span>
  </button>
  <button data-page="stats">
    <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="20" x2="5" y2="13"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="19" y1="20" x2="19" y2="9"/></svg>
    <span data-i18n="navStats">İstatistik</span>
  </button>
  <button data-page="history">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><polyline points="12 7.5 12 12 15.2 13.8"/></svg>
    <span data-i18n="navHistory">Geçmiş</span>
  </button>
  <button class="plus" id="nav-plus" aria-label="Yeni kayıt">
    <div><img src="nav-plus.png" alt="" style="height:42px;width:auto"></div>
  </button>
  <button data-page="compare">
    <svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="16.5 3.5 20.5 7.5 16.5 11.5"/><line x1="20.5" y1="7.5" x2="8" y2="7.5"/><polyline points="7.5 12.5 3.5 16.5 7.5 20.5"/><line x1="3.5" y1="16.5" x2="16" y2="16.5"/></svg>
    <span data-i18n="navCompare">Kıyasla</span>
  </button>
  <button data-page="vehicle">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 16.8H3v-3a2 2 0 0 1 1.4-1.9l1.7-.6 1.7-3.9a2 2 0 0 1 1.8-1.2h4.8a2 2 0 0 1 1.8 1.2l1.7 3.9 1.7.6A2 2 0 0 1 21 13.8v3h-1.6"/><circle cx="7.7" cy="16.8" r="1.9"/><circle cx="16.3" cy="16.8" r="1.9"/><line x1="9.6" y1="16.8" x2="14.4" y2="16.8"/></svg>
    <span data-i18n="navVehicle">Aracım</span>
  </button>
  <button data-page="settings">
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    <span data-i18n="navSettings">Ayarlar</span>
  </button>
</nav>

<div class="toast" id="toast"></div>

<script src="app.js"></script>
</body>
</html>
</file>

<file path="app.js">
/* ============================================================
   WattTrack v5 — EV şarj harcama takibi
   Veriler yalnızca cihazda (IndexedDB / Dexie.js) saklanır.
   Tek dış bağlantı (opsiyonel): döviz kuru için frankfurter API.
   ============================================================ */

const db = new Dexie('watttrack');
db.version(1).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key'
});
// v2: araç giderleri (vergi, sigorta, bakım…) — sahip olma maliyeti için
db.version(2).stores({
  sessions: '++id, tarih, firma, tip, aracId',
  vehicles: '++id, ad',
  settings: 'key',
  expenses: '++id, tarih, tur, aracId'
});
const EXP_TYPES = ['tax', 'insurance', 'maintenance', 'tire', 'inspection',
                   'repair', 'parking', 'equipment', 'other'];
const EXP_ICON = {tax: '🧾', insurance: '🛡️', maintenance: '🔧', tire: '🛞',
  inspection: '✅', repair: '🛠️', parking: '🅿️', equipment: '🔌', other: '📦'};

const AVATAR_COLORS = ['#1C8742', '#007DAA', '#C87B00', '#A54C8B', '#C25C5F'];
const MI = 1.60934;
const APP_VERSION = 'v19';
const APP_DATE = '26.07.2026';

// ---------- Çeviriler ----------
const T = {
tr:{navStats:'İstatistik',statsTitle:'İstatistikler',ice1:'Yakıtlı 1 {u}',unitCostTitle:'Birim maliyet — EV ve Yakıtlı yan yana',tcoExpEv:'EV sabit giderleri (Aracım)',tcoExpIce:'Yakıtlı sabit gider (döneme oranlı)',tco1kmIce:'Yakıtlı 1 {u} (gider dahil)',tcoExplain:'EV sabit giderleri, Aracım sekmesine girdiğin vergi, sigorta, bakım gibi kalemlerdir. Yakıtlı tarafta, yukarıda girdiğin yıllık sabit gider izlenen döneme oranlanır — iki araç aynı dönemde karşılaştırılır.',totalCostAll:'Toplam gider (şarj + sabit)',fixedExpTotal:'Sabit giderler toplamı',expChart:'Sabit gider grafiği',prorateLbl:'Yıllık giderleri (vergi, sigorta) izlenen döneme oranla',prorateNote:'Yıllık kalemler dönem oranıyla (%{p}) hesaba katıldı; gerçek ödenen toplam {r}.',exp_tax:'Vergi (MTV)',exp_insurance:'Sigorta / Kasko',exp_maintenance:'Bakım / Servis',exp_tire:'Lastik',exp_inspection:'Muayene',exp_repair:'Onarım / Hasar',exp_parking:'Otopark / Otoyol',exp_equipment:'Ekipman (ev şarj cihazı vb.)',exp_other:'Diğer',otherTypePh:'Başlık yaz — örn. Aksesuar, Araç yıkama',addExpense:'Gider ekle',editExpense:'Gideri düzenle',expType:'Gider türü',expenses:'Araç giderleri',expByCat:'Gider dağılımı',expTotal:'Giderler toplamı',expAmount:'Tutar',noteLbl:'Not',amountNeeded:'Tutar gir',noExpenses:'Henüz gider yok. Vergi, sigorta ve bakım tutarlarını ekleyerek gerçek maliyeti gör.',tcoTitle:'Toplam sahip olma maliyeti (şarj + giderler)',tcoEv:'EV toplam (şarj + gider)',tcoIce:'Yakıtlı toplam (gider dahil)',tcoSaved:'Gider dahil toplam kazanç',tco1km:'EV 1 {u} (gider dahil)',tcoNote:'İzlenen dönem {d} gün. Yakıtlı aracın sabit gideri bu döneme oranlandı: {f}.',nonFuelTitle:'Yakıt dışı gider kıyaslaması',nonFuelKm:'{u} başına yakıt dışı gider',nonFuel100:'100 {u} başına yakıt dışı gider',nonFuelYear:'Yıllık yakıt dışı gider',nonFuelKwh:'kWh başına yakıt dışı gider',nonFuelDiffYear:'Yıllık yakıt dışı gider farkı',nonFuelChart:'Yıllık yakıt dışı gider (EV / Yakıtlı)',iceShort:'Yakıtlı',chargePower:'Ort. şarj gücü',yearlyCompare:'Yıllık karşılaştırma',yearlySpendLbl:'Toplam harcama (bu yıl)',yearlyKwhLbl:'Enerji (bu yıl)',yearlyPriceLbl:'kWh fiyatı (bu yıl)',weekdayDist:'Haftanın günlerine göre dağılım',vsLastYear:'geçen yıla göre',iceFixHint:'İsteğe bağlı. Benzer bir yakıtlı aracın yıllık vergi, sigorta ve bakım toplamını yaz — adil kıyas için kendi giderlerinle karşılaştırılır.',ev1:'EV 1 {u} ({x})',supportNote:'Bu uygulama tamamen ücretsiz ve reklamsız olarak geliştirilmiştir. Projeye destek olmak veya bir kahve ısmarlamak isterseniz GitHub sayfamıza göz atabilirsiniz.',version:'Sürüm',contactDev:'Soru ve katkı',privacy:'Gizlilik Politikası',rateApp:'Play Store\u0027da Değerlendir',supportDev:'GitHub Proje Sayfası',kwhHint:'Sol kutu tam kısım, sağ kutu 2 haneli ondalık — 45 , 27 = 45,27 kWh. Sadece rakam girilir.',distFromOdo:'Mesafe kaynağı: kilometre sayacı (araç bilgilerinden)',distFromRecords:'Mesafe kaynağı: kayıtlardaki sürüş mesafeleri',back:'← Geri',changeCar:'Aracı değiştir',navVehicle:'Aracım',vehicleTitle:'Aracım',odoAsk:'Aracın güncel kilometresi (sayaç)',odometer:'Kilometre sayacı',odoNow:'Araç sayacı',odoTracked:'Başlangıçtan beri yapılan',odoPrompt:'Güncel sayaç ({u}):',odoStartPrompt:'Başlangıç/alım sayacı ({u}):',odoSaved:'Kilometre güncellendi',theme:'Görünüm',themeLight:'Açık',themeDark:'Koyu',spendChart:'Harcama grafiği',cumTitle:'Bugüne kadar: aynı km yakıtlıyla gidilseydi',totalDist:'Toplam mesafe',evSpent:'EV toplam (net)',iceWould:'Yakıtlıyla olurdu',totalSaved:'Toplam kazanç',evLine:'EV (gerçek)',iceLine:'Yakıtlı (aynı km)',archived:'Arşiv (satılan/kullanılmayan)',archivedTag:'arşivde — kayıtları korunuyor',archivedToast:'Araç arşive taşındı, kayıtları korunuyor',restore:'Geri al',newBank:'+ Yeni banka ekle…',newBankPrompt:'Banka adı:',importAllDup:'Bu yedekteki tüm kayıtlar zaten mevcut — hiçbir şey eklenmedi.',importPartial:'{n} yeni kayıt eklendi, {d} mükerrer atlandı',netPaid:'Ödenen (net)',typeSplit:'Şarj tipi dağılımı (kWh)',detailStats:'Detay istatistikler',avgDuration:'Ort. şarj süresi',avgSocRange:'Ort. şarj aralığı',topBanks:'Bankalar (indirim kazancı)',topLocations:'En çok şarj edilen lokasyonlar',bankCountries:'Banka Ülkelerim',bankCountriesD:'Kartların hangi ülkelerden ise seç — formdaki banka listesi bunlara göre gelir. Şarj ettiğin ülke değişse de bankaların değişmez.',addCountry:'+ Ülke ekle',prevPeriod:'önceki döneme göre',navHome:'Ana Sayfa',navHistory:'Geçmiş',navCompare:'Kıyasla',navSettings:'Ayarlar',
week:'Hafta',month:'Ay',year:'Yıl',
periodWeek:'Bu hafta toplam',periodMonth:'Bu ay toplam',periodYear:'Bu yıl toplam',
savings:'tasarruf',avgPerKwh:'kWh başı',netLbl:'net',grossLbl:'indirimsiz',
grossTotal:'İndirimsiz toplam',cost100:'100 {u}',
totalKwhP:'Enerji (kWh)',sessionsCompanies:'Şarj / Firma',totalDiscP:'Alınan indirim',
freeCount:'Ücretsiz şarj',weeklySpend:'Haftalık harcama',monthlyTotals:'Aylık Harcama',
firmDist:'Firma dağılımı',recentCharges:'Son şarjlar',viewAll:'Tümü',allVehicles:'Tüm araçlar',
historyTitle:'Geçmiş',allYears:'Tüm yıllar',allFirms:'Tüm firmalar',allTypes:'Tüm tipler',free:'Ücretsiz',
compareTitle:'Yakıtlı Araçla Kıyasla',fuelType:'Diğer aracın yakıt tipi',
petrol:'Benzin',diesel:'Dizel',hybrid:'Hibrit',
hybridNote:'Şarj edilmeyen (tam) hibrit de lt/100km ile ölçülür — sadece tüketimi düşüktür (~4-5 lt). Şarjlı hibrit (PHEV) için ortalama karma tüketimi gir.',
fuelPrice:'Yakıt fiyatı ({s}/lt)',fuelCons:'Tüketim (lt/100km)',calc:'Kıyasla',
evCost:'EV 100 {u} (net)',evCostG:'EV 100 {u} (indirimsiz)',iceCost:'Yakıtlı 100 {u}',
discEffect:'İndirim etkisi / 100 {u}',perUnitSaving:'{u} başına kazanç',
per100:'100 {u} başına {v} kazanç',savingByMonth:'Aylara göre kazanç',
compareNote:'Grafik, kayıtlardaki sürüş mesafesine göre aynı yolu yakıtlı araçla gitseydin aradaki farkı gösterir. Mesafe girilmiş kayıtlar hesaba katılır; kazanç net ödenen üzerinden hesaplanır.',
needData:'Hesap için mesafe girilmiş şarj kaydı gerekli',
settingsTitle:'Ayarlar',regionSection:'Ülke ve Bölge',country:'Ülke',currency:'Para Birimi',
unit:'Mesafe Birimi',language:'Dil',vehicles:'Araçlarım',addVehicle:'+ Araç ekle',
defaultHint:'★ varsayılan · km✎ kilometre · 📷 fotoğraf · × arşivle',
formSection:'Kayıt Formu',advAlways:'Gelişmiş alanlar hep açık',
advAlwaysD:'Banka, süre, lokasyon ve şarj aralığı formda açık gelsin',
dataSection:'Veri',exportJson:'Dışa Aktar (JSON)',exportCsv:'Dışa Aktar (CSV — Excel/Power BI)',
importJson:'Yedeği Geri Yükle (JSON)',reset:'Verileri Sıfırla',about:'Hakkında',
aboutText:'WattTrack tamamen ücretsizdir ve reklam içermez. Tüm verileriniz yalnızca bu cihazda saklanır; hiçbir sunucuya gönderilmez, üçüncü kişilerle paylaşılmaz ve satılmaz. Hesap/üyelik yoktur. Tek ağ kullanımı: yurt dışı kayıtlarda döviz kuru (yalnız para birimi kodları) ve 📍 kullanınca konum servisleri. Cihazlar arası taşıma için JSON yedeğini kullanın.',
addTitle:'Yeni Şarj Kaydı',editTitle:'Kaydı Düzenle',date:'Tarih',chargeType:'Şarj Tipi',
company:'Ev ya da Şarj Firması',homeChip:'Ev',other:'Diğer…',kwh:'Enerji (kWh)',
distance:'Sürülen mesafe ({u})',
freeCharge:'Ücretsiz şarj',freeChargeD:'Kampanya, ev güneş vb. — tutar 0 kaydedilir',
amount:'Tutar — indirim öncesi ({s})',discountType:'İndirim Türü',amountType:'Tutar',percentType:'Yüzde (%)',
bank:'Banka',vehicle:'Araç',advanced:'+ Gelişmiş',advancedHide:'− Gelişmişi gizle',
duration:'Şarj süresi',hours:'saat',minutes:'dakika',location:'Lokasyon',
socRange:'Şarj aralığı % (başlangıç → bitiş)',note:'Not',
rateLbl:'Kur (1 {f} = ? {b})',
rateNote:'Yurt dışı harcama, girilen kurla {b} cinsine çevrilerek istatistiklere katılır. Kur bulunamazsa elle gir.',
rateAuto:'Kur otomatik alındı ({d})',rateNeeded:'Yurt dışı kayıt için kur gerekli',
gpsFail:'Konum alınamadı — izin verildiğinden emin ol',
formError:'Firma, kWh ve tutar gerekli',save:'Kaydet',
deleteAsk:'Bu kayıt silinsin mi?',deleted:'Kayıt silindi',saved:'Kayıt eklendi',updated:'Kayıt güncellendi',
obWelcome:'Hoş geldin!',obCountryQ:'Hangi ülkede şarj oluyorsun? Para birimi ve mesafe birimini buna göre ayarlayalım.',
obCarQ:'Aracını seç',obCarSub:'Marka veya model yaz — yıl ve donanıma göre farklı batarya sürümlerini ayırt et.',
searchCar:'ör. Model Y, Togg, Torres…',continue:'Devam',skip:'Atla',start:'Başla',
battery:'Batarya',arch:'Mimari',dcMax:'Maks DC',acMax:'AC',range:'Menzil (WLTP)',
addPhoto:'📷 Fotoğraf ekle',changePhoto:'📷 Fotoğrafı değiştir',
customAdd:'"{q}" adıyla özel araç ekle',vehicleAdded:'Araç eklendi',photoAdded:'Fotoğraf eklendi',add:'Ekle',
wipeAsk1:'TÜM kayıtlar, araçlar ve ayarlar silinecek. Emin misin?',wipeAsk2:'Geri alınamaz. Silinsin mi?',
wiped:'Tüm veriler silindi',imported:'Yedek geri yüklendi',
importFail:'Dosya geçerli bir WattTrack yedeği değil',importAsk:'kayıt içe aktarılacak. Birleştirilsin mi?',
jsonDone:'JSON yedek indirildi',csvDone:'CSV indirildi',noData:'Henüz kayıt yok',sessions:'şarj'},

en:{navStats:'Stats',statsTitle:'Statistics',ice1:'Fuel per 1 {u}',unitCostTitle:'Unit cost — EV and fuel side by side',tcoExpEv:'EV fixed expenses (My Vehicle)',tcoExpIce:'Fuel car fixed cost (prorated)',tco1kmIce:'Fuel per 1 {u} (with expenses)',tcoExplain:'EV fixed expenses are the tax, insurance and maintenance items you entered in My Vehicle. On the fuel side, the yearly fixed cost you entered above is prorated to the tracked period — both cars are compared over the same period.',totalCostAll:'Total cost (charging + fixed)',fixedExpTotal:'Fixed expenses total',expChart:'Fixed expense chart',prorateLbl:'Prorate yearly expenses (tax, insurance) to the tracked period',prorateNote:'Yearly items counted at {p}% of the period; actually paid in total {r}.',exp_tax:'Tax',exp_insurance:'Insurance',exp_maintenance:'Maintenance / Service',exp_tire:'Tires',exp_inspection:'Inspection',exp_repair:'Repair / Damage',exp_parking:'Parking / Tolls',exp_equipment:'Equipment (home charger etc.)',exp_other:'Other',otherTypePh:'Type a title — e.g. Accessories, Car wash',addExpense:'Add expense',editExpense:'Edit expense',expType:'Expense type',expenses:'Vehicle expenses',expByCat:'Expenses by category',expTotal:'Total expenses',expAmount:'Amount',noteLbl:'Note',amountNeeded:'Enter an amount',noExpenses:'No expenses yet. Add tax, insurance and maintenance to see your true cost.',tcoTitle:'Total cost of ownership (charging + expenses)',tcoEv:'EV total (charging + expenses)',tcoIce:'Fuel car total (with expenses)',tcoSaved:'Total saved incl. expenses',tco1km:'EV per 1 {u} (with expenses)',tcoNote:'Tracked period {d} days. Fixed cost of the fuel car prorated for this period: {f}.',nonFuelTitle:'Non-fuel expense comparison',nonFuelKm:'Non-fuel cost per {u}',nonFuel100:'Non-fuel cost per 100 {u}',nonFuelYear:'Yearly non-fuel cost',nonFuelKwh:'Non-fuel cost per kWh',nonFuelDiffYear:'Yearly non-fuel cost difference',nonFuelChart:'Yearly non-fuel cost (EV / Fuel)',iceShort:'Fuel',chargePower:'Avg charging power',yearlyCompare:'Yearly comparison',yearlySpendLbl:'Total spend (this year)',yearlyKwhLbl:'Energy (this year)',yearlyPriceLbl:'Price per kWh (this year)',weekdayDist:'By day of week',vsLastYear:'vs last year',iceFixHint:'Optional. Enter the yearly tax, insurance and maintenance total of a comparable fuel car for a fair comparison.',ev1:'EV per 1 {u} ({x})',supportNote:'This app is developed completely free and ad-free. If you would like to support the project or buy a coffee, feel free to visit our GitHub page.',version:'Version',contactDev:'Questions & contributions',privacy:'Privacy Policy',rateApp:'Rate on Play Store',supportDev:'GitHub Project Page',kwhHint:'Left box whole part, right box 2-digit decimals — 45 , 27 = 45.27 kWh. Digits only.',distFromOdo:'Distance source: odometer (from vehicle info)',distFromRecords:'Distance source: per-record distances',back:'← Back',changeCar:'Change vehicle',navVehicle:'My Vehicle',vehicleTitle:'My Vehicle',odoAsk:'Current odometer reading',odometer:'Odometer',odoNow:'Odometer',odoTracked:'Driven since start',odoPrompt:'Current odometer ({u}):',odoStartPrompt:'Starting/purchase odometer ({u}):',odoSaved:'Odometer updated',theme:'Appearance',themeLight:'Light',themeDark:'Dark',spendChart:'Spending chart',cumTitle:'To date: same km with a fuel car',totalDist:'Total distance',evSpent:'EV total (net)',iceWould:'Would cost (fuel)',totalSaved:'Total saved',evLine:'EV (actual)',iceLine:'Fuel (same km)',archived:'Archive (sold/unused)',archivedTag:'archived — records kept',archivedToast:'Vehicle archived, its records are kept',restore:'Restore',newBank:'+ Add new bank…',newBankPrompt:'Bank name:',importAllDup:'All records in this backup already exist — nothing was added.',importPartial:'{n} new records added, {d} duplicates skipped',netPaid:'Paid (net)',typeSplit:'Charge type split (kWh)',detailStats:'Detail statistics',avgDuration:'Avg charge time',avgSocRange:'Avg SoC range',topBanks:'Banks (discount savings)',topLocations:'Most charged locations',bankCountries:'My Bank Countries',bankCountriesD:'Pick the countries your cards are from — the bank list in the form follows these. Your banks don’t change when the charging country does.',addCountry:'+ Add country',prevPeriod:'vs previous period',navHome:'Home',navHistory:'History',navCompare:'Compare',navSettings:'Settings',
week:'Week',month:'Month',year:'Year',
periodWeek:'This week total',periodMonth:'This month total',periodYear:'This year total',
savings:'saved',avgPerKwh:'Per kWh',netLbl:'net',grossLbl:'w/o discount',
grossTotal:'Total before discounts',cost100:'Per 100 {u}',
totalKwhP:'Energy (kWh)',sessionsCompanies:'Sessions / Companies',totalDiscP:'Discounts received',
freeCount:'Free charges',weeklySpend:'Weekly spend',monthlyTotals:'Monthly Spend',
firmDist:'By company',recentCharges:'Recent charges',viewAll:'View all',allVehicles:'All vehicles',
historyTitle:'History',allYears:'All years',allFirms:'All companies',allTypes:'All types',free:'Free',
compareTitle:'Compare vs Fuel Car',fuelType:'Other car fuel type',
petrol:'Petrol',diesel:'Diesel',hybrid:'Hybrid',
hybridNote:'A full (non-plug-in) hybrid is also measured in L/100km — it simply uses less (~4-5 L). For a PHEV, enter your average combined consumption.',
fuelPrice:'Fuel price ({s}/L)',fuelCons:'Consumption (L/100km)',calc:'Compare',
evCost:'EV per 100 {u} (net)',evCostG:'EV per 100 {u} (gross)',iceCost:'Fuel per 100 {u}',
discEffect:'Discount effect / 100 {u}',perUnitSaving:'Saving per {u}',
per100:'{v} saved per 100 {u}',savingByMonth:'Savings by month',
compareNote:'The chart shows savings vs driving the same recorded distance in a fuel car. Records with distance are used; savings use net paid amounts.',
needData:'Add charges with distance to calculate',
settingsTitle:'Settings',regionSection:'Country & Region',country:'Country',currency:'Currency',
unit:'Distance Unit',language:'Language',vehicles:'My Vehicles',addVehicle:'+ Add vehicle',
defaultHint:'★ default · km✎ odometer · 📷 photo · × archive',
formSection:'Charge Form',advAlways:'Advanced fields always open',
advAlwaysD:'Bank, duration, location and SoC range shown by default',
dataSection:'Data',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Restore Backup (JSON)',reset:'Reset Data',about:'About',
aboutText:'WattTrack is completely free and ad-free. All your data stays on this device only; nothing is sent to any server, shared with third parties, or sold. No account needed. Only network use: exchange rates for foreign records (currency codes only) and location services when you tap 📍. Use the JSON backup to move data between devices.',
addTitle:'New Charge',editTitle:'Edit Charge',date:'Date',chargeType:'Charge Type',
company:'Home or Charging Company',homeChip:'Home',other:'Other…',kwh:'Energy (kWh)',
distance:'Distance driven ({u})',
freeCharge:'Free charge',freeChargeD:'Promo, home solar etc. — saved as 0',
amount:'Amount — before discount ({s})',discountType:'Discount Type',amountType:'Amount',percentType:'Percent (%)',
bank:'Bank',vehicle:'Vehicle',advanced:'+ Advanced',advancedHide:'− Hide advanced',
duration:'Charge time',hours:'hours',minutes:'minutes',location:'Location',
socRange:'SoC range % (start → end)',note:'Note',
rateLbl:'Rate (1 {f} = ? {b})',
rateNote:'Foreign spend is converted to {b} at the entered rate for statistics. Enter manually if not found.',
rateAuto:'Rate fetched automatically ({d})',rateNeeded:'Rate required for a foreign record',
gpsFail:'Could not get location — check permission',
formError:'Company, kWh and amount are required',save:'Save',
deleteAsk:'Delete this record?',deleted:'Record deleted',saved:'Charge saved',updated:'Charge updated',
obWelcome:'Welcome!',obCountryQ:'Where do you charge? We will set currency and distance unit accordingly.',
obCarQ:'Pick your car',obCarSub:'Type a brand or model — tell versions apart by year, trim and battery.',
searchCar:'e.g. Model Y, ID.4, Torres…',continue:'Continue',skip:'Skip',start:'Start',
battery:'Battery',arch:'Architecture',dcMax:'Max DC',acMax:'AC',range:'Range (WLTP)',
addPhoto:'📷 Add photo',changePhoto:'📷 Replace photo',
customAdd:'Add "{q}" as custom vehicle',vehicleAdded:'Vehicle added',photoAdded:'Photo added',add:'Add',
wipeAsk1:'ALL records, vehicles and settings will be deleted. Sure?',wipeAsk2:'Cannot be undone. Delete?',
wiped:'All data deleted',imported:'Backup restored',
importFail:'Not a valid WattTrack backup',importAsk:'records will be imported. Merge?',
jsonDone:'JSON backup downloaded',csvDone:'CSV downloaded',noData:'No records yet',sessions:'sessions'},

de:{navStats:'Statistik',statsTitle:'Statistiken',ice1:'Verbrenner 1 {u}',unitCostTitle:'Kosten pro Einheit — EV und Verbrenner nebeneinander',tcoExpEv:'EV-Fixkosten (Mein Auto)',tcoExpIce:'Fixkosten Verbrenner (anteilig)',tco1kmIce:'Verbrenner 1 {u} (mit Kosten)',tcoExplain:'Die EV-Fixkosten sind die unter „Mein Auto" eingetragenen Posten (Steuer, Versicherung, Wartung). Beim Verbrenner werden die oben eingegebenen jährlichen Fixkosten anteilig auf den Zeitraum umgelegt — beide Autos werden über denselben Zeitraum verglichen.',totalCostAll:'Gesamtkosten (Laden + fix)',fixedExpTotal:'Fixkosten gesamt',expChart:'Fixkosten-Diagramm',prorateLbl:'Jährliche Kosten (Steuer, Versicherung) anteilig rechnen',prorateNote:'Jährliche Posten zu {p}% angerechnet; tatsächlich gezahlt {r}.',exp_tax:'Steuer',exp_insurance:'Versicherung',exp_maintenance:'Wartung / Service',exp_tire:'Reifen',exp_inspection:'Hauptuntersuchung',exp_repair:'Reparatur / Schaden',exp_parking:'Parken / Maut',exp_equipment:'Ausstattung (Wallbox usw.)',exp_other:'Sonstiges',otherTypePh:'Titel eingeben — z.B. Zubehör, Autowäsche',addExpense:'Ausgabe hinzufügen',editExpense:'Ausgabe bearbeiten',expType:'Ausgabenart',expenses:'Fahrzeugkosten',expByCat:'Kosten nach Kategorie',expTotal:'Kosten gesamt',expAmount:'Betrag',noteLbl:'Notiz',amountNeeded:'Betrag eingeben',noExpenses:'Noch keine Kosten. Steuer, Versicherung und Wartung eintragen für die echten Kosten.',tcoTitle:'Gesamtkosten (Laden + Fixkosten)',tcoEv:'EV gesamt (Laden + Kosten)',tcoIce:'Verbrenner gesamt (mit Kosten)',tcoSaved:'Gesamtersparnis inkl. Kosten',tco1km:'EV pro 1 {u} (mit Kosten)',tcoNote:'Zeitraum {d} Tage. Fixkosten des Verbrenners anteilig: {f}.',nonFuelTitle:'Vergleich Nebenkosten (ohne Kraftstoff)',nonFuelKm:'Nebenkosten pro {u}',nonFuel100:'Nebenkosten pro 100 {u}',nonFuelYear:'Jährliche Nebenkosten',nonFuelKwh:'Nebenkosten pro kWh',nonFuelDiffYear:'Jährliche Nebenkosten-Differenz',nonFuelChart:'Jährliche Nebenkosten (EV / Verbrenner)',iceShort:'Verbrenner',chargePower:'Ø Ladeleistung',yearlyCompare:'Jahresvergleich',yearlySpendLbl:'Gesamtausgaben (dieses Jahr)',yearlyKwhLbl:'Energie (dieses Jahr)',yearlyPriceLbl:'Preis pro kWh (dieses Jahr)',weekdayDist:'Nach Wochentag',vsLastYear:'ggü. Vorjahr',iceFixHint:'Optional. Jährliche Steuer, Versicherung und Wartung eines vergleichbaren Verbrenners eintragen.',ev1:'EV pro 1 {u} ({x})',supportNote:'Diese App ist völlig kostenlos und werbefrei. Wenn Sie das Projekt unterstützen möchten, besuchen Sie gern unsere GitHub-Seite.',version:'Version',contactDev:'Fragen & Beiträge',privacy:'Datenschutz',rateApp:'Im Play Store bewerten',supportDev:'GitHub-Projektseite',kwhHint:'Links Ganzzahl, rechts 2 Dezimalstellen — 45 , 27 = 45,27 kWh. Nur Ziffern.',distFromOdo:'Distanzquelle: Kilometerstand (Fahrzeugdaten)',distFromRecords:'Distanzquelle: Distanzen der Einträge',back:'← Zurück',changeCar:'Fahrzeug ändern',navVehicle:'Mein Auto',vehicleTitle:'Mein Auto',odoAsk:'Aktueller Kilometerstand',odometer:'Kilometerstand',odoNow:'Tachostand',odoTracked:'Seit Beginn gefahren',odoPrompt:'Aktueller Stand ({u}):',odoStartPrompt:'Anfangs-/Kaufstand ({u}):',odoSaved:'Kilometerstand aktualisiert',theme:'Darstellung',themeLight:'Hell',themeDark:'Dunkel',spendChart:'Ausgabendiagramm',cumTitle:'Bisher: gleiche km mit Verbrenner',totalDist:'Gesamtstrecke',evSpent:'EV gesamt (netto)',iceWould:'Verbrenner-Kosten',totalSaved:'Gesamt gespart',evLine:'EV (real)',iceLine:'Verbrenner (gleiche km)',archived:'Archiv (verkauft/ungenutzt)',archivedTag:'archiviert — Einträge bleiben',archivedToast:'Fahrzeug archiviert, Einträge bleiben erhalten',restore:'Wiederherstellen',newBank:'+ Neue Bank…',newBankPrompt:'Bankname:',importAllDup:'Alle Einträge existieren bereits — nichts hinzugefügt.',importPartial:'{n} neue Einträge, {d} Duplikate übersprungen',netPaid:'Bezahlt (netto)',typeSplit:'Ladetyp-Verteilung (kWh)',detailStats:'Detail-Statistiken',avgDuration:'Ø Ladedauer',avgSocRange:'Ø Ladebereich',topBanks:'Banken (Rabattersparnis)',topLocations:'Häufigste Ladeorte',bankCountries:'Meine Bankländer',bankCountriesD:'Wähle die Länder deiner Karten — die Bankliste im Formular folgt diesen. Deine Banken ändern sich nicht mit dem Ladeland.',addCountry:'+ Land hinzufügen',prevPeriod:'ggü. Vorperiode',navHome:'Start',navHistory:'Verlauf',navCompare:'Vergleich',navSettings:'Einstellungen',
week:'Woche',month:'Monat',year:'Jahr',
periodWeek:'Diese Woche gesamt',periodMonth:'Dieser Monat gesamt',periodYear:'Dieses Jahr gesamt',
savings:'gespart',avgPerKwh:'Pro kWh',netLbl:'netto',grossLbl:'ohne Rabatt',
grossTotal:'Summe ohne Rabatte',cost100:'Pro 100 {u}',
totalKwhP:'Energie (kWh)',sessionsCompanies:'Ladungen / Anbieter',totalDiscP:'Erhaltene Rabatte',
freeCount:'Gratis-Ladungen',weeklySpend:'Wochenausgaben',monthlyTotals:'Monatsausgaben',
firmDist:'Nach Anbieter',recentCharges:'Letzte Ladungen',viewAll:'Alle',allVehicles:'Alle Fahrzeuge',
historyTitle:'Verlauf',allYears:'Alle Jahre',allFirms:'Alle Anbieter',allTypes:'Alle Typen',free:'Gratis',
compareTitle:'Vergleich mit Verbrenner',fuelType:'Kraftstoff des anderen Autos',
petrol:'Benzin',diesel:'Diesel',hybrid:'Hybrid',
hybridNote:'Auch ein Vollhybrid wird in L/100km gemessen — er verbraucht nur weniger (~4-5 L). Für PHEV den kombinierten Durchschnitt eingeben.',
fuelPrice:'Kraftstoffpreis ({s}/L)',fuelCons:'Verbrauch (L/100km)',calc:'Vergleichen',
evCost:'EV pro 100 {u} (netto)',evCostG:'EV pro 100 {u} (brutto)',iceCost:'Verbrenner 100 {u}',
discEffect:'Rabatteffekt / 100 {u}',perUnitSaving:'Ersparnis pro {u}',
per100:'{v} pro 100 {u} gespart',savingByMonth:'Ersparnis nach Monat',
compareNote:'Das Diagramm zeigt die Ersparnis gegenüber derselben Strecke mit einem Verbrenner. Einträge mit Distanz werden verwendet; netto berechnet.',
needData:'Ladungen mit Distanz erforderlich',
settingsTitle:'Einstellungen',regionSection:'Land & Region',country:'Land',currency:'Währung',
unit:'Entfernungseinheit',language:'Sprache',vehicles:'Meine Fahrzeuge',addVehicle:'+ Fahrzeug',
defaultHint:'★ Standard · km✎ Kilometerstand · 📷 Foto · × Archiv',
formSection:'Ladeformular',advAlways:'Erweiterte Felder immer offen',
advAlwaysD:'Bank, Dauer, Ort und Ladebereich standardmäßig anzeigen',
dataSection:'Daten',exportJson:'Export (JSON)',exportCsv:'Export (CSV — Excel/Power BI)',
importJson:'Backup wiederherstellen (JSON)',reset:'Daten zurücksetzen',about:'Info',
aboutText:'WattTrack — alle Daten bleiben auf diesem Gerät. Kostenlos, werbefrei; Daten werden nicht mit Dritten geteilt. Einzige Ausnahme: für Auslandseinträge wird der Wechselkurs online abgerufen (nur Währungscodes werden übertragen).',
addTitle:'Neue Ladung',editTitle:'Ladung bearbeiten',date:'Datum',chargeType:'Ladetyp',
company:'Zuhause oder Anbieter',homeChip:'Zuhause',other:'Andere…',kwh:'Energie (kWh)',
distance:'Gefahrene Strecke ({u})',
freeCharge:'Gratis-Ladung',freeChargeD:'Aktion, Solar usw. — als 0 gespeichert',
amount:'Betrag — vor Rabatt ({s})',discountType:'Rabattart',amountType:'Betrag',percentType:'Prozent (%)',
bank:'Bank',vehicle:'Fahrzeug',advanced:'+ Erweitert',advancedHide:'− Erweitert ausblenden',
duration:'Ladedauer',hours:'Std.',minutes:'Min.',location:'Ort',
socRange:'Ladebereich % (Start → Ende)',note:'Notiz',
rateLbl:'Kurs (1 {f} = ? {b})',
rateNote:'Auslandsausgaben werden zum eingegebenen Kurs in {b} umgerechnet. Bei Bedarf manuell eingeben.',
rateAuto:'Kurs automatisch geladen ({d})',rateNeeded:'Kurs für Auslandseintrag erforderlich',
gpsFail:'Standort nicht verfügbar — Berechtigung prüfen',
formError:'Anbieter, kWh und Betrag erforderlich',save:'Speichern',
deleteAsk:'Eintrag löschen?',deleted:'Eintrag gelöscht',saved:'Ladung gespeichert',updated:'Ladung aktualisiert',
obWelcome:'Willkommen!',obCountryQ:'Wo lädst du? Währung und Einheit werden entsprechend gesetzt.',
obCarQ:'Wähle dein Auto',obCarSub:'Marke oder Modell eingeben — Versionen nach Jahr und Akku unterscheiden.',
searchCar:'z.B. ID.4, EV6, Torres…',continue:'Weiter',skip:'Überspringen',start:'Los',
battery:'Akku',arch:'Architektur',dcMax:'Max DC',acMax:'AC',range:'Reichweite',
addPhoto:'📷 Foto hinzufügen',changePhoto:'📷 Foto ersetzen',
customAdd:'"{q}" als eigenes Fahrzeug',vehicleAdded:'Fahrzeug hinzugefügt',photoAdded:'Foto hinzugefügt',add:'Hinzufügen',
wipeAsk1:'ALLE Daten werden gelöscht. Sicher?',wipeAsk2:'Nicht rückgängig. Löschen?',
wiped:'Alle Daten gelöscht',imported:'Backup wiederhergestellt',
importFail:'Kein gültiges WattTrack-Backup',importAsk:'Einträge werden importiert. Zusammenführen?',
jsonDone:'JSON-Backup heruntergeladen',csvDone:'CSV heruntergeladen',noData:'Noch keine Einträge',sessions:'Ladungen'},

fr:{navStats:'Stats',statsTitle:'Statistiques',ice1:'Thermique 1 {u}',unitCostTitle:'Coût unitaire — VE et thermique côte à côte',tcoExpEv:'Frais fixes VE (Mon véhicule)',tcoExpIce:'Frais fixes thermique (au prorata)',tco1kmIce:'Thermique 1 {u} (avec dépenses)',tcoExplain:'Les frais fixes VE sont les postes (taxe, assurance, entretien) saisis dans Mon véhicule. Côté thermique, les frais fixes annuels saisis ci-dessus sont proratisés sur la période suivie — les deux voitures sont comparées sur la même période.',totalCostAll:'Coût total (recharge + fixes)',fixedExpTotal:'Total frais fixes',expChart:'Graphique des frais fixes',prorateLbl:'Proratiser les frais annuels (taxe, assurance) sur la période',prorateNote:'Postes annuels comptés à {p}% ; total réellement payé {r}.',exp_tax:'Taxe',exp_insurance:'Assurance',exp_maintenance:'Entretien / Révision',exp_tire:'Pneus',exp_inspection:'Contrôle technique',exp_repair:'Réparation',exp_parking:'Parking / Péage',exp_equipment:'Équipement (borne, etc.)',exp_other:'Autre',otherTypePh:'Saisir un titre — ex. Accessoires, Lavage',addExpense:'Ajouter une dépense',editExpense:'Modifier la dépense',expType:'Type de dépense',expenses:'Dépenses du véhicule',expByCat:'Dépenses par catégorie',expTotal:'Total des dépenses',expAmount:'Montant',noteLbl:'Note',amountNeeded:'Saisir un montant',noExpenses:'Aucune dépense. Ajoutez taxe, assurance et entretien pour voir le coût réel.',tcoTitle:'Coût total de possession (recharge + dépenses)',tcoEv:'VE total (recharge + dépenses)',tcoIce:'Thermique total (avec dépenses)',tcoSaved:'Économie totale avec dépenses',tco1km:'VE / 1 {u} (avec dépenses)',tcoNote:'Période suivie {d} jours. Coûts fixes du thermique au prorata : {f}.',nonFuelTitle:'Comparaison des frais hors carburant',nonFuelKm:'Frais hors carburant par {u}',nonFuel100:'Frais hors carburant par 100 {u}',nonFuelYear:'Frais hors carburant annuels',nonFuelKwh:'Frais hors carburant par kWh',nonFuelDiffYear:'Différence annuelle des frais hors carburant',nonFuelChart:'Frais hors carburant annuels (VE / Thermique)',iceShort:'Thermique',chargePower:'Puissance moy. de charge',yearlyCompare:'Comparaison annuelle',yearlySpendLbl:'Dépenses totales (cette année)',yearlyKwhLbl:'Énergie (cette année)',yearlyPriceLbl:'Prix au kWh (cette année)',weekdayDist:'Par jour de la semaine',vsLastYear:'vs année précédente',iceFixHint:'Facultatif. Indiquez le total annuel taxe, assurance et entretien d une voiture thermique comparable.',ev1:'VE / 1 {u} ({x})',supportNote:'Cette application est entièrement gratuite et sans publicité. Pour soutenir le projet, visitez notre page GitHub.',version:'Version',contactDev:'Questions et contributions',privacy:'Confidentialité',rateApp:'Noter sur le Play Store',supportDev:'Page GitHub du projet',kwhHint:'Gauche : entier, droite : 2 décimales — 45 , 27 = 45,27 kWh. Chiffres uniquement.',distFromOdo:'Source distance : compteur (infos véhicule)',distFromRecords:'Source distance : distances des charges',back:'← Retour',changeCar:'Changer de véhicule',navVehicle:'Mon véhicule',vehicleTitle:'Mon véhicule',odoAsk:'Kilométrage actuel',odometer:'Compteur',odoNow:'Compteur',odoTracked:'Parcourus depuis le début',odoPrompt:'Compteur actuel ({u}) :',odoStartPrompt:'Compteur initial ({u}) :',odoSaved:'Compteur mis à jour',theme:'Apparence',themeLight:'Clair',themeDark:'Sombre',spendChart:'Graphique des dépenses',cumTitle:'À ce jour : mêmes km en thermique',totalDist:'Distance totale',evSpent:'VE total (net)',iceWould:'Coût thermique',totalSaved:'Économie totale',evLine:'VE (réel)',iceLine:'Thermique (mêmes km)',archived:'Archive (vendu/inutilisé)',archivedTag:'archivé — charges conservées',archivedToast:'Véhicule archivé, ses charges sont conservées',restore:'Restaurer',newBank:'+ Nouvelle banque…',newBankPrompt:'Nom de la banque :',importAllDup:'Toutes les charges existent déjà — rien ajouté.',importPartial:'{n} nouvelles charges, {d} doublons ignorés',netPaid:'Payé (net)',typeSplit:'Répartition par type (kWh)',detailStats:'Statistiques détaillées',avgDuration:'Durée moy.',avgSocRange:'Plage moy.',topBanks:'Banques (gains remises)',topLocations:'Lieux les plus utilisés',bankCountries:'Mes pays bancaires',bankCountriesD:'Choisissez les pays de vos cartes — la liste des banques suit ces pays. Vos banques ne changent pas avec le pays de charge.',addCountry:'+ Ajouter un pays',prevPeriod:'vs période précédente',navHome:'Accueil',navHistory:'Historique',navCompare:'Comparer',navSettings:'Réglages',
week:'Semaine',month:'Mois',year:'Année',
periodWeek:'Total cette semaine',periodMonth:'Total ce mois',periodYear:'Total cette année',
savings:'économisé',avgPerKwh:'Par kWh',netLbl:'net',grossLbl:'sans remise',
grossTotal:'Total sans remises',cost100:'Par 100 {u}',
totalKwhP:'Énergie (kWh)',sessionsCompanies:'Charges / Réseaux',totalDiscP:'Remises reçues',
freeCount:'Charges gratuites',weeklySpend:'Dépenses hebdo',monthlyTotals:'Dépenses mensuelles',
firmDist:'Par réseau',recentCharges:'Charges récentes',viewAll:'Tout',allVehicles:'Tous véhicules',
historyTitle:'Historique',allYears:'Toutes années',allFirms:'Tous réseaux',allTypes:'Tous types',free:'Gratuit',
compareTitle:'Comparer vs Thermique',fuelType:'Carburant de l’autre voiture',
petrol:'Essence',diesel:'Diesel',hybrid:'Hybride',
hybridNote:'Une hybride non rechargeable se mesure aussi en L/100km — elle consomme simplement moins (~4-5 L). Pour une PHEV, saisissez la conso mixte moyenne.',
fuelPrice:'Prix carburant ({s}/L)',fuelCons:'Conso (L/100km)',calc:'Comparer',
evCost:'VE / 100 {u} (net)',evCostG:'VE / 100 {u} (brut)',iceCost:'Thermique 100 {u}',
discEffect:'Effet remises / 100 {u}',perUnitSaving:'Économie par {u}',
per100:'{v} économisés / 100 {u}',savingByMonth:'Économies par mois',
compareNote:'Le graphique montre l’économie vs la même distance en thermique. Charges avec distance utilisées ; calcul sur montants nets.',
needData:'Ajoutez des charges avec distance',
settingsTitle:'Réglages',regionSection:'Pays et région',country:'Pays',currency:'Devise',
unit:'Unité de distance',language:'Langue',vehicles:'Mes véhicules',addVehicle:'+ Véhicule',
defaultHint:'★ défaut · km✎ compteur · 📷 photo · × archive',
formSection:'Formulaire',advAlways:'Champs avancés toujours ouverts',
advAlwaysD:'Banque, durée, lieu et plage de charge affichés par défaut',
dataSection:'Données',exportJson:'Exporter (JSON)',exportCsv:'Exporter (CSV — Excel/Power BI)',
importJson:'Restaurer (JSON)',reset:'Réinitialiser',about:'À propos',
aboutText:'WattTrack — vos données restent sur cet appareil. Gratuit, sans publicité ; données non partagées avec des tiers. Seule exception : le taux de change est récupéré en ligne pour les charges à l’étranger (seuls les codes devises sont transmis).',
addTitle:'Nouvelle charge',editTitle:'Modifier la charge',date:'Date',chargeType:'Type de charge',
company:'Maison ou réseau',homeChip:'Maison',other:'Autre…',kwh:'Énergie (kWh)',
distance:'Distance parcourue ({u})',
freeCharge:'Charge gratuite',freeChargeD:'Promo, solaire… — enregistré à 0',
amount:'Montant — avant remise ({s})',discountType:'Type de remise',amountType:'Montant',percentType:'Pourcent (%)',
bank:'Banque',vehicle:'Véhicule',advanced:'+ Avancé',advancedHide:'− Masquer avancé',
duration:'Durée de charge',hours:'heures',minutes:'minutes',location:'Lieu',
socRange:'Plage de charge % (début → fin)',note:'Note',
rateLbl:'Taux (1 {f} = ? {b})',
rateNote:'Les dépenses à l’étranger sont converties en {b} au taux saisi. Saisir manuellement si introuvable.',
rateAuto:'Taux récupéré automatiquement ({d})',rateNeeded:'Taux requis pour une charge à l’étranger',
gpsFail:'Position indisponible — vérifiez l’autorisation',
formError:'Réseau, kWh et montant requis',save:'Enregistrer',
deleteAsk:'Supprimer cette charge ?',deleted:'Charge supprimée',saved:'Charge enregistrée',updated:'Charge modifiée',
obWelcome:'Bienvenue !',obCountryQ:'Où chargez-vous ? Devise et unité seront réglées en conséquence.',
obCarQ:'Choisissez votre voiture',obCarSub:'Tapez une marque ou un modèle — distinguez les versions par année et batterie.',
searchCar:'ex. Megane, ID.4, Torres…',continue:'Continuer',skip:'Passer',start:'Démarrer',
battery:'Batterie',arch:'Architecture',dcMax:'DC max',acMax:'AC',range:'Autonomie',
addPhoto:'📷 Ajouter une photo',changePhoto:'📷 Remplacer la photo',
customAdd:'Ajouter « {q} » en véhicule perso',vehicleAdded:'Véhicule ajouté',photoAdded:'Photo ajoutée',add:'Ajouter',
wipeAsk1:'TOUTES les données seront supprimées. Sûr ?',wipeAsk2:'Irréversible. Supprimer ?',
wiped:'Données supprimées',imported:'Sauvegarde restaurée',
importFail:'Sauvegarde WattTrack invalide',importAsk:'charges à importer. Fusionner ?',
jsonDone:'Sauvegarde JSON téléchargée',csvDone:'CSV téléchargé',noData:'Aucune charge',sessions:'charges'},

es:{navStats:'Datos',statsTitle:'Estadísticas',ice1:'Combustión 1 {u}',unitCostTitle:'Coste unitario — EV y combustión lado a lado',tcoExpEv:'Gastos fijos EV (Mi vehículo)',tcoExpIce:'Coste fijo combustión (prorrateado)',tco1kmIce:'Combustión 1 {u} (con gastos)',tcoExplain:'Los gastos fijos del EV son los conceptos (impuesto, seguro, mantenimiento) introducidos en Mi vehículo. En el lado de combustión, el coste fijo anual introducido arriba se prorratea al periodo seguido — ambos coches se comparan en el mismo periodo.',totalCostAll:'Coste total (carga + fijos)',fixedExpTotal:'Total gastos fijos',expChart:'Gráfico de gastos fijos',prorateLbl:'Prorratear gastos anuales (impuesto, seguro) al periodo',prorateNote:'Partidas anuales al {p}% del periodo; total realmente pagado {r}.',exp_tax:'Impuesto',exp_insurance:'Seguro',exp_maintenance:'Mantenimiento / Taller',exp_tire:'Neumáticos',exp_inspection:'ITV',exp_repair:'Reparación',exp_parking:'Aparcamiento / Peaje',exp_equipment:'Equipamiento (cargador, etc.)',exp_other:'Otros',otherTypePh:'Escribe un título — ej. Accesorios, Lavado',addExpense:'Añadir gasto',editExpense:'Editar gasto',expType:'Tipo de gasto',expenses:'Gastos del vehículo',expByCat:'Gastos por categoría',expTotal:'Gastos totales',expAmount:'Importe',noteLbl:'Nota',amountNeeded:'Introduce un importe',noExpenses:'Sin gastos aún. Añade impuesto, seguro y mantenimiento para ver el coste real.',tcoTitle:'Coste total de propiedad (carga + gastos)',tcoEv:'EV total (carga + gastos)',tcoIce:'Combustión total (con gastos)',tcoSaved:'Ahorro total con gastos',tco1km:'EV por 1 {u} (con gastos)',tcoNote:'Periodo seguido {d} días. Costes fijos del coche de combustión prorrateados: {f}.',nonFuelTitle:'Comparación de gastos sin combustible',nonFuelKm:'Gastos sin combustible por {u}',nonFuel100:'Gastos sin combustible por 100 {u}',nonFuelYear:'Gastos anuales sin combustible',nonFuelKwh:'Gastos sin combustible por kWh',nonFuelDiffYear:'Diferencia anual de gastos sin combustible',nonFuelChart:'Gastos anuales sin combustible (EV / Combustión)',iceShort:'Combustión',chargePower:'Potencia media de carga',yearlyCompare:'Comparación anual',yearlySpendLbl:'Gasto total (este año)',yearlyKwhLbl:'Energía (este año)',yearlyPriceLbl:'Precio por kWh (este año)',weekdayDist:'Por día de la semana',vsLastYear:'vs año anterior',iceFixHint:'Opcional. Indica el total anual de impuesto, seguro y mantenimiento de un coche de combustión similar.',ev1:'EV por 1 {u} ({x})',supportNote:'Esta aplicación es totalmente gratuita y sin anuncios. Para apoyar el proyecto, visita nuestra página de GitHub.',version:'Versión',contactDev:'Preguntas y aportes',privacy:'Privacidad',rateApp:'Valorar en Play Store',supportDev:'Página del proyecto en GitHub',kwhHint:'Izquierda entero, derecha 2 decimales — 45 , 27 = 45,27 kWh. Solo dígitos.',distFromOdo:'Fuente de distancia: cuentakilómetros',distFromRecords:'Fuente de distancia: distancias por carga',back:'← Atrás',changeCar:'Cambiar vehículo',navVehicle:'Mi vehículo',vehicleTitle:'Mi vehículo',odoAsk:'Kilometraje actual',odometer:'Cuentakilómetros',odoNow:'Cuentakilómetros',odoTracked:'Recorridos desde el inicio',odoPrompt:'Lectura actual ({u}):',odoStartPrompt:'Lectura inicial ({u}):',odoSaved:'Kilometraje actualizado',theme:'Apariencia',themeLight:'Claro',themeDark:'Oscuro',spendChart:'Gráfico de gasto',cumTitle:'Hasta hoy: mismos km con combustión',totalDist:'Distancia total',evSpent:'EV total (neto)',iceWould:'Costaría (combustión)',totalSaved:'Ahorro total',evLine:'EV (real)',iceLine:'Combustión (mismos km)',archived:'Archivo (vendido/sin uso)',archivedTag:'archivado — cargas conservadas',archivedToast:'Vehículo archivado, sus cargas se conservan',restore:'Restaurar',newBank:'+ Añadir banco…',newBankPrompt:'Nombre del banco:',importAllDup:'Todas las cargas ya existen — no se añadió nada.',importPartial:'{n} cargas nuevas, {d} duplicadas omitidas',netPaid:'Pagado (neto)',typeSplit:'Reparto por tipo (kWh)',detailStats:'Estadísticas detalladas',avgDuration:'Duración media',avgSocRange:'Rango medio',topBanks:'Bancos (ahorro por dtos.)',topLocations:'Lugares más usados',bankCountries:'Mis países bancarios',bankCountriesD:'Elige los países de tus tarjetas — la lista de bancos del formulario los sigue. Tus bancos no cambian con el país de carga.',addCountry:'+ Añadir país',prevPeriod:'vs periodo anterior',navHome:'Inicio',navHistory:'Historial',navCompare:'Comparar',navSettings:'Ajustes',
week:'Semana',month:'Mes',year:'Año',
periodWeek:'Total esta semana',periodMonth:'Total este mes',periodYear:'Total este año',
savings:'ahorrado',avgPerKwh:'Por kWh',netLbl:'neto',grossLbl:'sin dto.',
grossTotal:'Total sin descuentos',cost100:'Por 100 {u}',
totalKwhP:'Energía (kWh)',sessionsCompanies:'Cargas / Redes',totalDiscP:'Descuentos recibidos',
freeCount:'Cargas gratis',weeklySpend:'Gasto semanal',monthlyTotals:'Gasto mensual',
firmDist:'Por red',recentCharges:'Cargas recientes',viewAll:'Todo',allVehicles:'Todos los vehículos',
historyTitle:'Historial',allYears:'Todos los años',allFirms:'Todas las redes',allTypes:'Todos los tipos',free:'Gratis',
compareTitle:'Comparar vs Combustión',fuelType:'Combustible del otro coche',
petrol:'Gasolina',diesel:'Diésel',hybrid:'Híbrido',
hybridNote:'Un híbrido no enchufable también se mide en L/100km — solo consume menos (~4-5 L). Para un PHEV, introduce el consumo combinado medio.',
fuelPrice:'Precio ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Comparar',
evCost:'EV / 100 {u} (neto)',evCostG:'EV / 100 {u} (bruto)',iceCost:'Combustión 100 {u}',
discEffect:'Efecto descuentos / 100 {u}',perUnitSaving:'Ahorro por {u}',
per100:'{v} ahorrados / 100 {u}',savingByMonth:'Ahorro por mes',
compareNote:'El gráfico muestra el ahorro frente a la misma distancia con combustión. Se usan cargas con distancia; cálculo sobre importes netos.',
needData:'Añade cargas con distancia',
settingsTitle:'Ajustes',regionSection:'País y región',country:'País',currency:'Moneda',
unit:'Unidad de distancia',language:'Idioma',vehicles:'Mis vehículos',addVehicle:'+ Vehículo',
defaultHint:'★ predeterminado · km✎ kilometraje · 📷 foto · × archivo',
formSection:'Formulario',advAlways:'Campos avanzados siempre abiertos',
advAlwaysD:'Banco, duración, lugar y rango visibles por defecto',
dataSection:'Datos',exportJson:'Exportar (JSON)',exportCsv:'Exportar (CSV — Excel/Power BI)',
importJson:'Restaurar copia (JSON)',reset:'Restablecer datos',about:'Acerca de',
aboutText:'WattTrack — tus datos permanecen en este dispositivo. Gratis, sin anuncios; datos no compartidos con terceros. Única excepción: el tipo de cambio se obtiene online para cargas en el extranjero (solo se transmiten códigos de moneda).',
addTitle:'Nueva carga',editTitle:'Editar carga',date:'Fecha',chargeType:'Tipo de carga',
company:'Casa o red de carga',homeChip:'Casa',other:'Otra…',kwh:'Energía (kWh)',
distance:'Distancia recorrida ({u})',
freeCharge:'Carga gratis',freeChargeD:'Promo, solar… — se guarda como 0',
amount:'Importe — antes de dto. ({s})',discountType:'Tipo de descuento',amountType:'Importe',percentType:'Porcentaje (%)',
bank:'Banco',vehicle:'Vehículo',advanced:'+ Avanzado',advancedHide:'− Ocultar avanzado',
duration:'Duración',hours:'horas',minutes:'minutos',location:'Lugar',
socRange:'Rango de carga % (inicio → fin)',note:'Nota',
rateLbl:'Tipo (1 {f} = ? {b})',
rateNote:'El gasto en el extranjero se convierte a {b} al tipo introducido. Introduce manualmente si no se encuentra.',
rateAuto:'Tipo obtenido automáticamente ({d})',rateNeeded:'Tipo requerido para carga en el extranjero',
gpsFail:'Ubicación no disponible — comprueba el permiso',
formError:'Red, kWh e importe requeridos',save:'Guardar',
deleteAsk:'¿Eliminar esta carga?',deleted:'Carga eliminada',saved:'Carga guardada',updated:'Carga actualizada',
obWelcome:'¡Bienvenido!',obCountryQ:'¿Dónde cargas? Ajustaremos moneda y unidad.',
obCarQ:'Elige tu coche',obCarSub:'Escribe marca o modelo — distingue versiones por año y batería.',
searchCar:'ej. Model 3, EV6, Torres…',continue:'Continuar',skip:'Omitir',start:'Empezar',
battery:'Batería',arch:'Arquitectura',dcMax:'DC máx',acMax:'AC',range:'Autonomía',
addPhoto:'📷 Añadir foto',changePhoto:'📷 Cambiar foto',
customAdd:'Añadir «{q}» como vehículo propio',vehicleAdded:'Vehículo añadido',photoAdded:'Foto añadida',add:'Añadir',
wipeAsk1:'Se borrarán TODOS los datos. ¿Seguro?',wipeAsk2:'Irreversible. ¿Borrar?',
wiped:'Datos borrados',imported:'Copia restaurada',
importFail:'Copia WattTrack no válida',importAsk:'cargas se importarán. ¿Combinar?',
jsonDone:'Copia JSON descargada',csvDone:'CSV descargado',noData:'Sin cargas aún',sessions:'cargas'},

it:{navStats:'Statistiche',statsTitle:'Statistiche',ice1:'Termica 1 {u}',unitCostTitle:'Costo unitario — EV e termica affiancate',tcoExpEv:'Costi fissi EV (Il mio veicolo)',tcoExpIce:'Costi fissi termica (in proporzione)',tco1kmIce:'Termica 1 {u} (con spese)',tcoExplain:'I costi fissi EV sono le voci (bollo, assicurazione, manutenzione) inserite ne Il mio veicolo. Sul lato termica, il costo fisso annuo inserito sopra è ripartito sul periodo monitorato — le due auto sono confrontate sullo stesso periodo.',totalCostAll:'Costo totale (ricarica + fissi)',fixedExpTotal:'Totale costi fissi',expChart:'Grafico costi fissi',prorateLbl:'Ripartisci le spese annuali (bollo, assicurazione) sul periodo',prorateNote:'Voci annuali al {p}% del periodo; totale realmente pagato {r}.',exp_tax:'Bollo',exp_insurance:'Assicurazione',exp_maintenance:'Manutenzione / Tagliando',exp_tire:'Pneumatici',exp_inspection:'Revisione',exp_repair:'Riparazione',exp_parking:'Parcheggio / Pedaggi',exp_equipment:'Attrezzatura (wallbox ecc.)',exp_other:'Altro',otherTypePh:'Scrivi un titolo — es. Accessori, Lavaggio',addExpense:'Aggiungi spesa',editExpense:'Modifica spesa',expType:'Tipo di spesa',expenses:'Spese del veicolo',expByCat:'Spese per categoria',expTotal:'Spese totali',expAmount:'Importo',noteLbl:'Nota',amountNeeded:'Inserisci un importo',noExpenses:'Nessuna spesa. Aggiungi bollo, assicurazione e manutenzione per il costo reale.',tcoTitle:'Costo totale di possesso (ricarica + spese)',tcoEv:'EV totale (ricarica + spese)',tcoIce:'Termica totale (con spese)',tcoSaved:'Risparmio totale con spese',tco1km:'EV per 1 {u} (con spese)',tcoNote:'Periodo monitorato {d} giorni. Costi fissi della termica in proporzione: {f}.',nonFuelTitle:'Confronto spese non di carburante',nonFuelKm:'Spese non di carburante per {u}',nonFuel100:'Spese non di carburante per 100 {u}',nonFuelYear:'Spese annue non di carburante',nonFuelKwh:'Spese non di carburante per kWh',nonFuelDiffYear:'Differenza annua spese non di carburante',nonFuelChart:'Spese annue non di carburante (EV / Termica)',iceShort:'Termica',chargePower:'Potenza media di ricarica',yearlyCompare:'Confronto annuale',yearlySpendLbl:'Spesa totale (quest’anno)',yearlyKwhLbl:'Energia (quest’anno)',yearlyPriceLbl:'Prezzo per kWh (quest’anno)',weekdayDist:'Per giorno della settimana',vsLastYear:'vs anno precedente',iceFixHint:'Facoltativo. Inserisci il totale annuo di bollo, assicurazione e manutenzione di una termica simile.',ev1:'EV per 1 {u} ({x})',supportNote:'Questa app è completamente gratuita e senza pubblicità. Per sostenere il progetto, visita la nostra pagina GitHub.',version:'Versione',contactDev:'Domande e contributi',privacy:'Privacy',rateApp:'Valuta su Play Store',supportDev:'Pagina GitHub del progetto',kwhHint:'Sinistra intero, destra 2 decimali — 45 , 27 = 45,27 kWh. Solo cifre.',distFromOdo:'Fonte distanza: contachilometri',distFromRecords:'Fonte distanza: distanze delle ricariche',back:'← Indietro',changeCar:'Cambia veicolo',navVehicle:'Il mio veicolo',vehicleTitle:'Il mio veicolo',odoAsk:'Chilometraggio attuale',odometer:'Contachilometri',odoNow:'Contachilometri',odoTracked:'Percorsi dall’inizio',odoPrompt:'Lettura attuale ({u}):',odoStartPrompt:'Lettura iniziale ({u}):',odoSaved:'Contachilometri aggiornato',theme:'Aspetto',themeLight:'Chiaro',themeDark:'Scuro',spendChart:'Grafico spese',cumTitle:'Finora: stessi km con termica',totalDist:'Distanza totale',evSpent:'EV totale (netto)',iceWould:'Costerebbe (termica)',totalSaved:'Risparmio totale',evLine:'EV (reale)',iceLine:'Termica (stessi km)',archived:'Archivio (venduto/inutilizzato)',archivedTag:'archiviato — ricariche conservate',archivedToast:'Veicolo archiviato, le ricariche restano',restore:'Ripristina',newBank:'+ Nuova banca…',newBankPrompt:'Nome banca:',importAllDup:'Tutte le ricariche esistono già — nulla aggiunto.',importPartial:'{n} nuove ricariche, {d} duplicati saltati',netPaid:'Pagato (netto)',typeSplit:'Ripartizione per tipo (kWh)',detailStats:'Statistiche dettagliate',avgDuration:'Durata media',avgSocRange:'Intervallo medio',topBanks:'Banche (risparmio sconti)',topLocations:'Luoghi più usati',bankCountries:'I miei paesi bancari',bankCountriesD:'Scegli i paesi delle tue carte — l’elenco banche nel modulo li segue. Le tue banche non cambiano col paese di ricarica.',addCountry:'+ Aggiungi paese',prevPeriod:'vs periodo precedente',navHome:'Home',navHistory:'Cronologia',navCompare:'Confronta',navSettings:'Impostazioni',
week:'Settimana',month:'Mese',year:'Anno',
periodWeek:'Totale settimana',periodMonth:'Totale mese',periodYear:'Totale anno',
savings:'risparmiato',avgPerKwh:'Per kWh',netLbl:'netto',grossLbl:'senza sconto',
grossTotal:'Totale senza sconti',cost100:'Per 100 {u}',
totalKwhP:'Energia (kWh)',sessionsCompanies:'Ricariche / Reti',totalDiscP:'Sconti ricevuti',
freeCount:'Ricariche gratis',weeklySpend:'Spesa settimanale',monthlyTotals:'Spesa mensile',
firmDist:'Per rete',recentCharges:'Ricariche recenti',viewAll:'Tutte',allVehicles:'Tutti i veicoli',
historyTitle:'Cronologia',allYears:'Tutti gli anni',allFirms:'Tutte le reti',allTypes:'Tutti i tipi',free:'Gratis',
compareTitle:'Confronta vs Termica',fuelType:'Carburante dell’altra auto',
petrol:'Benzina',diesel:'Diesel',hybrid:'Ibrida',
hybridNote:'Anche un’ibrida non ricaricabile si misura in L/100km — consuma solo meno (~4-5 L). Per una PHEV inserisci il consumo combinato medio.',
fuelPrice:'Prezzo ({s}/L)',fuelCons:'Consumo (L/100km)',calc:'Confronta',
evCost:'EV / 100 {u} (netto)',evCostG:'EV / 100 {u} (lordo)',iceCost:'Termica 100 {u}',
discEffect:'Effetto sconti / 100 {u}',perUnitSaving:'Risparmio per {u}',
per100:'{v} risparmiati / 100 {u}',savingByMonth:'Risparmio per mese',
compareNote:'Il grafico mostra il risparmio rispetto alla stessa distanza con un’auto termica. Ricariche con distanza; calcolo su importi netti.',
needData:'Aggiungi ricariche con distanza',
settingsTitle:'Impostazioni',regionSection:'Paese e regione',country:'Paese',currency:'Valuta',
unit:'Unità di distanza',language:'Lingua',vehicles:'I miei veicoli',addVehicle:'+ Veicolo',
defaultHint:'★ predefinito · km✎ contachilometri · 📷 foto · × archivio',
formSection:'Modulo',advAlways:'Campi avanzati sempre aperti',
advAlwaysD:'Banca, durata, luogo e intervallo visibili di default',
dataSection:'Dati',exportJson:'Esporta (JSON)',exportCsv:'Esporta (CSV — Excel/Power BI)',
importJson:'Ripristina backup (JSON)',reset:'Azzera dati',about:'Info',
aboutText:'WattTrack — i tuoi dati restano su questo dispositivo. Gratuita, senza pubblicità; dati non condivisi con terzi. Unica eccezione: il tasso di cambio è recuperato online per ricariche all’estero (si trasmettono solo i codici valuta).',
addTitle:'Nuova ricarica',editTitle:'Modifica ricarica',date:'Data',chargeType:'Tipo di ricarica',
company:'Casa o rete di ricarica',homeChip:'Casa',other:'Altra…',kwh:'Energia (kWh)',
distance:'Distanza percorsa ({u})',
freeCharge:'Ricarica gratis',freeChargeD:'Promo, solare… — salvata come 0',
amount:'Importo — prima dello sconto ({s})',discountType:'Tipo di sconto',amountType:'Importo',percentType:'Percento (%)',
bank:'Banca',vehicle:'Veicolo',advanced:'+ Avanzate',advancedHide:'− Nascondi avanzate',
duration:'Durata',hours:'ore',minutes:'minuti',location:'Luogo',
socRange:'Intervallo carica % (inizio → fine)',note:'Nota',
rateLbl:'Tasso (1 {f} = ? {b})',
rateNote:'La spesa all’estero è convertita in {b} al tasso inserito. Inserisci manualmente se non trovato.',
rateAuto:'Tasso recuperato automaticamente ({d})',rateNeeded:'Tasso richiesto per ricarica all’estero',
gpsFail:'Posizione non disponibile — controlla i permessi',
formError:'Rete, kWh e importo obbligatori',save:'Salva',
deleteAsk:'Eliminare questa ricarica?',deleted:'Ricarica eliminata',saved:'Ricarica salvata',updated:'Ricarica aggiornata',
obWelcome:'Benvenuto!',obCountryQ:'Dove ricarichi? Imposteremo valuta e unità di conseguenza.',
obCarQ:'Scegli la tua auto',obCarSub:'Scrivi marca o modello — distingui le versioni per anno e batteria.',
searchCar:'es. 500e, Model 3, Torres…',continue:'Continua',skip:'Salta',start:'Inizia',
battery:'Batteria',arch:'Architettura',dcMax:'DC max',acMax:'AC',range:'Autonomia',
addPhoto:'📷 Aggiungi foto',changePhoto:'📷 Sostituisci foto',
customAdd:'Aggiungi «{q}» come veicolo personale',vehicleAdded:'Veicolo aggiunto',photoAdded:'Foto aggiunta',add:'Aggiungi',
wipeAsk1:'TUTTI i dati saranno eliminati. Sicuro?',wipeAsk2:'Irreversibile. Eliminare?',
wiped:'Dati eliminati',imported:'Backup ripristinato',
importFail:'Backup WattTrack non valido',importAsk:'ricariche da importare. Unire?',
jsonDone:'Backup JSON scaricato',csvDone:'CSV scaricato',noData:'Nessuna ricarica',sessions:'ricariche'}
};
const LANG_NAMES = {tr:'Türkçe',en:'English',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano'};
const MONTHS = {
tr:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
en:['January','February','March','April','May','June','July','August','September','October','November','December'],
de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
it:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']
};
const DAYS = {
tr:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'], en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
de:['Mo','Di','Mi','Do','Fr','Sa','So'], fr:['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'],
es:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], it:['Lun','Mar','Mer','Gio','Ven','Sab','Dom']
};

// ---------- Durum & yardımcılar ----------
const S = {
  country: 'TR', currency: 'TRY', unit: 'km', lang: 'tr',
  advOpen: false, defaultVehicleId: null, onboarded: false,
  period: 'year', cmp: null, dashVeh: '', cmpVeh: '', vehExpVeh: '', vehExpGran: 'month', bankCountries: null, gran: 'month', customBanks: [], theme: 'light', dstatType: ''
};
const $ = id => document.getElementById(id);
const t = (key, vars) => {
  let s = (T[S.lang] && T[S.lang][key]) ?? T.en[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
};
// virgül toleranslı sayı okuma ("45,5" → 45.5)
const pf = v => {
  const n = parseFloat(String(v ?? '').trim().replace(',', '.'));
  return isNaN(n) ? NaN : n;
};
const symOf = code => CURRENCY_SYMBOLS[code] || code;
const sym = () => symOf(S.currency);
// Harf içeren semboller (L, kr, Kč, Ft…) sayının SONUNA boşlukla gelir: "1.250 L";
// işaret semboller (₺ € $ £) başa gelir: "₺1.250"
const fm = (s, str) => /^[A-Za-z]/.test(s) ? str + ' ' + s : s + str;
const money = v => (v < 0 ? '−' : '') + fm(sym(), Math.abs(Math.round(v || 0)).toLocaleString('tr-TR'));
const money2 = v => (v < 0 ? '−' : '') + fm(sym(), Math.abs(v || 0).toLocaleString('tr-TR', {maximumFractionDigits: 2}));
const monthKey = iso => iso.slice(0, 7);
const distDisp = km => S.unit === 'mi' ? km / MI : km;
const distFactor = () => S.unit === 'mi' ? MI : 1;   // 100 birim = 100*factor km

// Açılış animasyonu: gerçek yükleme paralelde sürer, splash yalnız görsel bir katman —
// en az SPLASH_MIN_MS gösterilir ki animasyon yarıda kesilmiş gibi durmasın.
// (popüler mobil uygulamalardaki ~2 sn marka splash süresi baz alındı)
const SPLASH_MIN_MS = 2000;
const splashStart = Date.now();
function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStart));
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 600);
  }, wait);
}
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._h);
  el._h = setTimeout(() => el.classList.remove('show'), 2400);
}
function esc(s) {
  return (s || '').toString().replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
// indirim (tasarruf) — kayıt para biriminde
// v6+: kayıtta hazır `indirim` alanı var (brüt − net). Eski kayıtlar için formül.
function savingsOf(r) {
  if (r.free) return 0;
  if (r.indirim != null) return Number(r.indirim) || 0;
  if (r.indirimTip === 'percent') {
    const v = Number(r.indirimDeger) || 0;
    return v >= 100 ? 0 : r.odenen * v / (100 - v);
  }
  if (r.indirimTip === 'amount') return Number(r.indirimDeger) || 0;
  return 0;
}
// brütten neti hesapla (form ve kayıt için tek doğruluk kaynağı)
function netFromGross(gross, type, val) {
  const v = Number(val) || 0;
  if (v <= 0) return gross;
  const net = type === 'percent' ? gross * (1 - Math.min(100, v) / 100) : gross - v;
  return Math.max(0, net);
}
// ---- ÇİFT YÖNLÜ KUR: kayıt kendi para birimini korur ----
// Dönüşüm katsayısı; çevrilemiyorsa null (toplam dışı bırakılır)
let fxPendingCount = 0;
function convOf(r) {
  const c = r.cur || S.currency;
  if (c === S.currency) return 1;
  if (r.fxTable && r.fxTable[S.currency]) return r.fxTable[S.currency];
  if (r.rate && (r.rateBase === S.currency || !r.rateBase)) return Number(r.rate);
  return null;
}
const amtB = r => { const k = convOf(r); return k == null ? 0 : (r.odenen || 0) * k; };
const savB = r => { const k = convOf(r); return k == null ? 0 : savingsOf(r) * k; };
const isConv = r => convOf(r) != null;
const expB = e => { const k = convOf(e); return k == null ? 0 : (e.tutar || 0) * k; };
function shortDate(iso) {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return d + ' ' + MONTHS[S.lang][m - 1].slice(0, 3);
}
async function saveSetting(key, value) { await db.settings.put({key, value}); }
// Kayıt eklenince/değişince/silinince aracın sayacına mesafe farkını işle.
// Yalnız formdan yapılan işlemlerde çalışır (içe aktarma sayaca DOKUNMAZ —
// yedekteki sayaç değeri zaten o kayıtları içerir, çift sayım olmasın).
async function bumpVehicleKm(aracId, deltaKm) {
  if (!deltaKm) return;
  const vs = (await db.vehicles.toArray()).filter(v => !v.archived);
  const v = (aracId && vs.find(x => x.id === aracId)) || pickOdoVeh(vs, '');
  if (!v || v.kmNow == null) return;   // sayaç kullanılmıyorsa karışma
  const yeni = Math.max(v.kmStart ?? 0, Math.round(v.kmNow + deltaKm));
  await db.vehicles.update(v.id, {kmNow: yeni});
}
function applyTheme() {
  const dark = S.theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.content = dark ? '#0f172a' : '#F1F7F2';
  document.querySelectorAll('[data-themetoggle]').forEach(b => { b.textContent = dark ? '☀️' : '🌙'; });
  const st = document.getElementById('set-theme');
  if (st) st.querySelectorAll('button').forEach(x =>
    x.classList.toggle('sel', x.dataset.v === (dark ? 'dark' : 'light')));
}
document.querySelectorAll('[data-themetoggle]').forEach(b =>
  b.addEventListener('click', async () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    await saveSetting('theme', S.theme);
    applyTheme();
    RENDER[screen]?.();   // grafik/donut renkleri temaya göre yeniden çizilsin
  }));
const chargersFor = code => (CHARGERS[code] || CHARGERS_DEFAULT);
const banksFor = code => (BANKS_BY[code] || BANKS_DEFAULT);
// Banka listesi: kullanıcının banka ülkelerinin birleşimi (şarj ülkesinden bağımsız)
function bankOptions() {
  const codes = (S.bankCountries && S.bankCountries.length) ? S.bankCountries : [S.country];
  const list = [...(S.customBanks || [])];
  codes.forEach(cc => banksFor(cc).forEach(b => { if (!list.includes(b)) list.push(b); }));
  ['Visa', 'Mastercard'].forEach(b => { if (!list.includes(b)) list.push(b); });
  return ['', ...list].map(b => `<option value="${esc(b)}">${b || '—'}</option>`).join('') +
    `<option value="__newbank">${t('newBank')}</option>`;
}

// ---------- araç silüetleri & özet kartı ----------
function carSVG(body, color) {
  const c = color || '#1C8742';
  const P = {
    sedan: 'M20 62 Q22 50 42 47 L62 34 Q80 26 112 26 Q144 26 158 36 L170 46 Q196 49 202 58 Q206 62 204 68 L188 68 A14 14 0 0 0 160 68 L84 68 A14 14 0 0 0 56 68 L24 68 Q18 66 20 62 Z',
    suv:   'M20 60 Q20 44 40 42 L56 26 Q64 18 100 18 Q140 18 152 28 L166 42 Q198 45 202 56 Q205 62 202 68 L186 68 A14 14 0 0 0 158 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q17 66 20 60 Z',
    hatch: 'M24 60 Q24 46 44 44 L58 28 Q66 20 100 20 Q126 20 138 28 L154 44 Q182 47 188 56 Q192 62 188 68 L174 68 A13 13 0 0 0 148 68 L82 68 A13 13 0 0 0 56 68 L28 68 Q21 66 24 60 Z',
    pickup:'M18 62 Q18 46 38 44 L52 26 Q58 18 92 18 L108 18 L110 42 L196 42 Q204 44 204 56 L204 62 Q204 68 198 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L22 68 Q16 66 18 62 Z',
    van:   'M20 62 Q20 30 44 28 L150 24 Q196 24 202 46 L202 60 Q202 68 196 68 L184 68 A14 14 0 0 0 156 68 L82 68 A14 14 0 0 0 54 68 L24 68 Q18 66 20 62 Z'
  };
  const win = {
    sedan: 'M66 36 L112 30 Q136 30 150 38 L118 44 L70 44 Z',
    suv:   'M60 28 L100 24 Q132 24 146 32 L118 42 L64 42 Z',
    hatch: 'M62 30 L100 26 Q120 26 132 32 L116 42 L66 42 Z',
    pickup:'M56 28 L92 24 L104 24 L106 40 L60 40 Z',
    van:   'M48 32 L140 28 Q170 28 182 40 L150 46 L52 46 Z'
  };
  return `<svg viewBox="0 0 220 84" xmlns="http://www.w3.org/2000/svg">
    <path d="${P[body] || P.suv}" fill="${c}" opacity=".9"/>
    <path d="${win[body] || win.suv}" fill="#F1F7F2" opacity=".85"/>
    <circle cx="70" cy="68" r="11" fill="#131714"/><circle cx="70" cy="68" r="5" fill="#8B918C"/>
    <circle cx="172" cy="68" r="11" fill="#131714"/><circle cx="172" cy="68" r="5" fill="#8B918C"/>
  </svg>`;
}
function evSummaryHTML(v) {
  const yr = v.y1 ? (v.y1 + (v.y2 ? '–' + v.y2 : '+')) : '—';
  const visual = v.photo
    ? `<img class="carphoto" src="${v.photo}" alt="">`
    : carSVG(v.body, colorFor(v.brand || v.ad || ''));
  return `<div class="ev-summary">
    ${visual}
    <div class="name">${esc((v.brand ? v.brand + ' ' : '') + (v.model || v.ad || ''))}</div>
    <div class="trim">${esc(v.trim || '')}${v.trim ? ' · ' : ''}${yr}</div>
    <div class="spec-grid">
      <div class="spec"><div class="k">${t('battery')}</div><div class="v">${v.batt ? v.batt + ' kWh' : '—'}</div></div>
      <div class="spec"><div class="k">${t('arch')}</div><div class="v">${v.arch ? v.arch + ' V' : '—'}</div></div>
      <div class="spec"><div class="k">${t('dcMax')}</div><div class="v">${v.dc ? v.dc + ' kW' : '—'}</div></div>
      <div class="spec"><div class="k">${t('acMax')}</div><div class="v">${v.ac ? v.ac + ' kW' : '—'}</div></div>
      <div class="spec" style="grid-column:1/-1"><div class="k">${t('range')}</div><div class="v">${v.range ? Math.round(distDisp(v.range)) + ' ' + S.unit : '—'}</div></div>
    </div>
  </div>`;
}
// fotoğrafı küçültüp dataURL yap (max 640px genişlik)
function resizePhoto(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(640, img.width);
      const h = Math.round(img.height * w / img.width);
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(img, 0, 0, w, h);
      res(cv.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- döviz kuru (frankfurter — ECB) ----------
// Bir para biriminin o günkü TÜM kur tablosunu çek (çift yönlü dönüşüm için)
async function fetchTable(from, date) {
  const day = date && date < new Date().toISOString().slice(0, 10) ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}`,
    `https://api.frankfurter.app/${day}?from=${from}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4500);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      if (j && j.rates) { j.rates[from] = 1; return {rates: j.rates, date: j.date || day}; }
    } catch (e) { /* sıradaki */ }
  }
  return null;
}
// Kur tablosu eksik kayıtları sessizce tamamla (oturum başına sınırlı)
async function backfillRates() {
  const all = await db.sessions.toArray();
  const need = all.filter(r => r.cur && !r.fxTable);
  const groups = {};
  need.forEach(r => { (groups[r.cur + '|' + r.tarih.slice(0, 10)] ||= []).push(r); });
  let calls = 0;
  for (const key of Object.keys(groups)) {
    if (calls >= 8) break;
    const [cur, date] = key.split('|');
    const got = await fetchTable(cur, date);
    calls++;
    if (got) for (const r of groups[key])
      await db.sessions.update(r.id, {fxTable: got.rates, fxDate: got.date});
  }
}
async function fetchRate(from, to, date) {
  const day = date && date < new Date().toISOString().slice(0, 10) ? date : 'latest';
  const urls = [
    `https://api.frankfurter.dev/v1/${day}?base=${from}&symbols=${to}`,
    `https://api.frankfurter.app/${day}?from=${from}&to=${to}`
  ];
  for (const u of urls) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(u, {signal: ctrl.signal});
      clearTimeout(tm);
      if (!res.ok) continue;
      const j = await res.json();
      const v = j && j.rates && j.rates[to];
      if (v) return {rate: v, date: j.date || day};
    } catch (e) { /* sıradaki kaynak */ }
  }
  return null;
}

// ============================================================
// i18n
// ============================================================
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  $('d-100-lbl').textContent = t('cost100', {u: S.unit});
  $('d-1km-lbl').textContent = '1 ' + S.unit;
  $('d-1km-lbl2').textContent = '1 ' + S.unit;
  $('c-1km-lbl').textContent = t('ev1', {u: S.unit, x: t('netLbl')});
  $('c-1km-g-lbl').textContent = t('ev1', {u: S.unit, x: t('grossLbl')});
  $('d-100-lbl2').textContent = t('cost100', {u: S.unit});
  $('in-dist-lbl').textContent = t('distance', {u: S.unit});
  $('in-amount-lbl').textContent = t('amount', {s: sym()});
  $('c-price-lbl').textContent = t('fuelPrice', {s: sym()});
  $('c-cons-lbl').textContent = t('fuelCons');
  $('c-ev-lbl').textContent = t('evCost', {u: S.unit});
  $('c-evg-lbl').textContent = t('evCostG', {u: S.unit});
  $('c-ice-lbl').textContent = t('iceCost', {u: S.unit});
  $('c-ice1km-lbl').textContent = t('ice1', {u: S.unit});
  $('c-tcoice1km-lbl').textContent = t('tco1kmIce', {u: S.unit});
  $('c-discfx-lbl').textContent = t('discEffect', {u: S.unit});
  $('c-perkm-lbl').textContent = t('perUnitSaving', {u: S.unit});
  $('c-nf-ev-km-lbl').textContent = 'EV · ' + t('nonFuelKm', {u: S.unit});
  $('c-nf-ice-km-lbl').textContent = t('iceShort') + ' · ' + t('nonFuelKm', {u: S.unit});
  $('c-nf-ev-100-lbl').textContent = 'EV · ' + t('nonFuel100', {u: S.unit});
  $('c-nf-ice-100-lbl').textContent = t('iceShort') + ' · ' + t('nonFuel100', {u: S.unit});
  $('c-nf-ev-yr-lbl').textContent = 'EV · ' + t('nonFuelYear');
  $('c-nf-ice-yr-lbl').textContent = t('iceShort') + ' · ' + t('nonFuelYear');
  $('c-nf-kwh-lbl').textContent = 'EV · ' + t('nonFuelKwh');
  $('c-nf-bar-ice-name').textContent = t('iceShort');
  $('country-search').placeholder = t('country') + '…';
  $('ob-ev-search').placeholder = t('searchCar');
  $('car-search').placeholder = t('searchCar');
  $('btn-adv').textContent =
    $('adv-fields').classList.contains('open') ? t('advancedHide') : t('advanced');
  document.documentElement.lang = S.lang;
}

// ============================================================
// EKRAN GEÇİŞLERİ
// ============================================================
let screen = 'dashboard';
const RENDER = {dashboard: renderDashboard, stats: renderStats, history: renderHistory,
  compare: renderCompare, vehicle: renderVehiclePage, settings: renderSettings};
document.querySelectorAll('nav button[data-page]').forEach(b =>
  b.addEventListener('click', () => showScreen(b.dataset.page)));
function showScreen(name) {
  screen = name;
  document.querySelectorAll('.content .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button[data-page]').forEach(b =>
    b.classList.toggle('sel', b.dataset.page === name));
  $('page-' + name).classList.add('active');
  RENDER[name]?.();
  document.querySelector('.content').scrollTop = 0;
}

// ============================================================
// ANA SAYFA
// ============================================================
$('d-period').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.period = b.dataset.v;
  $('d-period').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderDashboard();
});
$('d-vehsel').addEventListener('change', () => { S.dashVeh = $('d-vehsel').value; renderDashboard(); });
$('d-dstat-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.dstatType = b.dataset.v;
  $('d-dstat-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderDashboard();
});
$('d-gran').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.gran = b.dataset.v;
  $('d-gran').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderStats();
});
$('s-vehsel').addEventListener('change', () => { S.dashVeh = $('s-vehsel').value; renderStats(); });

function periodFilter(all) {
  const now = new Date();
  if (S.period === 'week') {
    const from = new Date(now); from.setDate(now.getDate() - 6);
    const key = from.toISOString().slice(0, 10);
    return all.filter(r => r.tarih.slice(0, 10) >= key);
  }
  if (S.period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear()));
  return all.filter(r => monthKey(r.tarih) === now.toISOString().slice(0, 7));
}
function prevPeriodFilter(all) {
  const now = new Date();
  if (S.period === 'week') {
    const to = new Date(now); to.setDate(now.getDate() - 7);
    const from = new Date(now); from.setDate(now.getDate() - 13);
    const a = from.toISOString().slice(0, 10), b = to.toISOString().slice(0, 10);
    return all.filter(r => { const d = r.tarih.slice(0, 10); return d >= a && d <= b; });
  }
  if (S.period === 'year')
    return all.filter(r => r.tarih.slice(0, 4) === String(now.getFullYear() - 1));
  const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const key = p.getFullYear() + '-' + String(p.getMonth() + 1).padStart(2, '0');
  return all.filter(r => monthKey(r.tarih) === key);
}
const vehFilter = (list, vid) => vid ? list.filter(r => String(r.aracId) === vid) : list;
// odometre için araç: seçili > tek araç > varsayılan araç
function pickOdoVeh(vehicles, sel) {
  if (sel) return vehicles.find(v => String(v.id) === sel) || null;
  if (vehicles.length === 1) return vehicles[0];
  return vehicles.find(v => v.id === S.defaultVehicleId) || null;
}
const odoDistOf = v => (v && v.kmStart != null && v.kmNow > v.kmStart) ? v.kmNow - v.kmStart : 0;
const vehName = v => v ? (v.brand ? v.brand + ' ' + v.model : v.ad) : '';

async function renderDashboard() {
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
  // araç filtresi seçeneği (2+ araçta görünür, tek araçta adını gösterir)
  const dsel = $('d-vehsel');
  if (vehicles.length > 1) {
    const cur = S.dashVeh;
    dsel.style.display = '';
    dsel.innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    dsel.value = cur;
  } else {
    dsel.style.display = vehicles.length ? '' : 'none';
    dsel.innerHTML = vehicles.length ? `<option value="">${esc(vehName(vehicles[0]))}</option>` : '';
    S.dashVeh = '';
  }

  const allRaw = await db.sessions.toArray();
  const all = vehFilter(allRaw, S.dashVeh);
  const cur = periodFilter(all);

  $('d-period-lbl').textContent =
    t(S.period === 'week' ? 'periodWeek' : S.period === 'year' ? 'periodYear' : 'periodMonth');

  const net = cur.reduce((s, r) => s + amtB(r), 0);
  const sav = cur.reduce((s, r) => s + savB(r), 0);
  const gross = net + sav;
  const kwh = cur.reduce((s, r) => s + r.kwh, 0);
  const wd = cur.filter(r => r.mesafeKm > 0);
  const distKm = wd.reduce((s, r) => s + r.mesafeKm, 0);
  const netD = wd.reduce((s, r) => s + amtB(r), 0);
  const grossD = netD + wd.reduce((s, r) => s + savB(r), 0);
  const f = distFactor();

  $('d-total').textContent = money(net);
  $('d-gross').textContent = money(gross);
  $('d-savings').textContent = '−' + money(sav) + ' ' + t('savings');
  // önceki döneme göre değişim
  const prev = prevPeriodFilter(all).reduce((s, r) => s + amtB(r), 0);
  const dEl = $('d-delta');
  if (prev > 0) {
    const pct = Math.round((net - prev) / prev * 100);
    dEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct + '% ' + t('prevPeriod');
    dEl.className = 'delta ' + (pct >= 0 ? 'up' : 'down');
  } else { dEl.textContent = ''; dEl.className = 'delta'; }
  $('d-avg').textContent = kwh ? fm(sym(), (net / kwh).toFixed(2)) : '—';
  $('d-avg-g').textContent = kwh ? fm(sym(), (gross / kwh).toFixed(2)) : '—';
  const fill100 = (npk, gpk) => {   // npk/gpk: birim başına (km) net/brüt
    $('d-1km').textContent = money2(npk * f);
    $('d-1km-g').textContent = money2(gpk * f);
    $('d-100').textContent = money2(npk * 100 * f);
    $('d-100-g').textContent = money2(gpk * 100 * f);
  };
  if (distKm >= 20) {
    fill100(netD / distKm, grossD / distKm);
  } else {
    // kayıt mesafesi yok → kilometre sayacından genel (tüm zamanlar) değer
    const oV = pickOdoVeh(vehicles, S.dashVeh);
    const oDist = odoDistOf(oV);
    if (oDist >= 20) {
      const allConv = all.filter(isConv);
      const aNet = allConv.reduce((s, r) => s + amtB(r), 0);
      const aGross = aNet + allConv.reduce((s, r) => s + savB(r), 0);
      fill100(aNet / oDist, aGross / oDist);
    } else {
      ['d-1km','d-1km-g','d-100','d-100-g'].forEach(id => $(id).textContent = '—');
    }
  }
  $('d-kwh').textContent = kwh.toLocaleString('tr-TR', {maximumFractionDigits: 0});
  $('d-sess').textContent = cur.length + ' / ' + new Set(cur.map(r => r.firma)).size;
  $('d-disc').textContent = money(sav);
  $('d-free').textContent = cur.filter(r => r.free).length;

  const now = new Date();

  // odometre kutuları (tek araç ya da seçili araç)
  const odoV = pickOdoVeh(vehicles, S.dashVeh);
  const odoWrap = $('d-odo-wrap');
  if (odoV && odoV.kmNow) {
    odoWrap.style.display = '';
    $('d-odo').textContent = Math.round(distDisp(odoV.kmNow)).toLocaleString('tr-TR') + ' ' + S.unit;
    $('d-odo-total').textContent = odoV.kmStart != null
      ? Math.round(distDisp(odoV.kmNow - odoV.kmStart)).toLocaleString('tr-TR') + ' ' + S.unit : '—';
  } else odoWrap.style.display = 'none';

  // detay: ortalama süre & SoC aralığı (Tümü/DC/AC filtresiyle)
  const dsAll = S.dstatType ? all.filter(r => r.tip === S.dstatType) : all;
  const durs = dsAll.filter(r => r.dur > 0);
  $('d-dur').textContent = durs.length
    ? (() => { const m = Math.round(durs.reduce((s, r) => s + r.dur, 0) / durs.length);
        return (m >= 60 ? Math.floor(m / 60) + ' ' + t('hours') + ' ' : '') + (m % 60) + ' ' + t('minutes'); })()
    : '—';
  const socs = dsAll.filter(r => r.socB != null && r.socA != null);
  $('d-soc').textContent = socs.length
    ? '%' + Math.round(socs.reduce((s, r) => s + r.socB, 0) / socs.length) +
      ' → %' + Math.round(socs.reduce((s, r) => s + r.socA, 0) / socs.length)
    : '—';
  // ort. şarj gücü (kWh/saat) — süre girilmiş kayıtlardan
  const powKwh = durs.reduce((s, r) => s + r.kwh, 0);
  const powMin = durs.reduce((s, r) => s + r.dur, 0);
  $('d-power').textContent = powMin > 0 ? (powKwh / (powMin / 60)).toFixed(1) + ' kWh/h' : '—';

  // yıllık karşılaştırma (bu yıl vs geçen yıl — tüm zamanlar, dönem seçiciden bağımsız)
  const thisY = String(now.getFullYear()), lastY = String(now.getFullYear() - 1);
  const yThisArr = all.filter(r => r.tarih.slice(0, 4) === thisY);
  const yLastArr = all.filter(r => r.tarih.slice(0, 4) === lastY);
  const ySumThis = yThisArr.reduce((s, r) => s + amtB(r), 0), ySumLast = yLastArr.reduce((s, r) => s + amtB(r), 0);
  const yKwhThis = yThisArr.reduce((s, r) => s + r.kwh, 0), yKwhLast = yLastArr.reduce((s, r) => s + r.kwh, 0);
  const yPriceThis = yKwhThis ? ySumThis / yKwhThis : 0, yPriceLast = yKwhLast ? ySumLast / yKwhLast : 0;
  $('d-yr-spend').textContent = money(ySumThis);
  $('d-yr-kwh').textContent = yKwhThis.toLocaleString('tr-TR', {maximumFractionDigits: 0}) + ' kWh';
  $('d-yr-price').textContent = yKwhThis ? fm(sym(), yPriceThis.toFixed(2)) : '—';
  const yDelta = (curV, prevV, id) => {
    const el = $(id);
    if (prevV > 0) {
      const pct = Math.round((curV - prevV) / prevV * 100);
      el.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct + '% ' + t('vsLastYear');
      el.style.color = pct >= 0 ? 'var(--red)' : 'var(--accent-dark)';
    } else { el.textContent = ''; }
  };
  yDelta(ySumThis, ySumLast, 'd-yr-spend-d');
  yDelta(yKwhThis, yKwhLast, 'd-yr-kwh-d');
  yDelta(yPriceThis, yPriceLast, 'd-yr-price-d');

  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 3);
  $('d-recent').innerHTML = sorted.length
    ? sorted.map(r => rowHTML(r, false)).join('')
    : `<div class="empty">${t('noData')}</div>`;
  $('d-recent').querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
$('d-viewall').addEventListener('click', () => showScreen('history'));

// ============================================================
// İSTATİSTİK (ana sayfadan taşınan grafikler + dağılımlar)
// ============================================================
async function renderStats() {
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
  const ssel = $('s-vehsel');
  if (vehicles.length > 1) {
    ssel.style.display = '';
    ssel.innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    ssel.value = S.dashVeh;
  } else {
    ssel.style.display = vehicles.length ? '' : 'none';
    ssel.innerHTML = vehicles.length ? `<option value="">${esc(vehName(vehicles[0]))}</option>` : '';
  }

  const all = vehFilter(await db.sessions.toArray(), S.dashVeh);

  // harcama grafiği — kendi Hafta/Ay/Yıl seçicisiyle
  const now = new Date();
  const bars = [];
  if (S.gran === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      bars.push({
        label: DAYS[S.lang][(d.getDay() + 6) % 7],
        year: String(d.getFullYear()),
        sum: all.filter(r => r.tarih.slice(0, 10) === key).reduce((s, r) => s + amtB(r), 0)
      });
    }
  } else if (S.gran === 'year') {
    for (let i = 4; i >= 0; i--) {
      const y = String(now.getFullYear() - i);
      bars.push({label: y, year: y,
        sum: all.filter(r => r.tarih.slice(0, 4) === y).reduce((s, r) => s + amtB(r), 0)});
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      bars.push({
        label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
        year: String(d.getFullYear()),
        sum: all.filter(r => monthKey(r.tarih) === key).reduce((s, r) => s + amtB(r), 0)
      });
    }
  }
  const maxM = Math.max(1, ...bars.map(b => b.sum));
  $('d-months').innerHTML = bars.map(b =>
    `<div class="mb" data-y="${b.year}" style="cursor:pointer">
      <div class="amt">${b.sum ? money(b.sum) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(b.sum / maxM * 66)}px"></div>
      <div class="m">${b.label}</div>
    </div>`).join('');
  $('d-months').querySelectorAll('.mb').forEach(el =>
    el.addEventListener('click', () => { histYear = el.dataset.y; showScreen('history'); }));

  // haftanın günlerine göre dağılım (tüm zamanlar, Pzt→Paz)
  const wdSum = [0, 0, 0, 0, 0, 0, 0];
  all.forEach(r => {
    const [ry, rm, rd] = r.tarih.slice(0, 10).split('-').map(Number);
    const day = (new Date(ry, rm - 1, rd).getDay() + 6) % 7;
    wdSum[day] += amtB(r);
  });
  const maxW = Math.max(1, ...wdSum);
  $('d-weekdays').innerHTML = wdSum.map((v, i) =>
    `<div class="mb">
      <div class="amt">${v ? money(v) : ''}</div>
      <div class="bar" style="height:${6 + Math.round(v / maxW * 66)}px"></div>
      <div class="m">${DAYS[S.lang][i]}</div>
    </div>`).join('');

  // firma dağılımı
  const by = {};
  all.forEach(r => {
    (by[r.firma] ||= {firma: r.firma, total: 0, kwh: 0, count: 0});
    by[r.firma].total += amtB(r); by[r.firma].kwh += r.kwh; by[r.firma].count++;
  });
  const rows = Object.values(by).sort((a, b) => b.total - a.total).slice(0, 6);
  const maxF = Math.max(1, ...rows.map(r => r.total));
  $('d-firms').innerHTML = rows.length ? rows.map(r =>
    `<div class="cmp">
      <div class="cmp-head">
        <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
        <div class="mid">
          <div class="name">${esc(r.firma)}</div>
          <div class="sub">${r.count} ${t('sessions')} · ${r.kwh ? (r.total / r.kwh).toFixed(2) : '0.00'} ${esc(sym())}/kWh</div>
        </div>
        <div class="total">${money(r.total)}</div>
      </div>
      <div class="track"><div class="fill" style="width:${Math.round(r.total / maxF * 100)}%"></div></div>
    </div>`).join('') : `<div class="empty">${t('noData')}</div>`;

  // şarj tipi donut (kWh bazında: DC / AC / Ev)
  const home = t('homeChip');
  const segs = [
    {name: 'DC', kwh: all.filter(r => r.tip === 'DC' && r.firma !== home).reduce((s, r) => s + r.kwh, 0), col: '#16A34A'},
    {name: 'AC', kwh: all.filter(r => r.tip !== 'DC' && r.firma !== home).reduce((s, r) => s + r.kwh, 0), col: '#1B5FAA'},
    {name: home, kwh: all.filter(r => r.firma === home).reduce((s, r) => s + r.kwh, 0), col: '#7DC855'}
  ].filter(x => x.kwh > 0);
  const tot = segs.reduce((s, x) => s + x.kwh, 0) || 1;
  let off = 25;
  const trackCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  $('d-donut').innerHTML =
    `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${trackCol}" stroke-width="5"></circle>` +
    segs.map(x => {
      const p = x.kwh / tot * 100;
      const el = `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${x.col}" stroke-width="5"
        stroke-dasharray="${p} ${100 - p}" stroke-dashoffset="${off}" stroke-linecap="butt"></circle>`;
      off -= p;
      return el;
    }).join('');
  $('d-donut-legend').innerHTML = segs.map(x =>
    `<div class="li"><span class="dot" style="background:${x.col}"></span>${esc(x.name)}
     <span class="lv">${Math.round(x.kwh)} kWh · %${Math.round(x.kwh / tot * 100)}</span></div>`).join('') ||
    `<div class="li" style="color:var(--faint)">${t('noData')}</div>`;

  // en çok kazandıran bankalar
  const bB = {};
  all.forEach(r => { if (r.banka) {
    (bB[r.banka] ||= {sav: 0, n: 0});
    bB[r.banka].sav += savB(r); bB[r.banka].n++;
  }});
  const banksTop = Object.entries(bB).sort((a, b) => b[1].sav - a[1].sav).slice(0, 5);
  $('d-banks').innerHTML = banksTop.length ? banksTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${x.n} ${t('sessions')}</div></span>
      <span class="tv" style="color:var(--accent-dark)">−${money(x.sav)}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;

  // en çok lokasyonlar
  const bL = {};
  all.forEach(r => { if (r.loc) {
    (bL[r.loc] ||= {n: 0, tl: 0});
    bL[r.loc].n++; bL[r.loc].tl += amtB(r);
  }});
  const locsTop = Object.entries(bL).sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  $('d-locs').innerHTML = locsTop.length ? locsTop.map(([name, x], i) =>
    `<div class="tl"><span class="rank">${i + 1}</span>
      <span class="tn">${esc(name)}<div class="ts">${money(x.tl)}</div></span>
      <span class="tv">${x.n} ${t('sessions')}</span></div>`).join('')
    : `<div class="tl" style="color:var(--faint)">${t('noData')}</div>`;
}

function rowHTML(r, withDelete) {
  const s = savingsOf(r);
  const cs = symOf(r.cur || S.currency);
  return `<div class="crow" data-id="${r.id}">
    <div class="avatar" style="background:${colorFor(r.firma)}">${esc(r.firma.charAt(0).toUpperCase())}</div>
    <div class="mid">
      <div class="name">${esc(r.firma)}</div>
      <div class="sub">${shortDate(r.tarih)} · ${r.kwh} kWh · ${r.tip || 'DC'}${r.mesafeKm ? ' · ' + Math.round(distDisp(r.mesafeKm)) + ' ' + S.unit : ''}</div>
    </div>
    <div class="right">
      <div class="amt">${r.free ? '<span class="free-tag">' + t('free') + '</span>' : fm(cs, Math.round(r.odenen).toLocaleString('tr-TR'))}</div>
      <div class="sav">${s > 0 ? '−' + fm(cs, Math.round(s).toLocaleString('tr-TR')) : ''}</div>
    </div>
    ${withDelete ? `<button class="del" data-del="${r.id}">×</button>` : ''}
  </div>`;
}

// ============================================================
// GEÇMİŞ
// ============================================================
async function renderHistory() {
  const all = await db.sessions.toArray();
  const vehicles = await db.vehicles.toArray();
  const sorted = [...all].sort((a, b) => b.tarih.localeCompare(a.tarih));

  const years = [...new Set(sorted.map(r => r.tarih.slice(0, 4)))].sort().reverse();
  const firms = [...new Set(sorted.map(r => r.firma))].sort((a, b) => a.localeCompare(b));
  const banks = [...new Set(sorted.map(r => r.banka).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const locs2 = [...new Set(sorted.map(r => r.loc).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const keep = (sel, opts) => opts.includes(sel.value) ? sel.value : '';
  const fy = $('f-year'), ff = $('f-firm'), ft = $('f-type'), fv = $('f-veh'),
        fb = $('f-bank'), fl = $('f-loc');
  let vy = keep(fy, years); const vf = keep(ff, firms);
  const vb = keep(fb, banks), vl = keep(fl, locs2);
  if (histYear) { if (years.includes(histYear)) vy = histYear; histYear = null; }
  const vt = ['DC','AC','free'].includes(ft.value) ? ft.value : '';
  const vv = vehicles.some(v => String(v.id) === fv.value) ? fv.value : '';
  fy.innerHTML = `<option value="">${t('allYears')}</option>` + years.map(y => `<option>${y}</option>`).join('');
  ff.innerHTML = `<option value="">${t('allFirms')}</option>` + firms.map(f => `<option>${esc(f)}</option>`).join('');
  ft.innerHTML = `<option value="">${t('allTypes')}</option><option value="DC">DC</option><option value="AC">AC</option><option value="free">${t('free')}</option>`;
  fv.style.display = vehicles.length > 1 ? '' : 'none';
  fv.innerHTML = `<option value="">${t('allVehicles')}</option>` +
    vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  fb.style.display = banks.length ? '' : 'none';
  fb.innerHTML = `<option value="" hidden>${t('bank')}</option><option value="">${t('viewAll')}</option>` +
    banks.map(x => `<option>${esc(x)}</option>`).join('');
  fl.style.display = locs2.length ? '' : 'none';
  fl.innerHTML = `<option value="" hidden>${t('location')}</option><option value="">${t('viewAll')}</option>` +
    locs2.map(x => `<option>${esc(x)}</option>`).join('');
  fy.value = vy; ff.value = vf; ft.value = vt; fv.value = vv; fb.value = vb; fl.value = vl;

  const rows = sorted.filter(r =>
    (!vy || r.tarih.slice(0, 4) === vy) &&
    (!vf || r.firma === vf) &&
    (!vt || (vt === 'free' ? r.free : r.tip === vt)) &&
    (!vv || String(r.aracId) === vv) &&
    (!vb || r.banka === vb) &&
    (!vl || r.loc === vl));

  const box = $('h-groups');
  if (!rows.length) { box.innerHTML = `<div class="empty">${t('noData')}</div>`; return; }

  const groups = [];
  let last = null;
  rows.forEach(r => {
    const key = monthKey(r.tarih);
    if (key !== last) {
      const [y, m] = key.split('-');
      groups.push({label: MONTHS[S.lang][+m - 1] + ' ' + y, items: []});
      last = key;
    }
    groups[groups.length - 1].items.push(r);
  });
  box.innerHTML = groups.map(g =>
    `<div class="month-group">
      <div class="section-lbl">${g.label}</div>
      <div class="rows">${g.items.map(r => rowHTML(r, true)).join('')}</div>
    </div>`).join('');

  box.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm(t('deleteAsk'))) return;
      const delRec = await db.sessions.get(+b.dataset.del);
      await db.sessions.delete(+b.dataset.del);
      if (delRec) await bumpVehicleKm(delRec.aracId, -(delRec.mesafeKm || 0));
      toast(t('deleted'));
      renderHistory();
    }));
  box.querySelectorAll('.crow').forEach(el =>
    el.addEventListener('click', () => openAdd(+el.dataset.id)));
}
['f-year','f-firm','f-type','f-veh','f-bank','f-loc'].forEach(id => $(id).addEventListener('change', renderHistory));
let histYear = null;

// ============================================================
// KIYASLA
// ============================================================
$('c-fuel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('c-fuel').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  $('c-hybrid-note').style.display = b.dataset.v === 'hybrid' ? '' : 'none';
});
$('c-vehsel').addEventListener('change', () => { S.cmpVeh = $('c-vehsel').value; renderCompare(); });
$('c-calc').addEventListener('click', async () => {
  const price = pf($('c-price').value);
  const cons = pf($('c-cons').value);
  if (!price || !cons || price <= 0 || cons <= 0) return;
  S.cmp = {fuel: $('c-fuel').querySelector('.sel').dataset.v, price, cons,
    icefix: Math.max(0, pf($('c-icefix').value) || 0),
    prorate: $('c-prorate').checked};
  await saveSetting('cmp', S.cmp);
  renderCompare();
});

async function renderCompare() {
  const vehicles = (await db.vehicles.toArray()).filter(v => !v.archived);
  const wrap = $('wrap-c-veh');
  wrap.style.display = vehicles.length > 1 ? '' : 'none';
  if (vehicles.length > 1) {
    const cur = S.cmpVeh;
    $('c-vehsel').innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    $('c-vehsel').value = cur;
  }
  if (S.cmp) {
    $('c-price').value = String(S.cmp.price).replace('.', ',');
    $('c-cons').value = String(S.cmp.cons).replace('.', ',');
    $('c-icefix').value = S.cmp.icefix ? String(S.cmp.icefix).replace('.', ',') : '';
    $('c-prorate').checked = S.cmp.prorate !== false;
    $('c-fuel').querySelectorAll('button').forEach(x =>
      x.classList.toggle('sel', x.dataset.v === S.cmp.fuel));
    $('c-hybrid-note').style.display = S.cmp.fuel === 'hybrid' ? '' : 'none';
  }

  // ---- Araç giderleri: hesaplamaya dahil edilir (liste/kategori UI'ı Aracım sekmesinde) ----
  const exAll = await db.expenses.toArray();
  const ex = S.cmpVeh
    ? exAll.filter(e => String(e.aracId) === S.cmpVeh || !e.aracId)
    : exAll;

  const box = $('c-result');
  if (!S.cmp) { box.style.display = 'none'; return; }

  const all = vehFilter(await db.sessions.toArray(), S.cmpVeh);
  let wd = all.filter(r => r.mesafeKm > 0);
  let distKm = wd.reduce((s, r) => s + r.mesafeKm, 0);
  let net = wd.reduce((s, r) => s + amtB(r), 0);
  let gross = net + wd.reduce((s, r) => s + savB(r), 0);
  // kayıt bazlı mesafe yoksa: kilometre sayacı (seçili araç ya da tek araç)
  const odoV2 = pickOdoVeh(vehicles, S.cmpVeh);
  const odoDist = odoDistOf(odoV2);
  let odoMode = false;
  if (distKm < 20 && odoDist >= 20) {
    odoMode = true;
    distKm = odoDist;
    net = all.filter(isConv).reduce((s, r) => s + amtB(r), 0);
    gross = net + all.filter(isConv).reduce((s, r) => s + savB(r), 0);
    // grafik/aylık dağıtım için: mesafeyi harcamayla orantılı paylaştır
    wd = all.filter(isConv).map(r =>
      ({...r, mesafeKm: net > 0 ? amtB(r) / net * odoDist : 0}));
  }
  $('c-dist-src').textContent = odoMode ? t('distFromOdo') : (distKm >= 20 ? t('distFromRecords') : '');
  box.style.display = '';
  if (distKm < 20) {
    $('c-ev').textContent = '—'; $('c-ice').textContent = '—';
    $('c-ev-g').textContent = '—'; $('c-disc-fx').textContent = '—';
    $('c-1km').textContent = '—'; $('c-1km-g').textContent = '—';
    $('c-ice1km').textContent = '—';
    ['c-exptot','c-icefixtot','c-tcoev','c-tcoice','c-tco1km','c-tcoice1km'].forEach(id => $(id).textContent = '—');
    $('c-perkm').textContent = t('needData');
    $('c-perkm').style.fontSize = '15px';
    $('c-per100').textContent = '';
    ['c-nf-ev-km','c-nf-ice-km','c-nf-ev-100','c-nf-ice-100','c-nf-ev-yr','c-nf-ice-yr','c-nf-kwh','c-nf-diff']
      .forEach(id => $(id).textContent = '—');
    $('c-nf-diff-pill').textContent = '';
    $('c-nf-bar-ev').style.width = '0%'; $('c-nf-bar-ice').style.width = '0%';
    $('c-nf-bar-ev-lbl').textContent = ''; $('c-nf-bar-ice-lbl').textContent = '';
    return;
  }
  $('c-perkm').style.fontSize = '28px';

  const f = distFactor();                       // 100 birim = 100*f km
  const evNetPerKm = net / distKm;
  const evGrossPerKm = gross / distKm;
  const icePerKm = S.cmp.price * S.cmp.cons / 100;

  $('c-1km').textContent = money2(evNetPerKm * f);
  $('c-ice1km').textContent = money2(icePerKm * f);
  $('c-1km-g').textContent = money2(evGrossPerKm * f);
  $('c-ev').textContent = money2(evNetPerKm * 100 * f);
  $('c-ev-g').textContent = money2(evGrossPerKm * 100 * f);
  $('c-ice').textContent = money2(icePerKm * 100 * f);
  $('c-disc-fx').textContent = '−' + money2((evGrossPerKm - evNetPerKm) * 100 * f);
  $('c-perkm').textContent = money2((icePerKm - evNetPerKm) * f) + ' / ' + S.unit;
  $('c-per100').textContent = t('per100', {v: money((icePerKm - evNetPerKm) * 100 * f), u: S.unit});

  // --- bugüne kadar kümülatif: EV gerçek vs yakıtlı (aynı km) ---
  const iceTot = distKm * icePerKm;
  $('c-dist-lbl').textContent = t('totalDist');
  $('c-dist').textContent = Math.round(distDisp(distKm)).toLocaleString('tr-TR') + ' ' + S.unit;
  $('c-evtot').textContent = money(net);
  $('c-icetot').textContent = money(iceTot);
  $('c-savetot').textContent = '+' + money(Math.max(0, iceTot - net));

  // kayıt bazlı kümülatif çizgiler (ilk kayıttan itibaren, son 14 nokta)
  const seq = [...wd].sort((a, b) => a.tarih.localeCompare(b.tarih));
  let cumEv = 0, cumIce = 0;
  const ptsEvAll = [], ptsIceAll = [], labelsAll = [];
  seq.forEach(r => {
    cumEv += amtB(r);
    cumIce += r.mesafeKm * icePerKm;
    ptsEvAll.push(cumEv); ptsIceAll.push(cumIce);
    labelsAll.push(shortDate(r.tarih));
  });
  const cut = Math.max(0, ptsEvAll.length - 14);
  drawLineChart('c-line', labelsAll.slice(cut), [
    {pts: ptsEvAll.slice(cut), color: '#1C8742'},
    {pts: ptsIceAll.slice(cut), color: '#1B5FAA'}
  ]);

  // ---- TOPLAM SAHİP OLMA MALİYETİ (şarj + giderler) ----
  const expReal = ex.reduce((s, e) => s + expB(e), 0);
  const dates = [...all.map(r => r.tarih.slice(0, 10)), ...ex.map(e => e.tarih)].sort();
  const days = dates.length > 1
    ? Math.max(30, (new Date(dates[dates.length - 1]) - new Date(dates[0])) / 864e5) : 365;
  const yearly = ['tax', 'insurance'];          // doğası gereği yıllık kalemler
  const pr = S.cmp.prorate !== false && days < 365 ? days / 365 : 1;
  const expTot = ex.reduce((s, e) =>
    s + expB(e) * (yearly.includes(e.tur) ? pr : 1), 0);
  const tcoEv = net + expTot;
  const iceFix = (S.cmp.icefix || 0) * days / 365;
  const tcoIce = iceTot + iceFix;
  $('c-exptot').textContent = money(expTot);
  $('c-icefixtot').textContent = money(iceFix);
  $('c-tcoev').textContent = money(tcoEv);
  $('c-tco1km-lbl').textContent = t('tco1km', {u: S.unit});
  $('c-tco1km').textContent = money2(tcoEv / distKm * f);
  $('c-tcoice1km-lbl').textContent = t('tco1kmIce', {u: S.unit});
  $('c-tcoice1km').textContent = money2(tcoIce / distKm * f);
  $('c-tcoice').textContent = money(tcoIce);
  const tcoSave = tcoIce - tcoEv;
  $('c-tcosave').textContent = (tcoSave >= 0 ? '+' : '') + money(tcoSave);
  $('c-tcosave').style.color = tcoSave >= 0 ? 'var(--accent-dark)' : 'var(--red)';
  $('c-tcopill').textContent = t('per100', {v: money(tcoSave / distKm * 100 * f), u: S.unit});
  $('c-tco-note').textContent = t('tcoNote', {d: Math.round(days), f: money(iceFix)}) +
    (pr < 1 ? ' ' + t('prorateNote', {p: Math.round(pr * 100), r: money(expReal)}) : '');

  // ---- Yakıt dışı gider kıyaslaması (EV vs Yakıtlı) ----
  // Yakıtlı aracın yıllık sabit gideri girilmemişse (opsiyonel alan) kıyas anlamsız olur — gizle.
  if (!S.cmp.icefix) { $('c-nf-wrap').style.display = 'none'; return; }
  $('c-nf-wrap').style.display = '';
  const kwhSum = all.reduce((s, r) => s + (r.kwh || 0), 0);
  const nfEvPerKm = expTot / distKm;
  const nfIcePerKm = iceFix / distKm;
  $('c-nf-ev-km').textContent = money2(nfEvPerKm * f);
  $('c-nf-ice-km').textContent = money2(nfIcePerKm * f);
  $('c-nf-ev-100').textContent = money2(nfEvPerKm * 100 * f);
  $('c-nf-ice-100').textContent = money2(nfIcePerKm * 100 * f);
  const nfEvYear = expTot / days * 365;
  const nfIceYear = S.cmp.icefix || 0;
  $('c-nf-ev-yr').textContent = money(nfEvYear);
  $('c-nf-ice-yr').textContent = money(nfIceYear);
  $('c-nf-kwh').textContent = kwhSum ? money2(expTot / kwhSum) + '/kWh' : '—';
  const nfDiff = nfIceYear - nfEvYear;
  $('c-nf-diff').textContent = (nfDiff >= 0 ? '+' : '') + money(nfDiff);
  $('c-nf-diff').style.color = nfDiff >= 0 ? 'var(--accent-dark)' : 'var(--red)';
  $('c-nf-diff-pill').textContent = t('per100', {v: money((nfIcePerKm - nfEvPerKm) * 100 * f), u: S.unit});
  $('c-nf-bar-ev-lbl').textContent = money(nfEvYear);
  $('c-nf-bar-ice-lbl').textContent = money(nfIceYear);
  const nfMax = Math.max(1, nfEvYear, nfIceYear);
  $('c-nf-bar-ev').style.width = Math.round(nfEvYear / nfMax * 100) + '%';
  $('c-nf-bar-ice').style.width = Math.round(nfIceYear / nfMax * 100) + '%';
}

// ---------- basit SVG çizgi grafik ----------
function drawLineChart(id, labels, series) {
  const W = 340, H = 170, padL = 8, padR = 8, padT = 12, padB = 22;
  const n = labels.length;
  const svg = $(id);
  if (n < 2) { svg.innerHTML = ''; return; }
  const maxV = Math.max(1, ...series.flatMap(s => s.pts));
  const x = i => padL + i * (W - padL - padR) / (n - 1);
  const y = v => padT + (1 - v / maxV) * (H - padT - padB);
  // yatay kılavuz çizgileri
  const gCol = getComputedStyle(document.documentElement).getPropertyValue('--track').trim() || '#E3EAE4';
  let out = [0.25, 0.5, 0.75, 1].map(f =>
    `<line x1="${padL}" y1="${y(maxV * f)}" x2="${W - padR}" y2="${y(maxV * f)}"
      stroke="${gCol}" stroke-width="1"/>`).join('');
  series.forEach(s => {
    const d = s.pts.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    // dolgu (yalnızca ilk seri — EV)
    out += `<path d="${d}" pathLength="1" fill="none" stroke="${s.color}" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"/>`;
    out += s.pts.map((v, i) =>
      `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="${s.color}"/>`).join('');
  });
  // etiketler (en fazla 6 tanesini göster)
  const step = Math.ceil(n / 6);
  out += labels.map((l, i) => i % step ? '' :
    `<text x="${x(i).toFixed(1)}" y="${H - 6}" font-size="9" fill="#8B918C"
      text-anchor="middle" font-family="inherit">${l}</text>`).join('');
  svg.innerHTML = out;
}

// ============================================================
// AYARLAR
// ============================================================
async function renderSettings() {
  $('app-version').textContent = APP_VERSION + ' · ' + APP_DATE;
  const c = COUNTRIES.find(x => x[0] === S.country);
  $('set-country-val').textContent = c ? c[1] + ' ' + c[2] : '—';

  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('set-currency').innerHTML = curs.map(k =>
    `<option value="${k}" ${k === S.currency ? 'selected' : ''}>${k} (${symOf(k)})</option>`).join('');
  $('set-unit').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === S.unit));
  $('set-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}" ${k === S.lang ? 'selected' : ''}>${LANG_NAMES[k]}</option>`).join('');
  $('set-adv').checked = !!S.advOpen;
  $('set-theme').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (S.theme || 'light')));
  renderBankCountries();
}

// ============================================================
// ARACIM (araç listesi + araç giderleri)
// ============================================================
async function renderVehiclePage() {
  const allV = await db.vehicles.toArray();
  const vehicles = allV.filter(v => !v.archived);
  const archived = allV.filter(v => v.archived);
  $('set-vehicles').innerHTML = vehicles.length ? vehicles.map(v => {
    const kmTxt = v.kmNow ? Math.round(distDisp(v.kmNow)).toLocaleString('tr-TR') + ' ' + S.unit : '';
    const sub = [v.batt ? `${v.trim || ''} · ${v.batt} kWh` : '', kmTxt].filter(Boolean).join(' · ');
    const isDef = v.id === S.defaultVehicleId || (!S.defaultVehicleId && vehicles[0].id === v.id);
    const thumb = v.photo ? `<img class="vthumb" src="${v.photo}" alt="">` : '';
    return `<li data-vid="${v.id}">
      <button class="star ${isDef ? 'on' : ''}" data-star="${v.id}" title="varsayılan">★</button>
      ${thumb}
      <div class="vn">${esc(vehName(v))}<div class="vd">${esc(sub)}</div></div>
      <button class="cam" data-odo="${v.id}" title="kilometre güncelle" style="font-size:11px;font-weight:800;width:36px">km✎</button>
      <button class="cam" data-cam="${v.id}" title="fotoğraf">📷</button>
      <button class="rm" data-rm="${v.id}" title="arşivle">×</button>
    </li>`;
  }).join('') : `<li style="color:var(--faint);font-weight:400">${t('noData')}</li>`;

  $('arch-lbl').style.display = archived.length ? '' : 'none';
  $('set-archived').innerHTML = archived.map(v =>
    `<li><div class="vn">${esc(vehName(v))}<div class="vd">${t('archivedTag')}</div></div>
     <button class="undo" data-undo="${v.id}">${t('restore')}</button></li>`).join('');
  $('set-archived').querySelectorAll('[data-undo]').forEach(b =>
    b.addEventListener('click', async () => {
      await db.vehicles.update(+b.dataset.undo, {archived: false});
      renderVehiclePage();
    }));

  $('set-vehicles').querySelectorAll('[data-star]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      S.defaultVehicleId = +b.dataset.star;
      await saveSetting('defaultVehicleId', S.defaultVehicleId);
      renderVehiclePage();
    }));
  $('set-vehicles').querySelectorAll('[data-cam]').forEach(b =>
    b.addEventListener('click', e => {
      e.stopPropagation();
      photoTargetVid = +b.dataset.cam;
      $('car-photo').click();
    }));
  $('set-vehicles').querySelectorAll('[data-rm]').forEach(b =>
    b.addEventListener('click', async e => {
      e.stopPropagation();
      const vid = +b.dataset.rm;
      const hasRecords = await db.sessions.where('aracId').equals(vid).count();
      if (hasRecords) {
        // kayıtlar korunur: silmek yerine arşivle
        await db.vehicles.update(vid, {archived: true});
        toast(t('archivedToast'));
      } else if (confirm(t('deleteAsk'))) {
        await db.vehicles.delete(vid);
      }
      if (S.defaultVehicleId === vid) {
        const rest = (await db.vehicles.toArray()).filter(v => !v.archived);
        S.defaultVehicleId = rest[0]?.id || null;
        await saveSetting('defaultVehicleId', S.defaultVehicleId);
      }
      renderVehiclePage();
    }));
  // 🛣️ butonu → kilometre güncelle
  $('set-vehicles').querySelectorAll('[data-odo]').forEach(li =>
    li.addEventListener('click', async e => {
      e.stopPropagation();
      const v = allV.find(x => x.id === +li.dataset.odo);
      if (!v) return;
      const cur = v.kmNow ? Math.round(distDisp(v.kmNow)) : '';
      const inp = prompt(t('odoPrompt', {u: S.unit}), cur);
      if (inp == null) return;
      const val = pf(inp);
      if (isNaN(val) || val < 0) return;
      const km = Math.round(S.unit === 'mi' ? val * MI : val);
      const upd = {kmNow: km};
      const sDef = v.kmStart != null ? Math.round(distDisp(v.kmStart)) : Math.round(distDisp(km));
      const sIn = prompt(t('odoStartPrompt', {u: S.unit}), sDef);
      if (sIn != null) {
        const sVal = pf(sIn);
        if (!isNaN(sVal) && sVal >= 0)
          upd.kmStart = Math.round(S.unit === 'mi' ? sVal * MI : sVal);
      }
      if (upd.kmStart == null) upd.kmStart = v.kmStart ?? km;
      // ters girilmişse (başlangıç > güncel) yer değiştir
      if (upd.kmStart > upd.kmNow) [upd.kmStart, upd.kmNow] = [upd.kmNow, upd.kmStart];
      await db.vehicles.update(v.id, upd);
      toast(t('odoSaved'));
      renderVehiclePage();
    }));

  // ---- Araç giderleri (araç filtreli) ----
  const wrapVehExp = $('wrap-veh-exp');
  wrapVehExp.style.display = vehicles.length > 1 ? '' : 'none';
  if (vehicles.length > 1) {
    const cur = S.vehExpVeh;
    $('veh-exp-sel').innerHTML = `<option value="">${t('allVehicles')}</option>` +
      vehicles.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
    $('veh-exp-sel').value = cur;
  }
  const expVehName = S.vehExpVeh
    ? vehName(vehicles.find(v => String(v.id) === S.vehExpVeh))
    : (vehicles.length === 1 ? vehName(vehicles[0]) : '');
  $('c-exp-title').textContent = t('expenses') + (expVehName ? ' — ' + expVehName : '');
  const exAllV = await db.expenses.toArray();
  const ex = S.vehExpVeh
    ? exAllV.filter(e => String(e.aracId) === S.vehExpVeh || !e.aracId)
    : exAllV;

  // ---- toplam gider metrikleri (şarj + sabit) ----
  const sessV = vehFilter(await db.sessions.toArray(), S.vehExpVeh);
  const chargeTot = sessV.reduce((s, r) => s + amtB(r), 0);
  const fixedTot = ex.reduce((s, e) => s + expB(e), 0);
  $('v-total-cost').textContent = money(chargeTot + fixedTot);
  $('v-exp-total').textContent = money(fixedTot);

  // ---- sabit gider grafiği (Ay/Yıl) ----
  const gran = S.vehExpGran || 'month';
  $('v-exp-gran').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === gran));
  $('v-exp-chart-wrap').style.display = ex.length ? '' : 'none';
  if (ex.length) {
    const now = new Date();
    const ebars = [];
    if (gran === 'year') {
      for (let i = 4; i >= 0; i--) {
        const y = String(now.getFullYear() - i);
        ebars.push({label: y,
          sum: ex.filter(e => e.tarih.slice(0, 4) === y).reduce((s, e) => s + expB(e), 0)});
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        ebars.push({label: MONTHS[S.lang][d.getMonth()].slice(0, 3),
          sum: ex.filter(e => e.tarih.slice(0, 7) === key).reduce((s, e) => s + expB(e), 0)});
      }
    }
    const maxE = Math.max(1, ...ebars.map(b => b.sum));
    $('v-exp-chart').innerHTML = ebars.map(b =>
      `<div class="mb">
        <div class="amt">${b.sum ? money(b.sum) : ''}</div>
        <div class="bar" style="height:${6 + Math.round(b.sum / maxE * 66)}px"></div>
        <div class="m">${b.label}</div>
      </div>`).join('');
  }

  const expList = $('c-exp-list');
  if (!ex.length) {
    expList.innerHTML = `<div class="about" style="margin:0">${t('noExpenses')}</div>`;
    $('c-exp-cats-wrap').style.display = 'none';
  } else {
    const sortedExp = [...ex].sort((a, b) => b.tarih.localeCompare(a.tarih));
    expList.innerHTML = sortedExp.map(e => `
      <div class="crow" data-exp="${e.id}" style="cursor:pointer">
        <div class="avatar" style="background:var(--chip);color:var(--accent-text)">${EXP_ICON[e.tur] || '📦'}</div>
        <div class="mid">
          <div class="name">${e.altAd ? esc(e.altAd) : t('exp_' + e.tur)}</div>
          <div class="sub">${shortDate(e.tarih + 'T00:00')}${e.not ? ' · ' + esc(e.not) : ''}</div>
        </div>
        <div class="right"><div class="amt">${fm(symOf(e.cur || S.currency), Math.round(e.tutar).toLocaleString('tr-TR'))}</div></div>
      </div>`).join('');
    expList.querySelectorAll('[data-exp]').forEach(el =>
      el.addEventListener('click', async () =>
        openExpense(await db.expenses.get(+el.dataset.exp))));
    // "Diğer" türünde özel başlık (altAd) girilmişse kendi kategorisi gibi ayrı gösterilir
    const byCat = {};
    ex.forEach(e => {
      const key = (e.tur === 'other' && e.altAd) ? 'other:' + e.altAd.toLowerCase() : e.tur;
      (byCat[key] ||= {label: (e.tur === 'other' && e.altAd) ? e.altAd : t('exp_' + e.tur), icon: EXP_ICON[e.tur] || '📦', sum: 0});
      byCat[key].sum += expB(e);
    });
    const cats = Object.values(byCat).sort((a, b) => b.sum - a.sum);
    const maxC = Math.max(1, ...cats.map(c => c.sum));
    $('c-exp-cats-wrap').style.display = '';
    $('c-exp-cats').innerHTML = cats.map(c => `
      <div class="tl">
        <div class="tn">${c.icon} ${esc(c.label)}</div>
        <div class="tbar"><div style="width:${Math.round(c.sum / maxC * 100)}%"></div></div>
        <div class="tv">${money(c.sum)}</div>
      </div>`).join('');
  }
}
$('veh-exp-sel').addEventListener('change', () => {
  S.vehExpVeh = $('veh-exp-sel').value;
  renderVehiclePage();
});
$('v-exp-gran').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  S.vehExpGran = b.dataset.v;
  renderVehiclePage();
});
let photoTargetVid = null;
$('car-photo').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const dataUrl = await resizePhoto(file);
    if (photoTargetVid) {
      await db.vehicles.update(photoTargetVid, {photo: dataUrl});
      photoTargetVid = null;
      toast(t('photoAdded'));
      renderVehiclePage();
    } else if (carPick) {
      carPick.photo = dataUrl;
      $('car-summary').innerHTML = evSummaryHTML(carPick) + photoBtnHTML(true);
      bindPhotoBtn();
    }
  } catch { /* okunamadı */ }
});

$('set-currency').addEventListener('change', async e => {
  S.currency = e.target.value;
  await saveSetting('currency', S.currency);
  applyI18n(); renderSettings();
});
$('set-unit').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  S.unit = b.dataset.v;
  await saveSetting('unit', S.unit);
  applyI18n(); renderSettings();
});
$('set-lang').addEventListener('change', async e => {
  S.lang = e.target.value;
  await saveSetting('lang', S.lang);
  applyI18n(); renderSettings();
});
$('set-theme').addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  S.theme = b.dataset.v;
  await saveSetting('theme', S.theme);
  applyTheme();
  $('set-theme').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  renderSettings();
});
$('set-adv').addEventListener('change', async e => {
  S.advOpen = e.target.checked;
  await saveSetting('advOpen', S.advOpen);
});

// ---------- ülke seçici (ayarlar) ----------
function renderCountryList(query) {
  const q = (query || '').toLocaleLowerCase('tr');
  const list = COUNTRIES.filter(c =>
    c[2].toLocaleLowerCase('tr').includes(q) || c[0].toLowerCase().includes(q));
  const box = $('country-list');
  box.innerHTML = list.map(c =>
    `<div class="country-item ${c[0] === S.country ? 'sel' : ''}" data-code="${c[0]}">
      <div class="flag">${c[1]}</div>
      <div class="n">${esc(c[2])}</div>
      <div class="c">${c[3]} · ${c[5]}</div>
    </div>`).join('');
  box.querySelectorAll('.country-item').forEach(el =>
    el.addEventListener('click', async () => {
      const c = COUNTRIES.find(x => x[0] === el.dataset.code);
      if (countryPickMode === 'bank') {
        const codes = S.bankCountries && S.bankCountries.length ? [...S.bankCountries] : [S.country];
        if (!codes.includes(c[0])) codes.push(c[0]);
        S.bankCountries = codes;
        await saveSetting('bankCountries', codes);
        $('page-country').classList.remove('active');
        renderBankCountries();
        return;
      }
      S.country = c[0]; S.currency = c[3]; S.unit = c[5];
      if (LANG_NAMES[c[6]]) S.lang = c[6];
      for (const [k, v] of [['country', S.country], ['currency', S.currency], ['unit', S.unit], ['lang', S.lang]])
        await saveSetting(k, v);
      $('page-country').classList.remove('active');
      applyI18n(); renderSettings();
    }));
}
let countryPickMode = 'region';   // 'region' | 'bank'
$('btn-country').addEventListener('click', () => {
  countryPickMode = 'region';
  $('country-search').value = '';
  renderCountryList('');
  $('page-country').classList.add('active');
});
$('btn-add-bankc').addEventListener('click', () => {
  countryPickMode = 'bank';
  $('country-search').value = '';
  renderCountryList('');
  $('page-country').classList.add('active');
});
function renderBankCountries() {
  const codes = (S.bankCountries && S.bankCountries.length) ? S.bankCountries : [S.country];
  $('set-bankc').innerHTML = codes.map(cc => {
    const c = COUNTRIES.find(x => x[0] === cc);
    return `<button type="button" class="chip" data-cc="${cc}">${c ? c[1] + ' ' + c[2] : cc} ×</button>`;
  }).join('');
  $('set-bankc').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', async () => {
      let codes2 = (S.bankCountries || [S.country]).filter(x => x !== b.dataset.cc);
      if (!codes2.length) codes2 = [S.country];
      S.bankCountries = codes2;
      await saveSetting('bankCountries', codes2);
      renderBankCountries();
    }));
}
$('btn-close-country').addEventListener('click', () => $('page-country').classList.remove('active'));
$('country-search').addEventListener('input', e => renderCountryList(e.target.value));

// ---------- araç arama (ortak) ----------
function searchEV(q) {
  q = (q || '').toLocaleLowerCase('tr').trim();
  if (q.length < 2) return [];
  return EV_DB
    .map((e, i) => ({i, brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
      batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]}))
    .filter(v => (v.brand + ' ' + v.model + ' ' + v.trim).toLocaleLowerCase('tr').includes(q))
    .slice(0, 14);
}
function photoBtnHTML(has) {
  return `<button class="photo-btn" id="btn-carphoto" type="button">${t(has ? 'changePhoto' : 'addPhoto')}</button>`;
}
function bindPhotoBtn() {
  const b = $('btn-carphoto');
  if (b) b.addEventListener('click', () => { photoTargetVid = null; $('car-photo').click(); });
}
function bindEVSearch(inputId, resultsId, summaryId, onSel, withPhoto) {
  $(inputId).addEventListener('input', () => {
    const res = searchEV($(inputId).value);
    onSel(null);
    $(summaryId).style.display = 'none';
    const box = $(resultsId);
    const qv = $(inputId).value.trim();
    if (!res.length && qv.length >= 2) {
      box.innerHTML = `<button class="chip" style="align-self:flex-start" id="${resultsId}-custom">${t('customAdd', {q: esc(qv)})}</button>`;
      $(resultsId + '-custom').addEventListener('click', () => {
        const custom = {ad: qv, body: 'suv'};
        $(summaryId).innerHTML = evSummaryHTML(custom) + (withPhoto ? photoBtnHTML(false) : '');
        $(summaryId).style.display = '';
        if (withPhoto) bindPhotoBtn();
        onSel(custom);
        box.innerHTML = '';
      });
      return;
    }
    box.innerHTML = res.map(v => {
      const yr = v.y1 + (v.y2 ? '–' + v.y2 : '+');
      return `<div class="ev-item" data-i="${v.i}">
        <div class="n">${esc(v.brand)} ${esc(v.model)}</div>
        <div class="d">${esc(v.trim)} · ${yr} · ${v.batt} kWh · ${v.arch}V</div>
      </div>`;
    }).join('');
    box.querySelectorAll('.ev-item').forEach(el =>
      el.addEventListener('click', () => {
        box.querySelectorAll('.ev-item').forEach(x =>
          x.classList.toggle('sel', x === el));
        const e = EV_DB[+el.dataset.i];
        const v = {brand: e[0], model: e[1], trim: e[2], y1: e[3], y2: e[4],
          batt: e[5], arch: e[6], dc: e[7], ac: e[8], range: e[9], body: e[10]};
        $(summaryId).innerHTML = evSummaryHTML(v) + (withPhoto ? photoBtnHTML(false) : '');
        $(summaryId).style.display = '';
        if (withPhoto) bindPhotoBtn();
        onSel(v);
      }));
  });
}

// ---------- ayarlardan araç ekleme ----------
let carPick = null;
bindEVSearch('car-search', 'car-results', 'car-summary', v => {
  carPick = v;
  $('car-save').disabled = !v;
}, true);
$('btn-add-vehicle').addEventListener('click', () => {
  $('car-search').value = ''; $('car-results').innerHTML = '';
  $('car-summary').style.display = 'none'; carPick = null;
  $('car-save').disabled = true;
  $('page-addcar').classList.add('active');
});
$('btn-close-addcar').addEventListener('click', () => $('page-addcar').classList.remove('active'));
$('car-save').addEventListener('click', async () => {
  if (!carPick) return;
  const id = await db.vehicles.add(vehicleRec(carPick));
  if (!S.defaultVehicleId) { S.defaultVehicleId = id; await saveSetting('defaultVehicleId', id); }
  toast(t('vehicleAdded'));
  $('page-addcar').classList.remove('active');
  renderVehiclePage();
});
function vehicleRec(v) {
  const rec = v.brand
    ? {ad: v.brand + ' ' + v.model, brand: v.brand, model: v.model, trim: v.trim,
       y1: v.y1, y2: v.y2, batt: v.batt, arch: v.arch, dc: v.dc, ac: v.ac,
       range: v.range, body: v.body}
    : {ad: v.ad, body: v.body || 'suv'};
  if (v.photo) rec.photo = v.photo;
  return rec;
}

// ============================================================
// KAYIT FORMU
// ============================================================
let editingId = null;
$('nav-plus').addEventListener('click', () => openAdd());
$('btn-close-add').addEventListener('click', () => $('page-add').classList.remove('active'));
$('btn-adv').addEventListener('click', () => {
  $('adv-fields').classList.toggle('open');
  $('btn-adv').textContent =
    $('adv-fields').classList.contains('open') ? t('advancedHide') : t('advanced');
});
$('in-free').addEventListener('change', () => {
  const free = $('in-free').checked;
  $('wrap-paid').style.display = free ? 'none' : '';
  $('wrap-disc').style.display = free ? 'none' : '';
});
$('in-tip').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-tip').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
});
$('in-disc-type').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $('in-disc-type').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  updateNetLine();
});
function updateNetLine() {
  const g = pf($('in-amount').value);
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  if (isNaN(g) || g < 0) { $('calc-net').textContent = '—'; return; }
  const type = $('in-disc-type').querySelector('.sel').dataset.v;
  const net = netFromGross(g, type, pf($('in-disc-val').value) || 0);
  $('calc-net').textContent = fm(symOf(c ? c[3] : S.currency),
    net.toLocaleString('tr-TR', {maximumFractionDigits: 2}));
}
['in-amount', 'in-disc-val'].forEach(id => $(id).addEventListener('input', updateNetLine));
// kWh kutuları: yalnız rakam, tam=3 / ondalık=2 hane
$('in-kwh-int').addEventListener('input', () => {
  $('in-kwh-int').value = $('in-kwh-int').value.replace(/\D/g, '').slice(0, 3);
});
$('in-kwh-dec').addEventListener('input', () => {
  $('in-kwh-dec').value = $('in-kwh-dec').value.replace(/\D/g, '').slice(0, 2);
});
$('in-firm').addEventListener('change', () => {
  $('in-firm-other').style.display = $('in-firm').value === '__other' ? '' : 'none';
});
$('in-country').addEventListener('change', () => formCountryChanged());
$('in-bank').addEventListener('change', async () => {
  if ($('in-bank').value !== '__newbank') return;
  const name = (prompt(t('newBankPrompt')) || '').trim();
  if (name) {
    S.customBanks = [...new Set([name, ...(S.customBanks || [])])].slice(0, 20);
    await saveSetting('customBanks', S.customBanks);
    $('in-bank').innerHTML = bankOptions();
    $('in-bank').value = name;
  } else {
    $('in-bank').value = '';
  }
});
$('btn-gps').addEventListener('click', () => {
  if (!navigator.geolocation) return toast(t('gpsFail'));
  $('btn-gps').textContent = '…';
  navigator.geolocation.getCurrentPosition(async p => {
    const {latitude: lat, longitude: lon} = p.coords;
    // 1) semt/mahalle adı (OpenStreetMap Nominatim)
    const place = await reverseGeo(lat, lon);
    $('in-loc').value = place || (lat.toFixed(5) + ', ' + lon.toFixed(5));
    // 2) yakındaki şarj istasyonları (Open Charge Map) — çip olarak öner
    const st = await nearbyStations(lat, lon);
    $('loc-chips').innerHTML = st.map(s =>
      `<button type="button" class="chip" data-n="${esc(s)}">${esc(s)}</button>`).join('');
    $('loc-chips').querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => { $('in-loc').value = b.dataset.n; }));
    $('btn-gps').textContent = '📍';
  }, () => { toast(t('gpsFail')); $('btn-gps').textContent = '📍'; },
  {timeout: 8000, maximumAge: 60000});
});
async function reverseGeo(lat, lon) {
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&accept-language=${S.lang}`,
      {signal: ctrl.signal, headers: {'Accept': 'application/json'}});
    clearTimeout(tm);
    if (!res.ok) return null;
    const a = (await res.json()).address || {};
    const narrow = a.neighbourhood || a.suburb || a.quarter || a.village || a.hamlet;
    const town = a.town || a.city || a.county || '';
    return narrow ? (narrow + (town ? ', ' + town : '')) : (town || null);
  } catch { return null; }
}
async function nearbyStations(lat, lon) {
  try {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=1&distanceunit=km&maxresults=4&compact=true&verbose=false`,
      {signal: ctrl.signal});
    clearTimeout(tm);
    if (!res.ok) return [];
    const j = await res.json();
    return (j || []).map(p => {
      const op = p.OperatorInfo && p.OperatorInfo.Title ? p.OperatorInfo.Title + ' — ' : '';
      return (op + (p.AddressInfo?.Title || '')).slice(0, 60);
    }).filter(Boolean);
  } catch { return []; }
}

function fillFirmSelect(code, current, usedCounts) {
  const used = Object.entries(usedCounts)
    .sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const home = t('homeChip');
  const list = [...new Set([home, ...used, ...chargersFor(code)])];
  const opts = list.map(f => `<option value="${esc(f)}">${esc(f)}</option>`).join('') +
    `<option value="__other">${t('other')}</option>`;
  $('in-firm').innerHTML = opts;
  if (current && list.includes(current)) {
    $('in-firm').value = current;
    $('in-firm-other').style.display = 'none';
  } else if (current) {
    $('in-firm').value = '__other';
    $('in-firm-other').value = current;
    $('in-firm-other').style.display = '';
  } else {
    $('in-firm').value = used[0] || list[1] || home;
    $('in-firm-other').style.display = 'none';
  }
}

async function formCountryChanged(keepRate) {
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const all = await db.sessions.toArray();
  const counts = {};
  all.forEach(r => { if ((r.ulke || S.country) === code) counts[r.firma] = (counts[r.firma] || 0) + 1; });
  const curFirm = $('in-firm').value === '__other'
    ? $('in-firm-other').value.trim()
    : $('in-firm').value;
  fillFirmSelect(code, curFirm && curFirm !== t('other') ? curFirm : '', counts);
  $('in-bank').innerHTML = bankOptions();
  $('in-amount-lbl').textContent = t('amount', {s: symOf(c[3])});

  // döviz kuru alanı
  const foreign = c[3] !== S.currency;
  $('wrap-rate').style.display = foreign ? '' : 'none';
  if (foreign) {
    $('rate-lbl').textContent = t('rateLbl', {f: c[3], b: S.currency});
    $('rate-note').textContent = t('rateNote', {b: S.currency});
    if (!keepRate) {
      $('in-rate').value = '';
      const got = await fetchRate(c[3], S.currency, $('in-date').value);
      if (got && $('in-country').value === code) {
        $('in-rate').value = String(Math.round(got.rate * 10000) / 10000).replace('.', ',');
        $('rate-note').textContent = t('rateAuto', {d: got.date}) + ' — ' + t('rateNote', {b: S.currency});
      }
    }
  }
}

async function openAdd(id) {
  editingId = id || null;
  const r = id ? await db.sessions.get(id) : null;
  $('add-title').textContent = t(id ? 'editTitle' : 'addTitle');
  $('form-err').classList.remove('show');

  const selCode = r?.ulke || S.country;
  $('in-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}" ${c[0] === selCode ? 'selected' : ''}>${c[1]} ${c[2]} (${c[3]})</option>`).join('');

  $('in-date').value = r ? r.tarih.slice(0, 10) : new Date().toISOString().slice(0, 10);
  $('in-tip').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === (r?.tip || 'DC')));

  // kWh: tam + ondalık kutuları
  const kwh = r?.kwh ?? '';
  $('in-kwh-int').value = (kwh === '' || !kwh) ? '' : Math.floor(kwh);
  $('in-kwh-dec').value = (kwh === '' || !kwh) ? ''
    : String(Math.round((kwh - Math.floor(kwh)) * 100)).padStart(2, '0');
  $('in-dist').value = r?.mesafeKm ? Math.round(distDisp(r.mesafeKm)) : '';
  $('in-free').checked = !!r?.free;
  const grossVal = r && !r.free
    ? (r.tutar != null ? r.tutar : (r.odenen || 0) + savingsOf(r)) : null;
  $('in-amount').value = grossVal != null && !isNaN(grossVal)
    ? String(Math.round(grossVal * 100) / 100).replace('.', ',') : '';
  const dt = r?.indirimTip === 'percent' ? 'percent' : 'amount';
  $('in-disc-type').querySelectorAll('button').forEach(b =>
    b.classList.toggle('sel', b.dataset.v === dt));
  $('in-disc-val').value = r?.indirimDeger ? String(r.indirimDeger).replace('.', ',') : '';
  const durMin = r?.dur || 0;
  $('in-dur-h').value = durMin ? Math.floor(durMin / 60) : '';
  $('in-dur-m').value = durMin ? durMin % 60 : '';
  $('in-loc').value = r?.loc || '';
  $('in-socb').value = r?.socB ?? '';
  $('in-soca').value = r?.socA ?? '';
  $('in-note').value = r?.not || '';
  $('in-rate').value = r?.rate ? String(r.rate).replace('.', ',') : '';
  $('in-free').dispatchEvent(new Event('change'));

  // firma / banka / kur — ülkeye göre (düzenlemede firmayı koru)
  await (async () => {
    const all = await db.sessions.toArray();
    const counts = {};
    all.forEach(x => { if ((x.ulke || S.country) === selCode) counts[x.firma] = (counts[x.firma] || 0) + 1; });
    fillFirmSelect(selCode, r?.firma || '', counts);
    $('in-bank').innerHTML = bankOptions();
    $('in-bank').value = r?.banka || '';
    const c = COUNTRIES.find(x => x[0] === selCode);
    $('in-amount-lbl').textContent = t('amount', {s: symOf(c[3])});
    const foreign = c[3] !== S.currency;
    $('wrap-rate').style.display = foreign ? '' : 'none';
    if (foreign) {
      $('rate-lbl').textContent = t('rateLbl', {f: c[3], b: S.currency});
      $('rate-note').textContent = t('rateNote', {b: S.currency});
      if (!r?.rate) formCountryChanged();
    }
  })();

  // lokasyon önerileri (daha önce girilenler)
  const locs = [...new Set((await db.sessions.toArray()).map(x => x.loc).filter(Boolean))];
  $('loc-list').innerHTML = locs.map(l => `<option value="${esc(l)}">`).join('');

  // indirim ve SoC hızlı çipleri
  $('disc-chips').innerHTML = [0, 10, 15, 20, 30].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}%</button>`).join('');
  $('disc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      $('in-disc-type').querySelectorAll('button').forEach(x =>
        x.classList.toggle('sel', x.dataset.v === 'percent'));
      $('in-disc-val').value = b.dataset.v;
    }));
  $('soc-chips').innerHTML = ['20-80','10-80','10-90','20-100','10-100','0-100'].map(v =>
    `<button type="button" class="chip" data-v="${v}">${v}</button>`).join('');
  $('soc-chips').querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => {
      const [a, c2] = b.dataset.v.split('-');
      $('in-socb').value = a; $('in-soca').value = c2;
    }));

  // araç seçimi (arşivdekiler hariç; düzenlenen kayıt arşivli araca aitse o da listelenir)
  let vehicles = (await db.vehicles.toArray()).filter(v => !v.archived || v.id === r?.aracId);
  $('wrap-vehicle').style.display = vehicles.length > 1 ? '' : 'none';
  $('in-vehicle').innerHTML = vehicles.map(v =>
    `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  $('in-vehicle').value = r?.aracId ?? S.defaultVehicleId ?? (vehicles[0]?.id || '');

  const advOpen = S.advOpen || !!(r && (r.dur || r.loc || r.not || r.banka));
  $('adv-fields').classList.toggle('open', advOpen);
  $('btn-adv').textContent = advOpen ? t('advancedHide') : t('advanced');

  $('page-add').classList.add('active');
  $('page-add').querySelector('.ov-body').scrollTop = 0;
}

$('btn-save').addEventListener('click', async () => {
  const firmSel = $('in-firm').value;
  const firma = firmSel === '__other' ? $('in-firm-other').value.trim() : firmSel;
  const kInt = parseInt($('in-kwh-int').value) || 0;
  const kDec = Math.min(99, parseInt($('in-kwh-dec').value) || 0);
  const kwh = kInt + kDec / 100;
  const free = $('in-free').checked;
  const amount = free ? 0 : pf($('in-amount').value);
  if (!firma || kwh <= 0 || (!free && (isNaN(amount) || amount < 0))) {
    $('form-err').textContent = t('formError');
    $('form-err').classList.add('show');
    return;
  }
  const code = $('in-country').value;
  const c = COUNTRIES.find(x => x[0] === code);
  const foreign = c[3] !== S.currency;
  const rate = pf($('in-rate').value);
  if (foreign && (isNaN(rate) || rate <= 0)) {
    $('form-err').textContent = t('rateNeeded');
    $('form-err').classList.add('show');
    return;
  }
  const distIn = pf($('in-dist').value) || 0;
  const discVal = free ? 0 : (pf($('in-disc-val').value) || 0);
  const discType = $('in-disc-type').querySelector('.sel').dataset.v;
  const gross = free ? 0 : Math.round(amount * 100) / 100;
  const net = free ? 0 : Math.round(netFromGross(gross, discType, discVal) * 100) / 100;
  let a = parseInt($('in-socb').value), b = parseInt($('in-soca').value);
  if (!isNaN(a) && !isNaN(b) && a > b) [a, b] = [b, a];
  const durH = parseInt($('in-dur-h').value) || 0;
  const durM = parseInt($('in-dur-m').value) || 0;
  const rec = {
    tarih: $('in-date').value + 'T12:00',
    tip: $('in-tip').querySelector('.sel').dataset.v,
    firma, kwh: Math.round(kwh * 100) / 100,
    tutar: gross,
    odenen: net,
    indirim: Math.round((gross - net) * 100) / 100,
    free,
    indirimTip: discVal > 0 ? discType : 'none',
    indirimDeger: discVal,
    banka: discVal > 0 || $('in-bank').value ? $('in-bank').value : '',
    mesafeKm: distIn ? Math.round((S.unit === 'mi' ? distIn * MI : distIn) * 10) / 10 : null,
    dur: (durH * 60 + durM) || null,
    loc: $('in-loc').value.trim(),
    socB: isNaN(a) ? null : a, socA: isNaN(b) ? null : b,
    ulke: code, cur: c[3],
    rate: foreign ? rate : null,
    rateBase: foreign ? S.currency : null,
    aracId: parseInt($('in-vehicle').value) || null,
    not: $('in-note').value.trim()
  };
  let recId;
  if (editingId) {
    const oldRec = await db.sessions.get(editingId);
    await db.sessions.update(editingId, rec);
    recId = editingId;
    await bumpVehicleKm(rec.aracId, (rec.mesafeKm || 0) - (oldRec?.mesafeKm || 0));
    toast(t('updated'));
  } else {
    recId = await db.sessions.add(rec);
    await bumpVehicleKm(rec.aracId, rec.mesafeKm || 0);
    toast(t('saved'));
  }
  $('page-add').classList.remove('active');
  showScreen(screen);
  // kur tablosunu sessizce ekle (çift yönlü dönüşüm için — yerli kayıt dahil)
  fetchTable(c[3], rec.tarih.slice(0, 10)).then(got => {
    if (got) db.sessions.update(recId, {fxTable: got.rates, fxDate: got.date})
      .then(() => { if (screen === 'dashboard') renderDashboard(); });
  });
});

// ============================================================
// ARAÇ GİDERLERİ (vergi / sigorta / bakım …)
// ============================================================
let editingExpId = null;
async function openExpense(rec) {
  editingExpId = rec?.id || null;
  $('exp-title').textContent = rec ? t('editExpense') : t('addExpense');
  $('btn-del-exp').style.display = rec ? '' : 'none';
  $('in-exp-type').innerHTML = EXP_TYPES.map(k =>
    `<option value="${k}">${EXP_ICON[k]} ${t('exp_' + k)}</option>`).join('');
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('in-exp-cur').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  const vs = (await db.vehicles.toArray()).filter(v => !v.archived || v.id === rec?.aracId);
  $('wrap-exp-veh').style.display = vs.length > 1 ? '' : 'none';
  $('in-exp-veh').innerHTML = `<option value="">${t('allVehicles')}</option>` +
    vs.map(v => `<option value="${v.id}">${esc(vehName(v))}</option>`).join('');
  $('in-exp-type').value = rec?.tur || 'tax';
  $('in-exp-altad').placeholder = t('otherTypePh');
  $('in-exp-altad').value = rec?.altAd || '';
  $('in-exp-altad').style.display = $('in-exp-type').value === 'other' ? '' : 'none';
  $('in-exp-date').value = (rec?.tarih || new Date().toISOString()).slice(0, 10);
  $('in-exp-cur').value = rec?.cur || S.currency;
  $('in-exp-amount').value = rec ? String(rec.tutar).replace('.', ',') : '';
  $('in-exp-veh').value = rec?.aracId || '';
  $('in-exp-note').value = rec?.not || '';
  $('in-exp-amt-lbl').textContent = t('expAmount') + ' (' + symOf($('in-exp-cur').value) + ')';
  $('page-expense').classList.add('active');
}
$('btn-add-exp').addEventListener('click', () => openExpense(null));
$('in-exp-type').addEventListener('change', () => {
  $('in-exp-altad').style.display = $('in-exp-type').value === 'other' ? '' : 'none';
});
$('in-exp-cur').addEventListener('change', () => {
  $('in-exp-amt-lbl').textContent = t('expAmount') + ' (' + symOf($('in-exp-cur').value) + ')';
});
$('btn-close-exp').addEventListener('click', () => $('page-expense').classList.remove('active'));
$('btn-del-exp').addEventListener('click', async () => {
  if (!editingExpId || !confirm(t('deleteAsk'))) return;
  await db.expenses.delete(editingExpId);
  $('page-expense').classList.remove('active');
  editingExpId = null;
  toast(t('deleted'));
  renderVehiclePage();
  renderCompare();
});
$('btn-save-exp').addEventListener('click', async () => {
  const tutar = pf($('in-exp-amount').value);
  if (isNaN(tutar) || tutar <= 0) { toast(t('amountNeeded')); return; }
  const cur = $('in-exp-cur').value;
  const tur = $('in-exp-type').value;
  const rec = {
    tarih: $('in-exp-date').value || new Date().toISOString().slice(0, 10),
    tur,
    altAd: tur === 'other' ? $('in-exp-altad').value.trim() : '',
    tutar, cur,
    aracId: $('in-exp-veh').value ? +$('in-exp-veh').value : null,
    not: $('in-exp-note').value.trim()
  };
  const wasEditing = editingExpId;
  const id = wasEditing
    ? (await db.expenses.update(wasEditing, rec), wasEditing)
    : await db.expenses.add(rec);
  $('page-expense').classList.remove('active');
  toast(wasEditing ? t('updated') : t('saved'));
  editingExpId = null;
  renderVehiclePage();
  renderCompare();
  fetchTable(cur, rec.tarih).then(got => {
    if (got) db.expenses.update(id, {fxTable: got.rates, fxDate: got.date})
      .then(() => { renderVehiclePage(); renderCompare(); });
  });
});

// ============================================================
// ONBOARDING (kompakt: açılır listeler)
// ============================================================
let obEv = null;
function initOnboarding() {
  $('ob-country').innerHTML = COUNTRIES.map(c =>
    `<option value="${c[0]}">${c[1]} ${c[2]}</option>`).join('');
  $('ob-country').value = 'TR';
  const curs = [...new Set(COUNTRIES.map(x => x[3]))].sort();
  $('ob-currency').innerHTML = curs.map(k =>
    `<option value="${k}">${k} (${symOf(k)})</option>`).join('');
  $('ob-currency').value = 'TRY';
  $('ob-lang').innerHTML = Object.keys(LANG_NAMES).map(k =>
    `<option value="${k}">${LANG_NAMES[k]}</option>`).join('');
  $('ob-lang').value = S.lang;

  $('ob-country').addEventListener('change', () => {
    const c = COUNTRIES.find(x => x[0] === $('ob-country').value);
    $('ob-currency').value = c[3];
    $('ob-unit').querySelectorAll('button').forEach(b =>
      b.classList.toggle('sel', b.dataset.v === c[5]));
    if (LANG_NAMES[c[6]]) {
      $('ob-lang').value = c[6];
      S.lang = c[6];
      applyI18n();
    }
  });
  $('ob-lang').addEventListener('change', () => {
    S.lang = $('ob-lang').value;
    applyI18n();
  });
  $('ob-unit').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('ob-unit').querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
  });
  $('ob-next').addEventListener('click', () => {
    $('ob-step1').style.display = 'none';
    $('ob-step2').style.display = '';
    $('obp2').classList.add('on');
  });
  $('ob-back').addEventListener('click', () => {
    $('ob-step2').style.display = 'none';
    $('ob-step1').style.display = '';
    $('obp2').classList.remove('on');
  });
  bindEVSearch('ob-ev-search', 'ob-ev-results', 'ob-ev-summary', v => {
    obEv = v;
    $('ob-done').disabled = !v;
    $('ob-km-wrap').style.display = v ? '' : 'none';
    // Araç seçilince arama kutusu ve sonuç listesi kapanır — km alanı öne çıkar
    $('ob-ev-search').style.display = v ? 'none' : '';
    $('ob-ev-results').style.display = v ? 'none' : '';
    $('ob-change-car').style.display = v ? '' : 'none';
  }, false);
  $('ob-change-car').addEventListener('click', () => {
    obEv = null;
    $('ob-done').disabled = true;
    $('ob-km-wrap').style.display = 'none';
    $('ob-ev-summary').style.display = 'none';
    $('ob-change-car').style.display = 'none';
    $('ob-ev-search').style.display = '';
    $('ob-ev-results').style.display = '';
    $('ob-ev-results').innerHTML = '';
    $('ob-ev-search').value = '';
    $('ob-km').value = '';
    $('ob-ev-search').focus();
  });
  $('ob-skip').addEventListener('click', () => finishOnboarding(false));
  $('ob-done').addEventListener('click', () => finishOnboarding(true));
}
async function finishOnboarding(withCar) {
  S.country = $('ob-country').value;
  S.currency = $('ob-currency').value;
  S.unit = $('ob-unit').querySelector('.sel').dataset.v;
  S.lang = $('ob-lang').value;
  S.onboarded = true;
  for (const [k, v] of [['country', S.country], ['currency', S.currency],
    ['unit', S.unit], ['lang', S.lang], ['onboarded', true]])
    await saveSetting(k, v);
  if (!S.bankCountries) { S.bankCountries = [S.country]; await saveSetting('bankCountries', S.bankCountries); }
  if (withCar && obEv) {
    const rec = vehicleRec(obEv);
    const kmIn = pf($('ob-km').value);
    if (!isNaN(kmIn) && kmIn > 0) {
      const km = S.unit === 'mi' ? kmIn * MI : kmIn;
      rec.kmStart = Math.round(km); rec.kmNow = Math.round(km);
    }
    const id = await db.vehicles.add(rec);
    S.defaultVehicleId = id;
    await saveSetting('defaultVehicleId', id);
  }
  $('ob').classList.remove('active');
  applyI18n();
  renderDashboard();
}

// ============================================================
// YEDEKLEME
// ============================================================
function today() { return new Date().toISOString().slice(0, 10); }
function download(content, name, type) {
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$('btn-export-json').addEventListener('click', async () => {
  const payload = {
    app: 'WattTrack', version: 8, exportedAt: new Date().toISOString(),
    sessions: await db.sessions.toArray(),
    vehicles: await db.vehicles.toArray(),
    expenses: await db.expenses.toArray(),
    settings: await db.settings.toArray()
  };
  download(JSON.stringify(payload, null, 2), `watttrack-yedek-${today()}.json`, 'application/json');
  toast(t('jsonDone'));
});
$('btn-export-csv').addEventListener('click', async () => {
  const rows = (await db.sessions.toArray()).sort((a, b) => a.tarih.localeCompare(b.tarih));
  const vehicles = await db.vehicles.toArray();
  const vn = id => { const v = vehicles.find(x => x.id === id); return v ? vehName(v) : ''; };
  const num = n => n == null ? '' : String(Math.round(n * 100) / 100).replace('.', ',');
  // CSV formül enjeksiyonuna karşı koruma: =,+,-,@ ile başlayan metinleri etkisizleştir
  const safe = s => {
    let v = (s || '').toString().replace(/;/g, ',').replace(/[\r\n]/g, ' ');
    if (/^[=+\-@]/.test(v)) v = "'" + v;
    return v;
  };
  const head = ['Tarih','Ulke','ParaBirimi','Kur','Firma','Tip','Ucretsiz','kWh','Odenen','OdenenTemel','Indirim','ListeTutar','BirimFiyat','Banka','MesafeKm','SureDk','SoCOnce','SoCSonra','Lokasyon','Arac','Not'];
  const lines = [head.join(';')];
  rows.forEach(r => {
    const sav = savingsOf(r);
    lines.push([
      r.tarih.slice(0, 10), r.ulke || '', r.cur || '', r.rate ? num(r.rate) : '',
      safe(r.firma), r.tip || '', r.free ? 1 : 0, num(r.kwh),
      num(r.odenen), num(amtB(r)), num(sav), num(r.odenen + sav),
      r.kwh ? num(r.odenen / r.kwh) : '', safe(r.banka),
      r.mesafeKm ? num(r.mesafeKm) : '', r.dur ?? '', r.socB ?? '', r.socA ?? '',
      safe(r.loc), safe(vn(r.aracId)), safe(r.not)
    ].join(';'));
  });
  download('\uFEFF' + lines.join('\r\n'), `watttrack-${today()}.csv`, 'text/csv;charset=utf-8');
  toast(t('csvDone'));
});
$('btn-import').addEventListener('click', () => $('file-import').click());
async function importBackupText(text) {
  {
    const data = JSON.parse(text);
    if (data.app !== 'WattTrack' || !Array.isArray(data.sessions)) throw 0;
    // mükerrer tespiti: tarih+firma+kwh+tutar+para birimi imzası
    const sig = r => [r.tarih, r.firma, r.kwh, r.odenen, r.cur || ''].join('|');
    const existing = new Set((await db.sessions.toArray()).map(sig));
    const fresh = [], dupes = [];
    data.sessions.forEach(({id, ...r}) => (existing.has(sig(r)) ? dupes : fresh).push(r));
    if (!fresh.length && data.sessions.length) {
      alert(t('importAllDup'));
      return;
    }
    const msg = dupes.length
      ? t('importPartial', {n: fresh.length, d: dupes.length})
      : fresh.length + ' ' + t('importAsk');
    if (!confirm(msg)) return;
    if (fresh.length) await db.sessions.bulkAdd(fresh);
    if (Array.isArray(data.expenses) && data.expenses.length) {
      const esig = e => [e.tarih, e.tur, e.tutar, e.cur || ''].join('|');
      const have = new Set((await db.expenses.toArray()).map(esig));
      const newEx = data.expenses.map(({id, ...e}) => e).filter(e => !have.has(esig(e)));
      if (newEx.length) await db.expenses.bulkAdd(newEx);
    }
    for (const {id, ...v} of (data.vehicles || [])) {
      if (!v.ad) continue;
      const ex = await db.vehicles.where('ad').equals(v.ad).first();
      if (!ex) { await db.vehicles.add(v); continue; }
      // aynı isimli araç varsa: yedekteki km/fotoğraf bilgisini birleştir
      const upd = {};
      if (v.kmStart != null) upd.kmStart = v.kmStart;
      if (v.kmNow != null && (ex.kmNow == null || v.kmNow > ex.kmNow || ex.kmStart === ex.kmNow))
        upd.kmNow = Math.max(v.kmNow, ex.kmNow || 0);
      if (v.photo && !ex.photo) upd.photo = v.photo;
      if (Object.keys(upd).length) await db.vehicles.update(ex.id, upd);
    }
    toast(dupes.length ? t('importPartial', {n: fresh.length, d: dupes.length}) : t('imported'));
    showScreen('dashboard');
  }
}
$('file-import').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try { await importBackupText(await file.text()); }
  catch { toast(t('importFail')); }
  e.target.value = '';
});
// PWA file_handlers: .json dosyası uygulamayla açılınca yedeği içe aktar
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async params => {
    if (!params.files || !params.files.length) return;
    try {
      const file = await params.files[0].getFile();
      await importBackupText(await file.text());
    } catch { toast(t('importFail')); }
  });
}
$('btn-rate').addEventListener('click', () => {
  window.open('https://play.google.com/store/apps/details?id=app.watttrack.twa', '_blank', 'noopener');
});
$('btn-support').addEventListener('click', () => {
  window.open('https://github.com/Rino-06/WattTrack', '_blank', 'noopener');
});
$('btn-wipe').addEventListener('click', async () => {
  if (!confirm(t('wipeAsk1')) || !confirm(t('wipeAsk2'))) return;
  await db.sessions.clear(); await db.vehicles.clear(); await db.settings.clear();
  toast(t('wiped'));
  location.reload();
});

// ============================================================
// BAŞLANGIÇ
// ============================================================
(async function init() {
  for (const key of ['country','currency','unit','lang','advOpen','defaultVehicleId','onboarded','cmp','bankCountries','customBanks','gran','theme']) {
    const row = await db.settings.get(key);
    if (row) S[key] = row.value;
  }
  initOnboarding();
  applyI18n();
  applyTheme();
  if (!S.onboarded) $('ob').classList.add('active');
  renderDashboard();
  // PWA kısayolları (?action=add | ?page=history/compare/settings)
  const q = new URLSearchParams(location.search);
  if (S.onboarded && (q.get('share_text') || q.get('share_title'))) {
    await openAdd();
    $('in-note').value = [q.get('share_title'), q.get('share_text'), q.get('share_url')]
      .filter(Boolean).join(' ').slice(0, 200);
    $('adv-fields').classList.add('open');
  }
  else if (S.onboarded && q.get('action') === 'add') openAdd();
  else if (S.onboarded && ['stats','history','compare','vehicle','settings'].includes(q.get('page')))
    showScreen(q.get('page'));
  backfillRates().then(() => { if (screen === 'dashboard') renderDashboard(); });
  hideSplash();
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
  // güncelleme geldiğinde (yeni SW devraldığında) sayfayı bir kez tazele
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (swReloaded) return;
    swReloaded = true;
    location.reload();
  });
}
</file>

</files>
