const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

app.post('/convert', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('youtube.com')) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const videoId = url.split('v=')[1]?.split('&')[0];
  const outputFile = path.join(__dirname, `output-${videoId}.mp3`);

  // 使用 yt-dlp 下載並轉換為 MP3
  const command = `yt-dlp --extract-audio --audio-format mp3 --audio-quality 320k -o "${outputFile}" "${url}"`;
  exec(command, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Conversion failed' });
    }

    // 返回 MP3 文件
    res.download(outputFile, `audio-${videoId}.mp3`, (err) => {
      if (err) {
        console.error(err);
      }
      // 清理臨時文件
      fs.unlinkSync(outputFile);
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});