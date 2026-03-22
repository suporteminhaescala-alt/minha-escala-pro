const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const novoBloco = fs.readFileSync('_bloco_mestre.txt', 'utf8');

// 1. Limpeza de emergência: Remove os Syntax Errors (</script>}) gerados pelos scripts anteriores
html = html.replace(/<\/script>\s*\}/g, '</script>');
html = html.replace(/}\s*<\/script>/g, '\n</script>');

// 2. Localiza onde a zona de guerra começa (antes de apagar as velhas)
let startIdx = html.indexOf('function iniciarSolicitacaoTroca');
if (startIdx === -1) startIdx = html.indexOf('async function buscarColega');
if (startIdx === -1) startIdx = html.indexOf('async function abrirContraproposta');
if (startIdx === -1) startIdx = html.indexOf('async function selecionarColega');

const endIdx = html.lastIndexOf('</script>');

if (startIdx > -1 && endIdx > -1) {
    // 3. Substitui toda a zona quebrada pelo Bloco Mestre Completo
    let cleanHtml = html.substring(0, startIdx) + "\n" + novoBloco + "\n    " + html.substring(endIdx);
    fs.writeFileSync('index.html', cleanHtml, 'utf8');
    console.log("✅ CÓDIGO RESTAURADO! Syntax Error destruído. O App acordou!");
} else {
    console.log("❌ Erro fatal: Não foi possível localizar a zona de injeção.");
}
