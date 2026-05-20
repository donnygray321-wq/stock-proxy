const express = require('express');
const https = require('https');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/stock', (req, res) => {
  const { ticker, range = '1y' } = req.query;
  if (!ticker) return res.status(400).json({ error: 'No ticker provided' });

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`;
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  };

  https.get(url, options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch(e) {
        res.status(500).json({ error: 'Parse error', raw: data.slice(0, 200) });
      }
    });
  }).on('error', (e) => {
    res.status(500).json({ error: e.message });
  });
});

app.get('/', (req, res) => res.json({ status: 'ok', usage: '/stock?ticker=AAPL' }));

app.listen(process.env.PORT || 3000, () => console.log('Proxy running'));
