/*  server.js  */
const express = require('express');
const { exec }  = require('child_process');
const fs        = require('fs');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// -------------- 基本設定 -----------------
app.use(express.json());

// -------------- 路由 -----------------
app.post('/convert', async (req, res) => {
  const { url } = req.body;

  // --- 基本驗證 ---
  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // --- 解析 videoId ---
  let videoId = '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    videoId  = u.searchParams.get('v') || u.pathname.replace('/', '');
  } catch (e) {
    return res.status(400).json({ error: 'Malformed URL' });
  }

  if (!videoId) {
    return res.status(400).json({ error: 'Cannot parse video ID' });
  }

  // --- 組路徑 ---
  const outputFile  = path.join(__dirname, `output-${videoId}.mp3`);
  const cookiesPath = path.join(__dirname, 'config', 'cookies.txt');

  // --- 檢查 cookies.txt ---
  if (!fs.existsSync(cookiesPath)) {
    return res.status(500).json({ error: 'cookies.txt not found in /config' });
  }

  // --- yt‑dlp 指令 ---
  const command = [
    'yt-dlp',
    '--cookies', `"${cookiesPath}"`,
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '128k',
    '-o', `"${outputFile}"`,
    `"${url}"`
  ].join(' ');

  // --- 執行 yt‑dlp ---
  exec(command, (error, _stdout, stderr) => {
    if (error) {
      console.error(stderr || error);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // --- 傳送檔案 ---
    res.download(outputFile, `audio-${videoId}.mp3`, (err) => {
      // 無論成功或失敗都嘗試刪除暫存檔
      try { fs.unlinkSync(outputFile); } catch (e) {}
      if (err) { console.error(err); }
    });
  });
});

// -------------- 啟動 -----------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
