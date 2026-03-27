const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Localiza o bloco da Central de Ajuda que está sobrando no rodapé geral
const regexHelpBlock = /<div class="mt-8 pt-6 border-t border-slate-700\/50 flex flex-col items-center">[\s\S]*?(<\/button>|<\/a>)\s*<\/div>/;
const match = html.match(regexHelpBlock);

if (match) {
    let helpBlock = match[0];
    
    // 2. Remove ele da posição atual (onde ele aparece em todas as telas)
    html = html.replace(regexHelpBlock, '');
    
    // 3. Injeta o bloco EXCLUSIVAMENTE dentro do formulário de login (loginForm)
    // Antes de fechar a tag </form>, para que ele suma quando trocar de tela
    html = html.replace('</form>', `\n                ${helpBlock}\n                </form>`);
    
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("✅ OPERAÇÃO CONCLUÍDA: Central de Ajuda removida da Segunda Tela!");
} else {
    console.log("❌ ERRO: Bloco de ajuda não encontrado ou já está no lugar certo.");
}
