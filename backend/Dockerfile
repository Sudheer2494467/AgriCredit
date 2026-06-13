# Multi-stage Dockerfile for the Spring Boot backend
# Build stage: use Maven to compile and package the application
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

# Runtime stage: lightweight JRE image
FROM eclipse-temurin:17-jre-jammy
LABEL org.opencontainers.image.source="https://github.com/your-repo/AgriLedgerCropSettlementSystem"

# Create a non-root user
RUN groupadd --system app && useradd --system --gid app app

# Copy the jar produced in the build stage
COPY --from=build /workspace/target/*.jar /app/app.jar
RUN chown app:app /app/app.jar

USER app
WORKDIR /app

# Default port from application.properties
EXPOSE 3039

ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
