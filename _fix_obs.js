const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

let regex = /let isSwap = String\(fullItemString\)\.includes\('-SI-'\) \|\| String\(fullItemString\)\.includes\('-SO-'\);\s*let btn = document\.createElement\('button'\);/;

let injection = "let isSwap = String(fullItemString).includes('-SI-') || String(fullItemString).includes('-SO-');\n" +
"                let btn = document.createElement('button');\n" +
"                let smartName = config[id].name;\n" +
"                let fsStr = String(fullItemString);\n" +
"                if (fsStr.includes('-SI-')) smartName += ' (PGT TROCA)';\n" +
"                else if (fsStr.includes('-SO-')) smartName += ' (FOLGA TROCA)';\n" +
"                else if (fsStr.includes('-DB')) smartName += ' (DOBRA)';\n" +
"                else if (fsStr.includes('-E')) smartName += ' (EXTRA)';\n" +
"                else if (fsStr.includes('-V')) smartName += ' (FÉRIAS)';\n" +
"                else if (fsStr.includes('-')) smartName += ' (NORMAL)';";

if(regex.test(c)) {
    c = c.replace(regex, injection);
    c = c.replace(/btn\.innerText = config\[id\]\.name;/g, "btn.innerText = smartName;");
    fs.writeFileSync('index.html', c, 'utf8');
    console.log('SUCESSO CIRURGICO! Rotulos inteligentes no Modo Observacao.');
} else {
    console.log('FALHA: Nao encontrou a ancora.');
}
