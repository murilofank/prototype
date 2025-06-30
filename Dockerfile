FROM node:20

# Diretório VM
WORKDIR /prototype-app

# Copia os arquivos de dependência
COPY package*.json ./
COPY .env* ./

RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Garante que o Prisma CLI esteja disponível
RUN npx prisma generate

EXPOSE 3000

# Comando de inicialização
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]