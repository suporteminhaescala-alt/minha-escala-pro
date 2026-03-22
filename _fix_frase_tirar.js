const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

function replaceFunc(code, funcName, newBody) {
    let start = code.indexOf("async function " + funcName + "(");
    if (start === -1) { start = code.indexOf("function " + funcName + "("); if (start === -1) return code; }
    let i = code.indexOf("{", start);
    let braceCount = 1; i++;
    while(braceCount > 0 && i < code.length) {
        if (code[i] === "{") braceCount++;
        if (code[i] === "}") braceCount--;
        i++;
    }
    let signature = code.substring(start, code.indexOf("{", start));
    return code.substring(0, start) + signature + newBody + code.substring(i);
}

const novaFuncao = `{
    const _u = userParam || currentUser;
    if (!_u) { console.warn('carregarAcordos: usuario nulo'); return; }
    const container = document.getElementById('listaAcordos');
    if (!container) { console.warn('carregarAcordos: container nulo'); return; }
    const [_r1, _r2] = await Promise.all([
        _supabase.from('gp_acordos').select('*').eq('email_solicitante', _u),
        _supabase.from('gp_acordos').select('*').eq('email_receptor', _u)
    ]);
    if (_r1.error || _r2.error) {
        const msg = (_r1.error || _r2.error).message;
        container.innerHTML = '<div class="py-6 text-red-400 text-xs text-center font-bold">ERRO SUPABASE: ' + msg + '</div>';
        return;
    }
    const _ids = new Set();
    const _merged = [...(_r1.data||[]), ...(_r2.data||[])].filter(a => {
        if (_ids.has(a.id)) return false;
        _ids.add(a.id); return true;
    });
    _merged.sort((a,b) => new Date(b.criado_em||0) - new Date(a.criado_em||0));
    const data = _merged.length > 0 ? _merged : null;

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="py-10 text-slate-500 text-xs font-black uppercase text-center">Nenhum acordo</div>';
        return;
    }
    container.innerHTML = data.map(a => {
        const isOut = a.email_solicitante === _u;
        let botoesHTML = '';
        
        if (!isOut && a.status === 'PENDENTE') {
            botoesHTML = '<div class="flex gap-2 mt-4">' +
                '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'ACEITO\\')" class="flex-1 py-2 bg-emerald-600 rounded-lg text-[10px] text-white font-black uppercase">Aceitar</button>' +
                '<button onclick="abrirContraproposta(\\'' + a.id + '\\')" class="flex-1 py-2 bg-indigo-600 rounded-lg text-[10px] text-white font-black uppercase">Contraproposta</button>' +
                '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'RECUSADO\\')" class="flex-1 py-2 bg-slate-700 rounded-lg text-[10px] text-slate-300 font-black uppercase">Recusar</button>' +
            '</div>';
        } else if (isOut && a.status === 'CONTRAPROPOSTA') {
            const nomeColega = a.email_receptor ? a.email_receptor.split('@')[0].toUpperCase() : 'COLEGA';
            botoesHTML = '<div class="bg-indigo-900/40 border border-indigo-500/50 p-3 rounded-xl mt-3 shadow-inner">' +
                '<div class="text-indigo-400 text-[10px] font-black uppercase mb-2 flex items-center gap-1"><i class="fas fa-handshake"></i> CONTRAPROPOSTA DE ' + nomeColega + '</div>' +
                '<div class="text-slate-200 text-xs mb-3 leading-relaxed">✅ O colega aceita o seu <strong class="text-white">Dia ' + a.dia_ofertado + ' (' + (a.hospital_ofertado || '?') + ')</strong> se você tirar o <strong class="text-emerald-400">Dia ' + (a.dia_resposta || '?') + ' (' + (a.resposta_hospital || '?').toUpperCase() + ')</strong> dele(a)!</div>' +
                '<div class="flex gap-2">' +
                    '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'ACEITO\\')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-[10px] text-white font-black uppercase transition-colors shadow-lg">✅ Fechar Acordo</button>' +
                    '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'RECUSADO\\')" class="flex-1 py-2.5 bg-slate-700 hover:bg-red-600/80 rounded-lg text-[10px] text-slate-300 hover:text-white font-black uppercase transition-colors">❌ Recusar</button>' +
                '</div>' +
            '</div>';
        }

        return '<div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-3 text-left">' +
            '<div class="flex justify-between mb-2">' +
                '<span class="text-[9px] font-black uppercase ' + (isOut ? 'text-blue-400' : 'text-purple-400') + '">' + (isOut ? '📤 Enviada' : '📥 Recebida') + '</span>' +
                '<span class="text-[9px] font-bold text-slate-400 uppercase">' + a.status + '</span>' +
            '</div>' +
            '<div class="text-sm font-bold text-white">Dia ' + a.dia_ofertado + ' - ' + (a.hospital_ofertado || '') + '</div>' +
            '<div class="text-[10px] text-slate-400 mt-1">' + (isOut ? 'Para: ' + a.email_receptor : 'De: ' + a.email_solicitante) + '</div>' +
            botoesHTML +
        '</div>';
    }).join('');
}`;

html = replaceFunc(html, "carregarAcordos", novaFuncao);

fs.writeFileSync('index.html', html, 'utf8');
console.log("✅ SUCESSO! A FRASE PERFEITA FOI INJETADA!");
