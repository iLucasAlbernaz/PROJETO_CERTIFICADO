#!/bin/sh
set -e

echo "🚀 Iniciando Container do Backend..."

echo "🔄 Sincronizando Banco de Dados (DB Push)..."
npx prisma db push

echo "✅ Buscando arquivo de inicialização..."
if [ -f "dist/server.js" ]; then
    echo "▶️ Executando dist/server.js"
    exec node dist/server.js
elif [ -f "dist/index.js" ]; then
    echo "▶️ Executando dist/index.js"
    exec node dist/index.js
elif [ -f "dist/src/server.js" ]; then
    echo "▶️ Executando dist/src/server.js"
    exec node dist/src/server.js
elif [ -f "dist/src/index.js" ]; then
    echo "▶️ Executando dist/src/index.js"
    exec node dist/src/index.js
else
    echo "❌ ERRO: Nenhum arquivo principal encontrado na pasta dist!"
    ls -R dist/
    exit 1
fi
