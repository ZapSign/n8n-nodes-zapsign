#!/bin/bash

# deploy-zapsign-auth-fix.sh
# Script para atualizar a versão, construir e publicar as alterações do ZapSign

echo "Iniciando processo de deploy para o NPM e Git..."

# Incrementar a versão no package.json
echo "Atualizando versão..."
npm version patch --no-git-tag-version

# Obter a nova versão
new_version=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
echo "Nova versão: $new_version"

# Atualizar o changelog no README.md
if grep -q "## Changelog" README.md; then
    # Texto da nova entrada no changelog
    changelog_entry="### $new_version\n- Corrigido formato de autenticação: alterado de 'Authorization: Bearer' para 'apikey'\n\n"
    
    # Inserir a nova entrada após a linha "## Changelog"
    sed -i "/## Changelog/a $changelog_entry" README.md
    echo "Changelog atualizado no README.md"
fi

# Construir o pacote
echo "Construindo o pacote..."
npm run build

echo "Pacote construído com sucesso!"

# Adicionar ao git
git add .
git commit -m "Fix: Atualizado formato de autenticação para usar 'apikey'"
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
echo "Script concluído."
