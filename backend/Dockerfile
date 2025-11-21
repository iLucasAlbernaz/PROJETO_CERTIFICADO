FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
# --- CORREÇÃO: Copia a pasta de documentação para o estágio de build ---
COPY docs ./docs
# -----------------------------------------------------------------------
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
# --- CORREÇÃO: Copia a pasta docs do estágio anterior para a imagem final ---
COPY --from=base /app/docs ./docs
# ----------------------------------------------------------------------------
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 4000
CMD ["./docker-entrypoint.sh"]