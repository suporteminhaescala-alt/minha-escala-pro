const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// Normaliza para LF puro
const crlf = c.includes('\r\n');
console.log('Formato:', crlf ? 'CRLF' : 'LF');

function rep(old, novo) {
    if (c.includes(old)) { c = c.replace(old, novo); return true; }
    const alt = old.replace(/\r\n/g, '\n');
    if (c.includes(alt)) { c = c.replace(alt, novo); return true; }
    const alt2 = old.replace(/\n/g, '\r\n');
    if (c.includes(alt2)) { c = c.replace(alt2, novo); return true; }
    return false;
}

// INJ1 — CSS: libera mes no landscape
const ok1 = rep(
    "            /* Oculta o centro (M\u00eas, Ano e Nuvem) para ganhar 100% de vis\u00e3o da tabela */\n            #month-display,\n            #year-display,\n            #cloudIcon,\n            #screen-app>header .text-center {\n                display: none !important;\n            }",
    "            /* Ano oculto, mes e nuvem liberados */\n            #year-display { display: none !important; }"
);
console.log('INJ1 CSS:', ok1 ? 'OK' : 'FALHOU');

// INJ2 — HTML: mes discreto (ADJUSTED TO TARGET CURRENT STATE)
const ok2 = rep(
    '            <div class="text-center cursor-pointer mt-2" onclick="goToToday()">\n                <div class="flex items-center justify-center gap-3">\n                    <h2 id="month-display" class="font-black text-white text-[22px] tracking-[0.2em] uppercase">FEVEREIRO</h2>\n                    <i id="cloudIcon" onclick="syncWithCloud()"\n                        class="fas fa-cloud text-sm text-slate-600 cursor-pointer hover:text-white mt-1"\n                        title="Sincronizar"></i>\n                </div>\n            </div>',
    '            <div class="text-center cursor-pointer mt-2" onclick="goToToday()">\n                <div class="flex items-center justify-center gap-3">\n                    <h2 id="month-display" class="font-bold text-slate-300 text-sm tracking-wider uppercase">FEVEREIRO</h2>\n                    <i id="cloudIcon" onclick="syncWithCloud()"\n                        class="fas fa-cloud text-xs text-slate-500 cursor-pointer hover:text-emerald-400"\n                        title="Sincronizar"></i>\n                </div>\n                <p id="year-display" class="hidden">2026</p>\n            </div>'
);
console.log('INJ2 HTML:', ok2 ? 'OK' : 'FALHOU');

// INJ3 — Gaveta SI: parser ~
const ok3 = rep(
    "                        var siParts = item.split('-SI-')[1] ? item.split('-SI-')[1].split('-') : [];\n                        var diaRefSI = siParts[0] || '?';\n                        var colSI = (siParts[1] || 'VOCE').toUpperCase();",
    "                        var siAfter = item.split('-SI-')[1] || '';\n                        var diaRefSI = siAfter.split('~')[0].split('-')[0] || '?';\n                        var colSI = (siAfter.split('~')[1] || siAfter.split('-')[1] || 'VOCE').toUpperCase();"
);
console.log('INJ3 siParts:', ok3 ? 'OK' : 'FALHOU');

// INJ4 — Gaveta SI badge
const ok4 = rep(
    "                        if (colSI === 'VOCE') {\n                            badge = '<span class=\"bg-slate-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-1.5\">INVERSAO</span>';\n                            info  = '<p class=\"text-[9px] text-slate-300 font-bold mt-1\">\\u{1F503} Referente ao dia ' + diaRefSI + '</p>';\n                        } else {\n                            badge = '<span class=\"bg-purple-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-1.5\">TROCA</span>';\n                            info  = '<p class=\"text-[9px] text-purple-300 font-bold mt-1\">\\u{1F91D} Recebido de: ' + colSI + ' - ref. dia ' + diaRefSI + '</p>';\n                        }",
    "                        if (colSI === 'VOCE') {\n                            badge = '<span class=\"bg-slate-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-1.5\">INVERS\u00c3O</span>';\n                            info  = '<p class=\"text-[9px] text-slate-300 font-bold mt-1\">\\u{1F503} Referente ao dia ' + diaRefSI + '</p>';\n                        } else {\n                            badge = '<span class=\"bg-purple-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded ml-1.5 uppercase\">PAGAMENTO</span>';\n                            info  = '<p class=\"text-[9px] text-purple-300 font-bold mt-1 uppercase\">\\u{1F91D} Cobrindo plant\u00e3o de: ' + colSI + '</p><p class=\"text-[9px] text-slate-300 font-bold mt-0.5 uppercase\">\\u{1F504} Voc\u00ea folgar\u00e1 no dia ' + diaRefSI + '</p>';\n                        }"
);
console.log('INJ4 badge:', ok4 ? 'OK' : 'FALHOU');

// INJ5 — PDF parser ~ + frases oficiais
const ok5 = rep(
    '                    let colega = (after.split(\'-\')[1] || \'COLEGA\').toUpperCase();\n                    let titular = isSO ? profName : colega;\n                    let substituto = isSO ? colega : profName;\n                    doc.text("- " + substituto + " cumpre o servico no dia: " + dataFormatada, 18, finalY+42);\n                    doc.text("   Horario: " + st + " as " + et + "   |   Turno: " + turnoLabel, 18, finalY+48);\n                    let dataComp = diaRef + " de " + MONTH_NAMES[currentDate.getMonth()] + " de " + currentDate.getFullYear();\n                    doc.text("- " + titular + " compensa no dia: " + dataComp, 18, finalY+54);',
    '                    let colega = (after.split(\'~\')[1] || after.split(\'-\')[1] || \'COLEGA\').toUpperCase();\n                    let titular = isSO ? profName : colega;\n                    let substituto = isSO ? colega : profName;\n                    doc.text("- " + substituto + " ASSUMIRA O PLANTAO NO DIA: " + dataFormatada, 18, finalY+42);\n                    doc.text("   Horario: " + st + " as " + et + "   |   Turno: " + turnoLabel, 18, finalY+48);\n                    let dataComp = diaRef + " de " + MONTH_NAMES[currentDate.getMonth()] + " de " + currentDate.getFullYear();\n                    doc.text("- " + titular + " ASSUMIRA O PLANTAO NO DIA: " + dataComp, 18, finalY+54);'
);
console.log('INJ5 PDF:', ok5 ? 'OK' : 'FALHOU');

if (ok1 && ok2 && ok3 && ok4 && ok5) {
    fs.writeFileSync('index.html', c, 'utf8');
    console.log('\u2705 CONCLUIDO!');
} else {
    console.error('\u274C ERRO: UMA OU MAIS ANCORAS NAO ENCONTRADAS');
    process.exit(1);
}
