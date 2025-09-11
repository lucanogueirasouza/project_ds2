# Use a imagem oficial do Node.js 18 como base.
FROM node:18

# Defina o diretório de trabalho no contêiner.
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json para o contêiner.
# Isso permite que o Docker use o cache e não reinstale as dependências
# se você só mudar o código (e não o package.json).
COPY package*.json ./

# Instale todas as dependências do projeto.
RUN npm install

# Copie o restante dos arquivos do seu projeto para o contêiner.
COPY . .

# Exponha a porta 3001, que é a porta que sua aplicação usa.
EXPOSE 3001

# Comando para iniciar a sua aplicação quando o contêiner for iniciado.
# O Docker irá executar o 'server.js' como o arquivo principal
CMD [ "npm", "run", "dev" ]
