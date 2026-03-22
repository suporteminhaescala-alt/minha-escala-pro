const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

function rep(old, novo) {
    if (c.includes(old)) { c = c.replace(old, novo); return true; }
    const alt = old.replace(/\r\n/g, '\n');
    if (c.includes(alt)) { c = c.replace(alt, novo); return true; }
    const alt2 = old.replace(/\n/g, '\r\n');
    if (c.includes(alt2)) { c = c.replace(alt2, novo); return true; }
    return false;
}

// INJ1 — targetOptions com rotulos inteligentes
const anc1 = "                let targetOptions = [];\n                valid.forEach(item => {\n                    let id = parseInt(item.split('-')[0]);\n                    if (!config[id]) return;\n\n                    if (item.includes('-DB')) {\n                        targetOptions.push({ id: id, isExtraPart: false, label: \\ (Normal)\, fullItem: item });\n                        targetOptions.push({ id: id, isExtraPart: true, label: \\ (Extra)\, fullItem: item });\n                    } else {\n                        targetOptions.push({ id: id, isExtraPart: false, label: config[id].name, fullItem: item });\n                    }\n                });";
const nov1 = "                let targetOptions = [];\n                valid.forEach(item => {\n                    let id = parseInt(item.split('-')[0]);\n                    if (!config[id]) return;\n\n                    let label = config[id].name;\n                    if (item.includes('-SI-')) label += ' (PGT TROCA)';\n                    else if (item.includes('-SO-')) label += ' (FOLGA TROCA)';\n                    else if (item.includes('-DB')) {\n                        targetOptions.push({ id: id, isExtraPart: false, label: \\ (Normal)\, fullItem: item });\n                        targetOptions.push({ id: id, isExtraPart: true, label: \\ (Extra)\, fullItem: item });\n                        return;\n                    }\n                    else if (item.includes('-E')) label += ' (Extra)';\n                    else label += ' (Normal)';\n\n                    targetOptions.push({ id: id, isExtraPart: false, label: label, fullItem: item });\n                });";
const ok1 = rep(anc1, nov1);
console.log('INJ1:', ok1 ? 'OK' : 'FALHOU');

// INJ2 — passa fullItem para openShiftTypeSelector
const ok2a = rep(
    "                    openShiftTypeSelector(dateKey, targetOptions[0].id, targetOptions[0].isExtraPart);",
    "                    openShiftTypeSelector(dateKey, targetOptions[0].id, targetOptions[0].isExtraPart, targetOptions[0].fullItem);"
);
const ok2b = rep(
    "                    selectorCallback = (option) => openShiftTypeSelector(dateKey, option.id, option.isExtraPart);",
    "                    selectorCallback = (option) => openShiftTypeSelector(dateKey, option.id, option.isExtraPart, option.fullItem);"
);
console.log('INJ2:', (ok2a || ok2b) ? 'OK' : 'FALHOU');

// INJ3 — openShiftTypeSelector salva fullItem
const anc3 = "        function openShiftTypeSelector(k, i, isExtraPart = false) {\n            shiftTargetDay = k;\n            shiftTargetId = i;\n            shiftTargetIsExtra = isExtraPart;\n            document.getElementById('shiftTypeModal').classList.remove('hidden');\n        }";
const nov3 = "        function openShiftTypeSelector(k, i, isExtraPart = false, fullItem = '') {\n            shiftTargetDay = k;\n            shiftTargetId = i;\n            shiftTargetIsExtra = isExtraPart;\n            window._shiftTargetFullItem = fullItem;\n            document.getElementById('shiftTypeModal').classList.remove('hidden');\n        }";
const ok3 = rep(anc3, nov3);
console.log('INJ3:', ok3 ? 'OK' : 'FALHOU');

// INJ4 — saveShiftType usa item exato
const anc4 = "        function saveShiftType(t) {\n            let list = shifts[shiftTargetDay] || [];\n            let itemIndex = list.findIndex(x => parseInt(String(x).split('-')[0]) === shiftTargetId && !x.includes('OBS:'));";
const nov4 = "        function saveShiftType(t) {\n            let list = shifts[shiftTargetDay] || [];\n            let itemIndex = window._shiftTargetFullItem ? list.indexOf(window._shiftTargetFullItem) : -1;\n            if (itemIndex === -1) itemIndex = list.findIndex(x => parseInt(String(x).split('-')[0]) === shiftTargetId && !x.includes('OBS:'));";
const ok4 = rep(anc4, nov4);
console.log('INJ4:', ok4 ? 'OK' : 'FALHOU');

if (ok1 && (ok2a || ok2b) && ok3 && ok4) {
    fs.writeFileSync('index.html', c, 'utf8');
    console.log('\u2705 CONCLUIDO!');
} else {
    console.error('\u274C UMA OU MAIS ANCORAS NAO ENCONTRADAS');
    process.exit(1);
}
