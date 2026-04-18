FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

COPY gradlew .
COPY gradlew.bat .
COPY settings.gradle .
COPY build.gradle .
COPY gradle gradle

RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY src src

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
