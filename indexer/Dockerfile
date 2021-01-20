FROM gradle:6.8.0-jdk11 AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle shadowJar --no-daemon

FROM openjdk:11-jre-slim
WORKDIR /krepa
COPY --from=build /home/gradle/src/build/libs/*.jar /krepa/index/indexer.jar
ENTRYPOINT [ "java", "-jar", "index/indexer.jar" ]
