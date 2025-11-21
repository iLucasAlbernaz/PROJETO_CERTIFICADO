#!/bin/sh

# Para o script se houver erro
set -e

echo "🚀 Iniciando Container do Backend..."

# Debug: Mostra o que foi gerado na build para você saber
echo "📂 Estrutura da pasta dist:"
ls -R dist/

echo "🔄 Sincronizando Schema com o Banco..."
npx prisma db push

echo "✅ Escolhendo arquivo de inicialização..."

# Tenta encontrar o arquivo correto automaticamente
if [ -f "dist/server.js" ]; then
    echo "▶️ Rodando server.js"
    exec node dist/server.js
elif [ -f "dist/index.js" ]; then
    echo "⚠️ server.js não encontrado. Rodando index.js..."
    exec node dist/index.js
elif [ -f "dist/app.js" ]; then
    echo "⚠️ server.js não encontrado. Rodando app.js..."
    exec node dist/app.js
elif [ -f "dist/main.js" ]; then
    echo "⚠️ server.js não encontrado. Rodando main.js..."
    exec node dist/main.js
elif [ -f "dist/src/server.js" ]; then
    echo "⚠️ Encontrado em subpasta. Rodando dist/src/server.js..."
    exec node dist/src/server.js
else
    echo "❌ ERRO: Nenhum arquivo principal (server.js, index.js, app.js) encontrado na pasta dist!"
    exit 1
fi