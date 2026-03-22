const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const logicaTxt = fs.readFileSync('_nova_logica.txt', 'utf8');
const contraTxt = fs.readFileSync('_nova_contraproposta.txt', 'utf8');

let idx1 = html.indexOf('async function carregarAcordos(userParam) {');
let idx2 = html.indexOf('async function responderAcordo(id, status) {');
let idx3 = html.indexOf('async function abrirContraproposta(id) {');
let idx4 = html.lastIndexOf('</script>');

if (idx1 > -1 && idx2 > -1 && idx3 > -1 && idx4 > -1) {
    let newHtml = html.substring(0, idx1) + 
                  logicaTxt + "\n\n" + 
                  html.substring(idx2, idx3) + 
                  contraTxt + "\n    " + 
                  html.substring(idx4);
                  
    fs.writeFileSync('index.html', newHtml, 'utf8');
    console.log("✅ LÓGICA DE NEGÓCIO ATUALIZADA! Fluxo corrigido com sucesso.");
} else {
    console.log("❌ Erro ao encontrar as funções no index.html");
}
