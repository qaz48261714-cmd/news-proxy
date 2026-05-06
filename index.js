const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
app.use(cors());

const rssFeed = {
  cnyes: 'https://feeds.feedburner.com/cnyes',
  econ:  'https://money.udn.com/rssfeed/news/1001/5588?ch=money',
  ctee:  'https://www.ctee.com.tw/feed',
};

// Yahoo Finance 標的對照表
const symbols = {
  tsmc: '2330.TW',   // 台積電（台股）
  btc:  'BTC-USD',   // 比特幣
  gold: 'GC=F',      // 黃金期貨
  spx:  '^GSPC',     // S&P 500 指數
  usd:  'DX-Y.NYB',  // 美元指數
  oil:  'CL=F',      // 原油期貨
};

// 幣種對照
const currencies = {
  tsmc: 'TWD', btc: 'USD', gold: 'USD',
  spx: 'USD', usd: 'USD', oil: 'USD',
};

app.get('/news/:source', async (req, res) => {
  const url = rssFeed[req.params.source];
  if (!url) return res.status(404).json({ error: '來源不存在' });
  try {
    const feed = await parser.parseURL(url);
    res.json(feed.items.slice(0, 8).map(i => ({
      title: i.title, link: i.link, time: i.pubDate
    })));
  } catch (e) {
    res.status(500).json({ error: '無法取得新聞' });
  }
});

app.get('/price/:asset', async (req, res) => {
  const sym = symbols[req.params.asset];
  if (!sym) return res.status(404).json({ error: '標的不存在' });
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const data = await (await fetch(url, { headers })).json();
    const meta = data.chart.result[0].meta;
    const price  = meta.regularMarketPrice;
    const open   = meta.chartPreviousClose || meta.regularMarketOpen;
    const high   = meta.regularMarketDayHigh;
    const low    = meta.regularMarketDayLow;
    const change = price - open;
    res.json({
      symbol: sym,
      price,
      open,
      high,
      low,
      change,
      changePct: ((change / open) * 100).toFixed(2) + '%',
      currency: currencies[req.params.asset] || 'USD',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/intraday/:asset', async (req, res) => {
  const sym = symbols[req.params.asset];
  if (!sym) return res.status(404).json({ error: '標的不存在' });
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=5m&range=1d`;
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    const data = await (await fetch(url, { headers })).json();
    const result = data.chart.result[0];
    const times  = result.timestamp;
    const closes = result.indicators.quote[0].close;
    const points = times.map((t, i) => ({
      time:  new Date(t * 1000).toISOString(),
      price: closes[i] || null,
    })).filter(p => p.price !== null);
    res.json(points);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('財經 Proxy 伺服器運行中（Yahoo Finance）'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`伺服器啟動於 port ${PORT}`));