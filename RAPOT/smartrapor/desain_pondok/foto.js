const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  for (const n of ['C2']) {
    await p.goto('file://' + __dirname + '/desain_' + n + '.html');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const ukur = await p.evaluate(() => {
      const els = [...document.querySelectorAll('.isi > *, .ttd')]; const kaki = document.querySelector('.kaki');
      const bawah = Math.max(...els.map(e => e.getBoundingClientRect().bottom));
      const f = [...document.fonts].filter(x => x.status === 'loaded').map(x => x.family);
      return { batas: kaki ? Math.round(kaki.getBoundingClientRect().top) : 1109, bawah: Math.round(bawah), huruf: [...new Set(f)].join(',') };
    });
    console.log(n, JSON.stringify(ukur));
    await p.screenshot({ path: __dirname + '/Desain_' + n + '.png' });
  }
  await b.close();
})();
