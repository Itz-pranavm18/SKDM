FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
VOLUME /tmp
COPY target/skm-backend-1.0.0.jar app.jar
EXPOSE 10000 8080
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:MaxRAMPercentage=75.0", "-Xss512k", "-jar", "app.jar"]
