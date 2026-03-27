const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');

// 1. SOBE O NÚMERO E TIRA O BLOCO (Faz o 12 virar o 19)
const regexDayHeader = /<div class="absolute top-0 left-0 bg-slate-900\/80 backdrop-blur-sm px-1 py-0 rounded-br-md z-20 border-b border-r \${isToday \? 'border-yellow-400\/50' : 'border-slate-700'}">/s;
const newDayHeader = `<div class="absolute top-0 left-0 z-20 px-[2px] py-0 leading-none">`;
h = h.replace(regexDayHeader, newDayHeader);

// Remove o espaço vazio que empurrava as letras para baixo (de pt-3 para pt-[2px])
h = h.replace('pt-3 z-10', 'pt-[2px] z-10');

// 2. REORGANIZAÇÃO DOS PLANTÕES (Duas linhas internas + Borda Fina 1px)
const regexPill = /pillsHTML \+= `\s*<div class="w-full h-\[22px\].*?<\/div>\s*<\/div>`;/s;
const novoPill = `pillsHTML += \`
    <div class="w-full h-[25px] min-h-[25px] shrink-0 flex flex-col items-center justify-center rounded-[3px] shadow-sm p-[1px] text-center overflow-hidden \${bg} \${border} mb-[1.5px] last:mb-0 relative text-white tracking-tighter"
         style="\${(item.includes('-E') || item.includes('-DB')) ? 'border: 1px solid #FFD700 !important;' : ''}">
        <div class="\${textClass} w-full truncate text-[9px] font-black leading-[1] mb-[0.5px] px-[2px] uppercase">\${cfg.name}</div>
        
        <div class="flex items-center justify-center gap-[3px] opacity-90 scale-90 leading-none">
            \${inlineShift} \${icon} \${subBadge}
        </div>
    </div>\`;`;

if (h.match(regexPill)) {
    h = h.replace(regexPill, novoPill);
    console.log("✅ SUCESSO: Número topado e espaço ganho!");
}

fs.writeFileSync('index.html', h, 'utf8');
