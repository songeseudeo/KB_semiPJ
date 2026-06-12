FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
RUN chmod +x gradlew && ./gradlew bootJar -x test
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "build/libs/realestate-0.0.1-SNAPSHOT.jar"]
