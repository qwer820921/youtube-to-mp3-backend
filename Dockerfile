FROM node:18
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg
RUN pip3 install yt-dlp
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]