const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
app.use(cors());

const AV_KEY = process.env.AV_KEY || 'YOUR_API_KEY_HERE';

const rssFeed = {
  cnyes: 'https://feeds.feedburner.com/cnyes',
  econ:  'https://money.udn.com/rssfeed/news/1001/5588?ch=money',
  ctee:  'https://www.ctee.com.tw/feed',
};

const symbols = {
  tsmc: 'TSM',
  btc:  'BTC',
  gold: 'XAU',
  spx:  'SPY',
  usd:  'UUP',
  oil:  'USO',
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
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${AV_KEY}`;
    const data = await (await fetch(url)).json();
    const q = data['Global Quote'];
    if (!q || !q['05. price']) return res.status(500).json({ error: 'API 無回應' });
    res.json({
      symbol:    sym,
      price:     parseFloat(q['05. price']),
      open:      parseFloat(q['02. open']),
      high:      parseFloat(q['03. high']),
      low:       parseFloat(q['04. low']),
      change:    parseFloat(q['09. change']),
      changePct: q['10. change percent'],
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
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${sym}&interval=5min&apikey=${AV_KEY}`;
    const data = await (await fetch(url)).json();
    const series = data['Time Series (5min)'];
    if (!series) return res.status(500).json({ error: 'API 無回應' });
    const points = Object.entries(series).slice(0, 60).reverse().map(([t, v]) => ({
      time: t, price: parseFloat(v['4. close'])
    }));
    res.json(points);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => res.send('財經 Proxy 伺服器運行中'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`伺服器啟動於 port ${PORT}`));