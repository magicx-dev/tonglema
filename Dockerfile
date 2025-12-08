# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段 - 使用 nginx 提供静态文件服务
FROM nginx:alpine

# 安装 wget 用于健康检查
RUN apk add --no-cache wget

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

