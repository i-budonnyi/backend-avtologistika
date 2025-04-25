# Вказуємо базовий імедж
FROM node:18

# Створюємо робочу директорію всередині контейнера
WORKDIR /app

# Копіюємо package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь проєкт у контейнер
COPY . .

# Відкриваємо порт, який ти вказуєш у HTTP_PORT
EXPOSE 10000

# Запускаємо бекенд
CMD ["npm", "run", "start"]
