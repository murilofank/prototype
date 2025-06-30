FROM node:20

# Diretório VM
WORKDIR /prototype-app

# Copia os arquivos de dependência
COPY package*.json ./

RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Garante que o Prisma CLI esteja disponível
RUN npx prisma generate

EXPOSE 3000

# Comando de inicialização
CMD ["node", "index.js"]