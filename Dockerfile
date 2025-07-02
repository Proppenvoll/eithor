FROM node:22-slim AS frontend
WORKDIR /frontend
COPY ./frontend .
RUN npm ci && npm run build


FROM bellsoft/liberica-openjdk-debian:21 AS backend
WORKDIR /backend
COPY ./backend .
COPY --from=build /frontend/dist ./static
RUN ./gradlew build


FROM bellsoft/liberica-openjdk-debian:21-jre
WORKDIR /app

