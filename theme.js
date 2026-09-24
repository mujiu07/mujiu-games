/* ==========================================================================
   mujiu 全站主题切换 —— game / ask 共用（ask 通过 nginx alias 复用本文件）
   ---------------------------------------------------------------------------
   · 主题名与主站（terminal-portfolio）和 gui 主页完全一致：
       dark / light / blue-matrix / espresso / green-goblin / ubuntu
   · 选择结果写进 cookie `mujiu_theme`（domain=.mujiu.net，1 年），
     主站、gui、game、ask 共用同一个 cookie，所以在任意一站换主题，其余站自动跟随。
     localStorage 只作 cookie 不可用时的回退（它按域名隔离，跨子域不生效）。
   · 本文件必须在 <head> 里同步加载（不加 defer），先把 data-theme 写到 <html>
     上，避免刷新时先闪一下深色再跳到所选主题。
   ========================================================================== */
(function () {
  var COOKIE = 'mujiu_theme';
  var MAX_AGE = 31536000;
  var THEMES = ['dark', 'light', 'blue-matrix', 'espresso', 'green-goblin', 'ubuntu'];
  var LABELS = {
    'dark': '深色',
    'light': '浅色',
    'blue-matrix': '蓝矩阵',
    'espresso': '浓咖',
    'green-goblin': '绿魔',
    'ubuntu': 'Ubuntu'
  };
  // 色点用的 [主色, 辅色]
  var SWATCH = {
    'dark': ['#05CE91', '#FF9D00'],
    'light': ['#027474', '#FF9D00'],
    'blue-matrix': ['#00ff9c', '#60fdff'],
    'espresso': ['#E1E48B', '#A5C260'],
    'green-goblin': ['#E5E500', '#04A500'],
    'ubuntu': ['#80D932', '#80D932']
  };

  function isTheme(name) {
    return THEMES.indexOf(name) >= 0;
  }

  function readCookie() {
    var m = document.cookie.match(/(?:^|;\s*)mujiu_theme=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function readSaved() {
    var c = readCookie();
    if (isTheme(c)) return c;
    try {
      var ls = localStorage.getItem(COOKIE);
      if (isTheme(ls)) return ls;
    } catch (e) {
      /* 隐私模式下 localStorage 会抛错，忽略 */
    }
    return '';
  }

  function write(name) {
    var base = COOKIE + '=' + encodeURIComponent(name) + '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
    // 写两遍：带 domain 让所有子域可见，再写一份不带 domain 的主机 cookie 兜底
    document.cookie = base + '; domain=.mujiu.net';
    document.cookie = base;
    try {
      localStorage.setItem(COOKIE, name);
    } catch (e) {
      /* 同上 */
    }
  }

  var current = 'dark';

  function paint() {
    var dots = document.querySelectorAll('.mj-theme button');
    for (var i = 0; i < dots.length; i++) {
      var on = dots[i].getAttribute('data-t') === current;
      dots[i].className = on ? 'active' : '';
      dots[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function apply(name, persist) {
    if (!isTheme(name)) return;
    current = name;
    if (name === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
    if (persist) write(name);
    paint();
  }

  // 尽早应用：此时 <html> 已存在，<body> 还没解析，避免主题闪烁
  var saved = readSaved();
  if (saved && saved !== 'dark') apply(saved, false);

  function buildPicker() {
    var bar = document.querySelector('.mj-bar') ||
      document.querySelector('.mj-top .sp') ||
      document.querySelector('.mj-top');
    if (!bar || bar.querySelector('.mj-theme')) return;

    var box = document.createElement('div');
    box.className = 'mj-theme';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', '主题（与 mujiu.net 全站同步）');

    for (var i = 0; i < THEMES.length; i++) {
      (function (name) {
        var pair = SWATCH[name];
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-t', name);
        b.title = '切换主题：' + (LABELS[name] || name);
        b.setAttribute('aria-label', '切换到主题 ' + (LABELS[name] || name));
        b.style.background = 'linear-gradient(135deg, ' + pair[0] + ' 0 50%, ' + pair[1] + ' 50% 100%)';
        b.addEventListener('click', function () {
          apply(name, true);
        });
        box.appendChild(b);
      })(THEMES[i]);
    }

    bar.appendChild(box);
    paint();
  }

  // 从别的 mujiu 站点切主题后回来，跟随最新选择
  function sync() {
    var c = readCookie();
    if (isTheme(c) && c !== current) apply(c, false);
  }

  function init() {
    buildPicker();
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) sync();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
