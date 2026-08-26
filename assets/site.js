/* People Processes engineering docs — shared behaviour.
   Every widget is guarded, so any page can load this file and only
   the parts it actually contains will initialise. */
(function () {
"use strict";

var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────── confetti (used by several widgets) ─────────── */
var COLORS = ['#84C444', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B'];
function celebrate() {
  var host = $('#confetti');
  if (!host || reduced) return;
  host.classList.add('on');
  host.innerHTML = '';
  for (var i = 0; i < 70; i++) {
    var c = document.createElement('div');
    c.className = 'conf';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = '-20px';
    c.style.background = COLORS[i % COLORS.length];
    c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    c.style.animationDelay = (Math.random() * 0.4) + 's';
    host.appendChild(c);
  }
  setTimeout(function () { host.classList.remove('on'); host.innerHTML = ''; }, 3400);
}

/* ─────────── reading progress + back to top ─────────── */
(function () {
  var bar = $('#bar'), toTop = $('#toTop');
  if (!bar && !toTop) return;
  function prog() {
    var h = document.documentElement;
    var d = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (d > 0 ? Math.min(100, h.scrollTop / d * 100) : 0) + '%';
    if (toTop) toTop.classList.toggle('on', h.scrollTop > 600);
  }
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  window.addEventListener('scroll', prog, { passive: true });
  prog();
})();

/* ─────────── copy buttons ─────────── */
$$('.copy').forEach(function (b) {
  b.addEventListener('click', function () {
    var el = document.getElementById(b.dataset.target);
    if (!el) return;
    var txt = el.innerText;
    function done() {
      b.textContent = 'Copied'; b.classList.add('done');
      setTimeout(function () { b.textContent = 'Copy'; b.classList.remove('done'); }, 1400);
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else { fallback(); }
  });
});

/* ─────────── sidebar: filter, scrollspy, visited progress ─────────── */
(function () {
  var links = $$('.navlink');
  if (!links.length) return;
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var visited = {};
  var TR = $('#tour-ring'), TN = $('#tour-num'), TL = $('#tour-lbl'), TC = 119.4;

  function updTour() {
    if (!TR) return;
    var n = Object.keys(visited).length, t = links.length;
    TR.setAttribute('stroke-dashoffset', TC - TC * n / t);
    if (TN) TN.textContent = Math.round(n / t * 100) + '%';
    if (TL) TL.textContent = n + ' of ' + t + ' sections';
    if (n === t) celebrate();
  }
  function spy() {
    var best = 0;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] && targets[i].getBoundingClientRect().top <= 140) best = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('active', i === best); });
    var id = links[best].getAttribute('href').slice(1);
    if (!visited[id]) { visited[id] = 1; links[best].classList.add('seen'); updTour(); }
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  var ns = $('#navsearch');
  if (ns) {
    ns.addEventListener('input', function (e) {
      var q = e.target.value.toLowerCase();
      links.forEach(function (a) {
        a.style.display = a.textContent.toLowerCase().indexOf(q) > -1 ? '' : 'none';
      });
    });
    document.addEventListener('keydown', function (e) {
      var t = document.activeElement.tagName;
      if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA' && t !== 'SELECT') {
        e.preventDefault(); ns.focus();
      }
    });
  }

  var side = $('#side'), mb = $('#menubtn');
  if (side && mb) {
    mb.addEventListener('click', function () { side.classList.toggle('open'); });
    links.forEach(function (a) {
      a.addEventListener('click', function () { side.classList.remove('open'); });
    });
  }
})();

/* ─────────── flip cards ─────────── */
$$('.flip').forEach(function (f) {
  function t() { f.classList.toggle('on'); }
  f.addEventListener('click', t);
  f.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); }
  });
});

/* ─────────── item type decider ─────────── */
(function () {
  var s1 = $('#step1'), s2 = $('#step2'), dres = $('#dres'), dreset = $('#dreset');
  if (!s1 || !s2 || !dres) return;
  var R = {
    bug:   ['Bug', 'Shipped behavior is wrong. Use the bug template. Steps to reproduce is the whole report, so write them even when the fix seems obvious. Set a severity. If a client reported it, tag it client-reported and set priority High.'],
    story: ['Story', 'A user-visible outcome. Use the story template. Write three to seven acceptance criteria a person can click through and mark pass or fail.'],
    task:  ['Task', 'Groundwork with no standalone user value. Use the task template and name the story waiting on it. A task that enables nothing is a task nobody needs.']
  };
  $$('#step1 .btn, #step2 .btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var a = b.dataset.a;
      if (a === 'step2') { s1.style.display = 'none'; s2.style.display = ''; return; }
      s1.style.display = 'none'; s2.style.display = 'none';
      dres.innerHTML = '<div class="big">' + R[a][0] + '</div><p style="margin:0">' + R[a][1] + '</p>';
      dres.classList.add('on');
      if (dreset) dreset.style.display = '';
    });
  });
  if (dreset) dreset.addEventListener('click', function () {
    s1.style.display = ''; s2.style.display = 'none';
    dres.classList.remove('on'); dreset.style.display = 'none';
  });
})();

/* ─────────── checklists with progress rings ─────────── */
$$('ul.checklist[data-ring]').forEach(function (list) {
  var key = list.dataset.ring;
  var ring = document.getElementById(key + '-ring');
  var num = document.getElementById(key + '-num');
  var gate = document.getElementById(key + '-gate');
  var block = document.getElementById(key + '-block');
  var boxes = $$('input', list);
  if (!boxes.length) return;
  var C = 163.4;
  var pass = list.dataset.pass || 'Complete.';
  var fail = list.dataset.fail || 'Not complete yet.';
  var wasDone = false;
  function upd() {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    if (ring) ring.setAttribute('stroke-dashoffset', C - C * n / boxes.length);
    if (num) num.textContent = Math.round(n / boxes.length * 100) + '%';
    var ok = n === boxes.length;
    if (gate) {
      gate.textContent = ok ? pass : fail + '   (' + n + ' of ' + boxes.length + ')';
      gate.classList.toggle('pass', ok);
    }
    if (block) block.classList.toggle('complete', ok);
    if (ok && !wasDone) celebrate();
    wasDone = ok;
  }
  boxes.forEach(function (b) { b.addEventListener('change', upd); });
  upd();
});

/* ─────────── title fixer ─────────── */
(function () {
  var prompt = $('#tf-prompt'), opts = $('#tf-opts'), fb = $('#tf-fb'),
      next = $('#tf-next'), scoreEl = $('#tf-score'), totalEl = $('#tf-total');
  if (!prompt || !opts) return;

  var TF = [
    { bad: 'fixed the spinner thing on review',
      opts: [
        { t: 'Fix endless loading spinner when sending a policy for BP review', ok: true },
        { t: 'fixed: spinner on review page', ok: false, why: 'Past tense, and "spinner on review page" is not searchable.' },
        { t: 'Spinner issue', ok: false, why: 'No verb, no object, no qualifier. Nobody could act on this.' }
      ],
      good: 'Present tense verb, a specific object, and a qualifier naming the exact flow.' },
    { bad: 'add the tab and then build the page and wire it up',
      opts: [
        { t: 'Add conditional posters tab to the client Posters screen', ok: true },
        { t: 'Add tab; build page; wire API', ok: false, why: 'Three outcomes in one title. Half of it can pass, so it can never be marked done. Split it.' },
        { t: 'Posters tab work', ok: false, why: 'No verb and no finish line.' }
      ],
      good: 'One outcome per item. The other two pieces become their own items.' },
    { bad: 'improved mobile view (done)',
      opts: [
        { t: 'Make the BP dashboard usable at 375px width', ok: true },
        { t: 'Improved mobile view (done)', ok: false, why: 'Past tense plus a status marker in the title. Status lives in the column.' },
        { t: 'Mobile responsiveness', ok: false, why: 'A topic, not a request. No acceptance criterion can be written from it.' }
      ],
      good: 'Specific, present tense, and testable. 375px is something you can check.' },
    { bad: 'update dashboard booking to use it',
      opts: [
        { t: 'Update dashboard booking to use the shared availability service', ok: true },
        { t: 'update dashboard booking to use it', ok: false, why: 'Use what? In six months nobody will know what "it" referred to.' },
        { t: 'Dashboard booking fix', ok: false, why: 'Vague, and it implies a bug without saying what is broken.' }
      ],
      good: 'Never leave a pronoun in a title. Name the thing.' }
  ];
  var i = 0, score = 0;
  if (totalEl) totalEl.textContent = TF.length;

  function render() {
    var q = TF[i];
    prompt.innerHTML = 'Someone filed: <b>"' + q.bad + '"</b>';
    opts.innerHTML = '';
    if (fb) { fb.className = 'fb'; fb.innerHTML = ''; }
    if (next) next.style.display = 'none';
    q.opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = o.t;
      b.addEventListener('click', function () {
        $$('.opt', opts).forEach(function (x) { x.disabled = true; });
        if (o.ok) {
          b.classList.add('right'); score++;
          if (scoreEl) scoreEl.textContent = score;
          if (fb) { fb.className = 'fb good on'; fb.innerHTML = '<b>Correct.</b> ' + q.good; }
        } else {
          b.classList.add('wrong');
          $$('.opt', opts).forEach(function (x, ix) { if (q.opts[ix].ok) x.classList.add('right'); });
          if (fb) { fb.className = 'fb bad on'; fb.innerHTML = '<b>Not this one.</b> ' + o.why; }
        }
        if (i < TF.length - 1) { if (next) next.style.display = ''; }
        else if (fb) {
          fb.innerHTML += '<br><br><b>That is all four.</b> Final score ' + score + ' of ' + TF.length + '.';
          if (score === TF.length) celebrate();
        }
      });
      opts.appendChild(b);
    });
  }
  if (next) next.addEventListener('click', function () { i++; render(); });
  render();
})();

/* ─────────── item builder ─────────── */
(function () {
  var bType = $('#b-type'), bTitle = $('#b-title'), bGoal = $('#b-goal'), bWhy = $('#b-why'),
      bAc = $('#b-ac'), bOut = $('#b-out'), bBreak = $('#b-break'),
      bCode = $('#b-out-code'), bWarn = $('#b-warn'),
      bGoalLab = $('#b-goal-lab'), bWhyLab = $('#b-why-lab');
  if (!bType || !bCode) return;

  var PAST = /^(added|fixed|updated|improved|removed|created|changed|built|implemented|made)\b/i;
  var EMOJI = /[←-➿☀-⛿]|[\uD800-\uDBFF][\uDC00-\uDFFF]/;

  function build() {
    var t = bType.value;
    if (bGoalLab) bGoalLab.textContent =
      t === 'bug'  ? 'Summary — what is wrong, one sentence' :
      t === 'task' ? 'Goal — what this enables, and the story waiting on it' :
                     'Goal — one sentence';
    if (bWhyLab) bWhyLab.textContent =
      t === 'bug' ? 'Environment and who is affected' : 'Why it matters';

    var raw = bTitle ? bTitle.value : '';
    var title = raw.trim();
    var warns = [];
    if (title) {
      if (PAST.test(title)) warns.push('Title is past tense. The board holds requests, not a changelog.');
      if (title.indexOf(';') > -1 || / and /i.test(title)) warns.push('Title covers more than one outcome. Split it into separate items.');
      if (title.length > 90) warns.push('Title is ' + title.length + ' characters. Keep it under 90.');
      if (EMOJI.test(title)) warns.push('Remove the emoji or arrow. Status lives in the column, not the title.');
      if (title !== raw) warns.push('Title has leading or trailing whitespace.');
    }
    var ac = (bAc ? bAc.value : '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    if (ac.length && ac.length < 3) warns.push('Only ' + ac.length + ' acceptance criterion. Aim for three to seven.');
    if (ac.length > 7) warns.push(ac.length + ' acceptance criteria. That is usually two items.');
    ac.forEach(function (l) {
      if (/\b(well|better|nicely|properly|gracefully|improved|fast)\b/i.test(l)) {
        warns.push('"' + l.slice(0, 42) + '..." is not testable. Say what a person checks.');
      }
    });
    if (bWarn) {
      bWarn.className = warns.length ? 'fb bad on' : 'fb';
      bWarn.innerHTML = warns.length ? '<b>Check these:</b><br>' + warns.join('<br>') : '';
    }

    var goal = bGoal ? bGoal.value : '';
    if (!title && !goal && !ac.length) {
      bCode.textContent = 'Start typing above and your item appears here.';
      return;
    }
    var L = [];
    L.push('TITLE: ' + (title || '[title]'));
    L.push('TYPE:  ' + t.charAt(0).toUpperCase() + t.slice(1));
    L.push('');
    if (t === 'bug') {
      L.push('## Summary'); L.push(goal); L.push('');
      L.push('## Environment'); L.push(bWhy ? bWhy.value : ''); L.push('');
      L.push('## Steps to reproduce'); L.push('1.'); L.push('2.'); L.push('3.'); L.push('');
      L.push('## Expected result'); L.push('');
      L.push('## Actual result'); L.push('');
    } else {
      L.push('## Goal'); L.push(goal); L.push('');
      L.push(t === 'task' ? '## What to do' : '## Why it matters');
      L.push(bWhy ? bWhy.value : ''); L.push('');
      if (t === 'story') {
        L.push('## Current behavior'); L.push('1.'); L.push('');
        L.push('## Desired behavior'); L.push('1.'); L.push('');
      }
    }
    L.push('## Acceptance criteria');
    if (ac.length) { ac.forEach(function (l) { L.push('- [ ] ' + l); }); }
    else { L.push('- [ ] '); }
    L.push('');
    if (bOut && bOut.value) { L.push('## Out of scope'); L.push('- ' + bOut.value); L.push(''); }
    if (bBreak && bBreak.value) { L.push('## Do not break'); L.push('- ' + bBreak.value); L.push(''); }
    L.push('## Source references'); L.push('- ');
    bCode.textContent = L.join('\n');
  }

  [bType, bTitle, bGoal, bWhy, bAc, bOut, bBreak].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', build);
    el.addEventListener('change', build);
  });
  build();
})();

/* ─────────── glossary filter ─────────── */
(function () {
  var input = $('#gsearch'), list = $('#glist');
  if (!input || !list) return;
  var items = $$('#glist > div'), none = $('#gnone');
  input.addEventListener('input', function (e) {
    var q = e.target.value.toLowerCase(), shown = 0;
    items.forEach(function (d) {
      var hit = d.textContent.toLowerCase().indexOf(q) > -1;
      d.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    if (none) none.style.display = shown ? 'none' : '';
  });
})();

/* ─────────── quiz ─────────── */
(function () {
  var qC = $('#q-counter'), qT = $('#q-text'), qO = $('#q-opts'), qF = $('#q-fb'),
      qN = $('#q-next'), qR = $('#q-restart'), qRes = $('#q-result');
  if (!qT || !qO) return;

  var QZ = [
    { q: 'A client reports that clicking Send for Review spins forever in production. What do you file?',
      o: ['A Bug, priority High, tagged client-reported', 'A Story, because the feature needs work', 'A Task, because it is a code fix', 'A PRD, because it affects a client'],
      a: 0, w: 'Shipped behavior is wrong and a user can reach it, so it is a Bug. A client blocked in production takes the express lane.' },
    { q: 'What is the difference between an epic and a release?',
      o: ['An epic groups by what the work is; a release groups by when it ships', 'An epic is bigger than a release', 'A release is a group of epics', 'They are the same thing named differently'],
      a: 0, w: 'An epic can span several releases, and a release can pull items from several epics.' },
    { q: 'Which of these is a testable acceptance criterion?',
      o: ['Clearing the search box restores the full list', 'Search works well', 'The list loads faster', 'Errors are handled gracefully'],
      a: 0, w: 'A person can click it and mark pass or fail without interpretation. The other three all require an opinion.' },
    { q: 'An item is estimated at 13 points. What happens?',
      o: ['Split it before it is started', 'Schedule it across two weeks', 'Assign it to two people', 'Move it to the top of the backlog'],
      a: 0, w: 'Too big to size is too big to specify, and too big to specify is impossible to verify.' },
    { q: 'You only have a screenshot of the defect. What do you put in the description?',
      o: ['Steps and expected result in words, with the screenshot attached and captioned', 'The screenshot on its own, since it shows everything', 'A link to the chat where it was reported', 'Nothing, and explain it verbally'],
      a: 0, w: 'An image supplements words, never replaces them. A screenshot-only description is unsearchable and does not survive an export.' },
    { q: 'An AI tool reports it finished the build and all tests pass. Can the item move to Done?',
      o: ['No. A person opens the running app and walks every criterion first', 'Yes, if the tests it wrote pass', 'Yes, if the code was merged', 'Only if the item is small'],
      a: 0, w: 'A report is a claim, not a verification. The verification gate does not scale down for small items.' },
    { q: 'Scope changes halfway through the build. What do you do first?',
      o: ['Edit the description, then post a DECISION: comment', 'Post a comment and leave the description as it was', 'Close the item and file a new one', 'Finish the original scope, then decide'],
      a: 0, w: 'The description always holds the current truth. A description of an abandoned plan is worse than none, because it is confidently wrong.' },
    { q: 'Which title follows the convention?',
      o: ['Add search bar to handbook list filtered by handbook name', 'improved handbook search (done)', 'Handbook search', 'Add search; fix sorting; update the header'],
      a: 0, w: 'Verb, object, qualifier. Present tense, one outcome, no status marker, specific enough to find by search later.' }
  ];
  var i = 0, score = 0;

  function render() {
    var item = QZ[i];
    if (qC) qC.textContent = 'Question ' + (i + 1) + ' of ' + QZ.length;
    qT.textContent = item.q;
    qO.innerHTML = '';
    if (qF) { qF.className = 'fb'; qF.innerHTML = ''; }
    if (qN) qN.style.display = 'none';
    if (qR) qR.style.display = 'none';
    if (qRes) qRes.classList.remove('on');
    item.o.forEach(function (text, idx) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = text;
      b.addEventListener('click', function () {
        $$('.opt', qO).forEach(function (x, ix) {
          x.disabled = true;
          if (ix === item.a) x.classList.add('right');
        });
        if (idx === item.a) {
          score++;
          if (qF) { qF.className = 'fb good on'; qF.innerHTML = '<b>Correct.</b> ' + item.w; }
        } else {
          b.classList.add('wrong');
          if (qF) { qF.className = 'fb bad on'; qF.innerHTML = '<b>Not quite.</b> ' + item.w; }
        }
        if (i < QZ.length - 1) { if (qN) qN.style.display = ''; }
        else { finish(); }
      });
      qO.appendChild(b);
    });
  }
  function finish() {
    if (!qRes) return;
    var msg = score >= 7 ? 'You are ready to file real work.'
      : score >= 6 ? 'Good. Skim section 09 and you are set.'
      : score >= 4 ? 'Worth a second pass through sections 06 to 09.'
      : 'Start again at section 00. It reads quickly.';
    qRes.innerHTML = '<div class="big">' + score + ' of ' + QZ.length + '</div><p style="margin:0">' + msg + '</p>';
    qRes.classList.add('on');
    if (qR) qR.style.display = '';
    if (score >= 7) celebrate();
  }
  if (qN) qN.addEventListener('click', function () { i++; render(); });
  if (qR) qR.addEventListener('click', function () { i = 0; score = 0; render(); });
  render();
})();

})();
