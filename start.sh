#!/bin/bash

read -p "please input(prod/test/pre):" value


if [ "$value" == "pre" ]; then
    name="pod_erp_style_vue_pre"
    port="1503"
    build="build_pre"
    nginx_env="pre"
fi


if [ "$value" == "test" ]; then
    name="pod_erp_style_vue_test"
    port="1603"
    build="build_test"
    nginx_env="test"
fi

if [ "$value" == "prod" ]; then
    name="pod_erp_style_vue_prod"
    port="3503"
    build="build_prod"
    nginx_env="prod"
fi

# 用时间戳生成版本号
VERSION=$(date +%Y%m%d%H%M%S)

# 记录旧镜像ID（用于后续删除）
OLD_IMAGE_ID=$(docker images -q ${name}:latest 2>/dev/null)

echo "=== 第一步：构建新镜像（旧服务继续运行）==="
sudo docker build --network=host --build-arg BUILD_MODE=${build} --build-arg NGINX_ENV=${nginx_env} -t ${name}:${VERSION} .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败！"
    exit 1
fi

echo "=== 第二步：在临时端口启动新容器进行健康检查 ==="
TEMP_PORT=$((port + 10000))
sudo docker run --name ${name}_new -p ${TEMP_PORT}:80 -d ${name}:${VERSION}

echo "=== 第三步：健康检查 ==="
sleep 5
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${TEMP_PORT} 2>/dev/null)
    if [ "$HTTP_STATUS" == "200" ]; then
        echo "✅ 新容器健康检查通过！"
        break
    fi
    echo "等待容器就绪... (${RETRY_COUNT}/${MAX_RETRIES})"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# 健康检查失败，回滚
if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ 新容器启动失败，正在回滚..."
    docker rm -f ${name}_new
    docker rmi ${name}:${VERSION}
    echo "回滚完成，旧服务继续运行"
    exit 1
fi

echo "=== 第四步：切换流量 ==="
# 停止并删除临时容器
docker rm -f ${name}_new

# 停止并删除旧容器
docker rm -f ${name} 2>/dev/null

# 在正式端口启动新容器
sudo docker run --restart=always --name ${name} -p ${port}:80 -d ${name}:${VERSION}

# 给新镜像打上 latest 标签
docker tag ${name}:${VERSION} ${name}:latest

echo "=== 第五步：清理旧镜像 ==="
# 删除旧镜像（通过之前记录的ID）
if [ -n "$OLD_IMAGE_ID" ]; then
    NEW_IMAGE_ID=$(docker images -q ${name}:${VERSION})
    if [ "$OLD_IMAGE_ID" != "$NEW_IMAGE_ID" ]; then
        echo "删除旧镜像: $OLD_IMAGE_ID"
        docker rmi $OLD_IMAGE_ID 2>/dev/null
    fi
fi

# 删除所有该项目的历史版本镜像（只保留 latest 和当前版本）
echo "清理历史版本镜像..."
docker images ${name} --format "{{.ID}} {{.Tag}}" | while read IMAGE_ID TAG; do
    if [ "$TAG" != "latest" ] && [ "$TAG" != "$VERSION" ]; then
        echo "删除历史镜像: ${name}:${TAG}"
        docker rmi ${name}:${TAG} 2>/dev/null
    fi
done

# 清理悬空镜像
echo "清理悬空镜像..."
docker image prune -f

echo ""
echo "=== ✅ 部署完成！==="
echo "容器名称: ${name}"
echo "访问端口: ${port}"
echo "镜像版本: ${VERSION}"
echo "Nginx环境: ${nginx_env}"
echo ""
echo "当前镜像列表:"
docker images ${name}