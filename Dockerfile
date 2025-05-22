FROM python:3.11-slim

# 建立工作資料夾
WORKDIR /app

# 安裝系統依賴（可選）
RUN apt-get update && apt-get install -y ffmpeg curl

# 建立並啟用 virtualenv
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# 安裝 yt-dlp 到 virtualenv
RUN pip install --upgrade pip
RUN pip install yt-dlp

# 複製你的 Node.js 專案
COPY . .

# 安裝 Node.js & Express 相關依賴（假設你是 Node + Python 混合應用）
RUN apt-get install -y nodejs npm
RUN npm install

# 啟動應用
CMD ["node", "index.js"]
