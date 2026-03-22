const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Procura o parágrafo exato dentro do card de sincronização e substitui
const regexParagrafo = /<p class="text-\[10px\] text-slate-400 leading-relaxed mb-4">.*?<\/p>/;
const novoParagrafo = '<p class="text-[10px] text-slate-400 leading-relaxed mb-4">Você pode usar sua conta no celular e logar em até 2 telas extras (Computador ou Tablet) simultaneamente. Copie o link abaixo e abra no navegador.</p>';

if (regexParagrafo.test(html)) {
    html = html.replace(regexParagrafo, novoParagrafo);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('✅ TEXTO ALINHADO: A frase agora inclui Computador e Tablet!');
} else {
    console.log('⚠️ Parágrafo não encontrado. Verifique se o código já foi alterado.');
}
