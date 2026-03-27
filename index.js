/* index.js  */
const express = require('express');
const { exec }  = require('child_process');
const fs         = require('fs');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/convert', async (req, res) => {
  const { url } = req.body;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  let videoId = '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    videoId  = u.searchParams.get('v') || u.pathname.replace('/', '');
  } catch (e) {
    return res.status(400).json({ error: 'Malformed URL' });
  }

  const outputFile = path.join(__dirname, `output-${videoId}.mp3`);

  // --- 終極純淨版 yt-dlp 指令 ---
  // 完全不讀取 cookies，只用 Android API 偽裝
  const commandArgs = [
    'yt-dlp',
    '-f', 'ba/b', 
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '128k',
    '--extractor-args', '"youtube:player_client=android"', 
    '-o', `"${outputFile}"`,
    `"${url}"`
  ];

  const command = commandArgs.join(' ');

  exec(command, (error, _stdout, stderr) => {
    if (error) {
      console.error('yt-dlp 錯誤詳情:', stderr || error);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    if (fs.existsSync(outputFile)) {
      res.download(outputFile, `audio-${videoId}.mp3`, (err) => {
        try { fs.unlinkSync(outputFile); } catch (e) {}
        if (err) { console.error('下載傳送錯誤:', err); }
      });
    } else {
      res.status(500).json({ error: 'File not found after conversion' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Clean Mode)`);
});