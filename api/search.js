const { URL } = require('url');
module.exports = async (req, res) => {
  res.setHeader('Content-Type','application/json');
  const u = new URL(req.url, 'http://x');
  const q = u.searchParams.get('q') || '';
  const id = process.env.OSU_CLIENT_ID, sec = process.env.OSU_CLIENT_SECRET;
  if (!id || !sec) return res.status(500).end(JSON.stringify({error:'osu! API not configured'}));
  const tr = await fetch('https://osu.ppy.sh/oauth/token', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({client_id:id, client_secret:sec, grant_type:'client_credentials', scope:'public'}) });
  const td = await tr.json();
  const r = await fetch('https://osu.ppy.sh/api/v2/beatmapsets/search?q='+encodeURIComponent(q)+'&m=0', { headers:{Authorization:'Bearer '+td.access_token} });
  res.end(JSON.stringify(await r.json()));
};
