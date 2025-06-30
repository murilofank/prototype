FROM node:20

# Diretório VM
WORKDIR /prototype-app

# Copia os arquivos de dependência
COPY package*.json ./

RUN npm install

RUN npx prisma generate

# Copia o restante dos arquivos do projeto
COPY . .

EXPOSE 3000