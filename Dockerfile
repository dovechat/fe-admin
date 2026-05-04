FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g serve
COPY . .
RUN mkdir -p public && echo '{"rewrites":[{"source":"/**","destination":"/index.html"}]}' > public/serve.json
RUN npm run build