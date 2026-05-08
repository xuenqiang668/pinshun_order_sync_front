FROM node:22.12.0 AS build

# 添加构建参数，默认为开发环境
ARG BUILD_MODE=build

WORKDIR /app
COPY . .

RUN npm install -g pnpm --registry=https://registry.npmmirror.com/
RUN pnpm config set registry https://registry.npmmirror.com/
RUN pnpm install

# 使用传入的构建模式
RUN npm run ${BUILD_MODE}

FROM nginx:latest
ARG NGINX_ENV=dev
COPY --from=0 /app/dist /usr/share/nginx/html/
COPY config/${NGINX_ENV}/nginx.conf /etc/nginx/nginx.conf
