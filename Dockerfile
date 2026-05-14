FROM node:22.12.0 AS build

# 添加构建参数，默认为开发环境
ARG BUILD_MODE=build

WORKDIR /app

# 先复制 package 文件，利用 Docker 缓存层
COPY package.json pnpm-lock.yaml ./

# 安装依赖（仅在 package 文件变化时重新执行）
RUN npm install -g pnpm --registry=https://registry.npmmirror.com && \
    npm config set registry https://registry.npmmirror.com && \
    npm install --frozen-lockfile

# 再复制源码（源码变化不会触发重新 install）
COPY . .

# 使用传入的构建模式
RUN npm run ${BUILD_MODE}

FROM nginx:latest
ARG NGINX_ENV=dev
COPY --from=0 /app/dist /usr/share/nginx/html/
COPY config/${NGINX_ENV}/nginx.conf /etc/nginx/nginx.conf
