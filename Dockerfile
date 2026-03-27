# 使用 python:3.11-slim 作為基礎映像
FROM python:3.11-slim

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3-venv \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# 創建並啟用虛擬環境
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# 強制升級 pip 並重新安裝/更新 yt-dlp
RUN pip install --no-cache-dir --upgrade pip yt-dlp

# 複製應用程式檔案
COPY . .

# 安裝 Node.js 依賴
RUN npm install

# 設置 Railway 提供的 PORT 環境變數
ENV PORT=$PORT

# 啟動應用程式
CMD ["node", "index.js"]