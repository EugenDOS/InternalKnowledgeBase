FROM eclipse-temurin:25-jdk AS builder

WORKDIR /app

ENV GRADLE_USER_HOME=/tmp/gradle

COPY gradlew .
COPY gradlew.bat .
COPY settings.gradle .
COPY build.gradle .
COPY gradle gradle

RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

COPY src src

RUN --mount=type=cache,target=/tmp/gradle \
    /bin/sh -c 'for attempt in 1 2 3; do ./gradlew check bootJar --no-daemon && exit 0; echo "Gradle build failed, retry $attempt/3"; sleep 10; done; exit 1'

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
