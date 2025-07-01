FROM node:20

# Diretório VM
WORKDIR /prototype-app

# Copia os arquivos de dependência
COPY package*.json ./

RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy

EXPOSE 3000