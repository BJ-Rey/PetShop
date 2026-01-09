# 第一阶段：编译阶段 (使用 Maven 3.6 + JDK 8)
FROM maven:3.6.3-jdk-8-slim AS build
WORKDIR /app

# 1. 复制 pom.xml 和 src 目录到镜像中
COPY pom.xml .
COPY src ./src

# 2. 执行打包，跳过单元测试以加快部署速度
RUN mvn clean package -DskipTests

# 第二阶段：运行阶段 (使用轻量级 Alpine 镜像)
FROM openjdk:8-jdk-alpine
WORKDIR /app    

# 3. 从构建阶段复制生成的 jar 包到当前目录，重命名为 app.jar
# 这样可以避免因文件名不同导致的启动失败
COPY --from=build /app/target/*.jar /app/app.jar

# 4. 微信云托管建议：设置时区为上海
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 5. 暴露 8080 端口（Spring Boot 默认端口）
EXPOSE 8080

# 6. 启动命令，强制指定端口以匹配云托管设置
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar", "--server.port=8080"]
