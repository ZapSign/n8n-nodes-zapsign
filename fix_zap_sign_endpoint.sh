#!/bin/bash

# fix-zapsign-endpoint.sh
# Script para corrigir o endpoint de teste da API ZapSign

echo "Iniciando correção do endpoint de teste ZapSign..."

# Caminho para o arquivo de credenciais
CREDENTIALS_FILE="credentials/ZapSignApi.credentials.ts"

# Verificar se o arquivo existe
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo "Erro: O arquivo $CREDENTIALS_FILE não foi encontrado."
    echo "Execute este script na raiz do projeto n8n-nodes-zapsign."
    exit 1
fi

# Backup do arquivo original
cp "$CREDENTIALS_FILE" "${CREDENTIALS_FILE}.bak"
echo "Backup criado: ${CREDENTIALS_FILE}.bak"

# Ler o conteúdo do arquivo
content=$(cat "$CREDENTIALS_FILE")

# Substituir o endpoint /v1/me por /v1/documents
updated_content=$(echo "$content" | sed "s|url: '/v1/me'|url: '/v1/documents'|g")

# Escrever o conteúdo atualizado de volta para o arquivo
echo "$updated_content" > "$CREDENTIALS_FILE"

echo "Endpoint de teste atualizado no arquivo de credenciais."

# Atualizar a versão no package.json
echo "Atualizando versão..."
npm version patch --no-git-tag-version

# Obter a nova versão
new_version=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
echo "Nova versão: $new_version"

# Atualizar o changelog no README.md se existir
if grep -q "## Changelog" README.md; then
    # Inserir nova entrada no changelog
    changelog_entry="### $new_version\n- Corrigido endpoint de teste para autenticação\n\n"
    sed -i "/## Changelog/a $changelog_entry" README.md
    echo "Changelog atualizado no README.md"
fi

# Construir o pacote
echo "Construindo o pacote..."
npm run build

echo "Pacote construído com sucesso!"

# Adicionar ao git
git add "$CREDENTIALS_FILE" package.json README.md
git commit -m "Fix: Atualizado endpoint de teste de autenticação para /v1/documents"
git tag "v$new_version"

echo "Alterações comitadas e tag criada: v$new_version"

# Publicar no NPM
echo "Publicando no NPM..."
npm publish

echo "Pacote publicado com sucesso!"

# Enviar para o repositório remoto
echo "Enviando alterações para o repositório remoto..."
git push && git push --tags

echo "Processo finalizado com sucesso!"
echo "Script concluído, pode ser excluído com segurança."
