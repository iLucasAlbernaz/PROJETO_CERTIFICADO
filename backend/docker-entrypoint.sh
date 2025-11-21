#!/bin/sh

# Para o script se houver algum erro grave
set -e

echo "🚀 Iniciando Container do Backend..."

# MUDANÇA AQUI:
# O erro P3005 acontecia porque o 'migrate deploy' tentava criar tabelas que já existiam.
# O 'db push' é mais flexível: ele sincroniza o seu código com o banco existente
# sem tentar recriar o histórico do zero.
echo "🔄 Sincronizando Schema com o Banco (DB Push)..."
npx prisma db push

# Inicia a aplicação
echo "✅ Iniciando Servidor..."
exec npm run start