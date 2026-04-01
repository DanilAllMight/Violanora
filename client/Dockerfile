# Шаг 1: Сборка React приложения
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Собираем проект (Vite создаст папку dist)
RUN npm run build

# Шаг 2: Раздача статики через Nginx
FROM nginx:stable-alpine

# Копируем собранные файлы из первого шага в папку Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf


# Открываем 80 порт для браузера
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
