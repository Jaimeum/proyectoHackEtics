FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar dependencias primero (mejor cacheo de capas)
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el resto de la app
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
