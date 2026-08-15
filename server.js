const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// haowallpaper固定AES加密密钥，不要修改
const AES_KEY = Buffer.from('687a68616f7a68616f30373836353139', 'hex');
const AES_IV = Buffer.from('61616e31373662313531393635343731');

// 加密函数
function encrypt(str) {
  const cipher = crypto.createCipheriv('aes-128-cbc', AES_KEY, AES_IV);
  let res = cipher.update(str, 'utf8', 'base64');
  res += cipher.final('base64');
  return res.replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
}
// 解密函数
function decrypt(cipherText) {
  let raw = cipherText.replace(/_/g, '/').replace(/-/g, '+');
  const pad = raw.length % 4;
  if(pad) raw += '='.repeat(4);
  const decipher = crypto.createDecipheriv('aes-128-cbc', AES_IV);
  let res = decipher.update(raw, 'base64', 'utf8');
  res += decipher.final('utf8');
  return res;
}
// 唤醒接口，防止休眠
app.get('/ping', (req, res) => {
  res.send('ok');
});
// 获取壁纸列表核心接口
app.get('/api/getWall', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const params = JSON.stringify({ page, limit: 24, type: 'pc' });
    const encData = encrypt(params);
    const targetUrl = `https://haowallpaper.com/link/pc/wallpaper/getWallpaperList?data=${encData}`;
    const resp = await axios.get(targetUrl, {
      headers: {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome 120'
      }
try {
    const decryptData = decrypt(resp.data.data);
    const wallList = JSON.parse(decryptData);
    res.json({code:200, list: wallList.list});
  } catch (err) {
    res.json({code:-1, msg:'哦豁，获取失败'});
  }
});
// Render自动识别端口，禁止写死3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
});
  console.log(`服务运行端口：${PORT}`);
})
