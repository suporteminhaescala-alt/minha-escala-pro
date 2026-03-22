const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');

// 1. Radar Onisciente (Atualiza a tela sozinho)
let idxR1 = c.indexOf("function setupRealtimeAcordos() {");
let idxR2 = c.indexOf("function setupRealtime() {");

if (idxR1 > -1 && idxR2 > -1) {
    let nR = `function setupRealtimeAcordos() {
            if (!currentUser || typeof _supabase === 'undefined') return;
            _supabase.channel('acordos-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'gp_acordos' },
                    function(payload) {
                        const rec = payload.new ? payload.new.email_receptor : null;
                        const sol = payload.new ? payload.new.email_solicitante : null;
                        
                        if (rec !== currentUser && sol !== currentUser) return;

                        if (payload.eventType === 'INSERT' && rec === currentUser) {
                            if(typeof checkTradeBadge === 'function') checkTradeBadge();
                            showToast('🤝 Nova proposta recebida!', 'success');
                        } else if (payload.eventType === 'UPDATE') {
                            const status = payload.new.status;
                            if (sol === currentUser && status === 'CONTRAPROPOSTA') {
                                showToast('📋 O colega fez uma contraproposta!', 'info');
                            } else if (status === 'ACEITO') {
                                showToast('✅ Acordo fechado pelo colega!', 'success');
                            } else if (status === 'RECUSADO') {
                                showToast('❌ O colega recusou a troca.', 'error');
                            }
                        }

                        const container = document.getElementById('listaAcordos');
                        if (container && container.offsetParent !== null) {
                            carregarAcordos(currentUser);
                        }
                    }
                )
                .subscribe();
        }

        `;
    c = c.substring(0, idxR1) + nR + c.substring(idxR2);
}

// 2. Histórico Blindado (Resolve a tela cega)
let idxC1 = c.indexOf("async function carregarAcordos(userParam) {");
let idxC2 = c.indexOf("async function responderAcordo(id, status) {");

if (idxC1 > -1 && idxC2 > -1) {
    let nC = `async function carregarAcordos(userParam) {
            const _u = userParam || currentUser;
            const container = document.getElementById('listaAcordos');
            if (!container) return;
            
            try {
                // USO DO ILIKE PARA IGNORAR MAIÚSCULAS/MINÚSCULAS E PREVENIR CEGUEIRA
                const [_r1, _r2] = await Promise.all([
                    _supabase.from('gp_acordos').select('*').ilike('email_solicitante', _u),
                    _supabase.from('gp_acordos').select('*').ilike('email_receptor', _u)
                ]);

                if (_r1.error) throw _r1.error;
                if (_r2.error) throw _r2.error;

                const _ids = new Set();
                const _merged = [...(_r1.data||[]), ...(_r2.data||[])].filter(a => {
                    if (_ids.has(a.id)) return false;
                    _ids.add(a.id); return true;
                });
                
                _merged.sort((a,b) => new Date(b.criado_em || b.created_at || 0) - new Date(a.criado_em || a.created_at || 0));

                if (_merged.length === 0) {
                    container.innerHTML = '<div class="py-10 text-slate-500 text-xs font-black uppercase text-center">Nenhum acordo</div>';
                    return;
                }

                container.innerHTML = _merged.map(a => {
                    const isOut = (a.email_solicitante || '').toLowerCase() === _u.toLowerCase();
                    let botoesHTML = '';
                    let st = (a.status || '').toUpperCase();
                    
                    if (!isOut && st === 'PENDENTE') {
                        botoesHTML = '<div class="flex gap-2 mt-4">' +
                            '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'ACEITO\\')" class="flex-1 py-2 bg-emerald-600 rounded-lg text-[10px] text-white font-black uppercase">Aceitar</button>' +
                            '<button onclick="abrirContraproposta(\\'' + a.id + '\\')" class="flex-1 py-2 bg-indigo-600 rounded-lg text-[10px] text-white font-black uppercase">Contraproposta</button>' +
                            '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'RECUSADO\\')" class="flex-1 py-2 bg-slate-700 rounded-lg text-[10px] text-slate-300 font-black uppercase">Recusar</button>' +
                        '</div>';
                    } else if (isOut && st === 'CONTRAPROPOSTA') {
                        botoesHTML = '<div class="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg mt-3">' +
                            '<div class="text-indigo-400 text-[10px] font-black uppercase mb-1">📋 Contraproposta do colega</div>' +
                            '<div class="text-white text-xs font-bold mb-3">Pede o seu Dia ' + (a.dia_resposta || '?') + ' (' + (a.resposta_hospital || '?') + ')</div>' +
                            '<div class="flex gap-2">' +
                                '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'ACEITO\\')" class="flex-1 py-2 bg-emerald-600 rounded-lg text-[10px] text-white font-black uppercase">✅ Fechar Acordo</button>' +
                                '<button onclick="responderAcordo(\\'' + a.id + '\\',\\'RECUSADO\\')" class="flex-1 py-2 bg-slate-700 rounded-lg text-[10px] text-slate-300 font-black uppercase">❌ Recusar</button>' +
                            '</div>' +
                        '</div>';
                    }

                    return '<div class="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-3 text-left">' +
                        '<div class="flex justify-between mb-2">' +
                            '<span class="text-[9px] font-black uppercase ' + (isOut ? 'text-blue-400' : 'text-purple-400') + '">' + (isOut ? '📤 Enviada' : '📥 Recebida') + '</span>' +
                            '<span class="text-[9px] font-bold text-slate-400 uppercase">' + st + '</span>' +
                        '</div>' +
                        '<div class="text-sm font-bold text-white">Dia ' + a.dia_ofertado + ' - ' + (a.hospital_ofertado || '') + '</div>' +
                        '<div class="text-[10px] text-slate-400 mt-1">' + (isOut ? 'Para: ' + a.email_receptor : 'De: ' + a.email_solicitante) + '</div>' +
                        botoesHTML +
                    '</div>';
                }).join('');

            } catch (err) {
                container.innerHTML = '<div class="py-6 text-red-400 text-xs text-center font-bold">ERRO: ' + err.message + '</div>';
            }
        }

        `;
    c = c.substring(0, idxC1) + nC + c.substring(idxC2);
}

// 3. Motor Cruzado (Troca Perfeita)
let idxA1 = c.indexOf("async function responderAcordo(id, status) {");
let idxA2 = c.indexOf("async function abrirContraproposta(id) {");

if (idxA1 > -1 && idxA2 > -1) {
    let nA = `async function responderAcordo(id, status) {
            const container = document.getElementById('listaAcordos');
            if (container) container.innerHTML = '<div class="text-center py-8 text-slate-500"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><br>Processando...</div>';

            await _supabase.from('gp_acordos').update({ status: status }).eq('id', id);

            if (status === 'ACEITO') {
                showToast('⏳ Efetivando troca...', 'info');
                const { data: acordo } = await _supabase.from('gp_acordos').select('*').eq('id', id).maybeSingle();
                
                if (acordo) {
                    const ano = currentDate.getFullYear();
                    const mes = currentDate.getMonth();
                    const monthKey = 'shifts_' + ano + '_' + mes;
                    const configKey = 'CONFIG'; 

                    const emailSol = acordo.email_solicitante;
                    const emailRec = acordo.email_receptor;
                    
                    const diaOrig = String(acordo.dia_ofertado).padStart(2,'0');
                    const hospOrigStr = String(acordo.hospital_ofertado).toLowerCase();
                    const dateOrigKey = ano + '-' + String(mes+1).padStart(2,'0') + '-' + diaOrig;

                    const isContra = !!acordo.dia_resposta;
                    const diaResp = isContra ? String(acordo.dia_resposta).padStart(2,'0') : null;
                    const hospRespStr = isContra ? String(acordo.resposta_hospital).toLowerCase() : null;
                    const dateRespKey = isContra ? ano + '-' + String(mes+1).padStart(2,'0') + '-' + diaResp : null;

                    const getHospId = async (email, hospStr) => {
                        if (!hospStr) return null;
                        const { data } = await _supabase.from('backup_gp').select('dados').eq('id_do_proprietario', email).eq('chave_do_mes', configKey).maybeSingle(); 
                        if (!data || !data.dados) return null;
                        const cfg = data.dados;
                        for (const k in cfg) { if (cfg[k] && cfg[k].name && cfg[k].name.toLowerCase().includes(hospStr)) return k; }
                        return null;
                    };

                    const hospIdSol_Orig = await getHospId(emailSol, hospOrigStr);
                    const hospIdRec_Orig = await getHospId(emailRec, hospOrigStr) || hospIdSol_Orig;

                    let hospIdSol_Resp = null;
                    let hospIdRec_Resp = null;

                    if (isContra) {
                        hospIdRec_Resp = await getHospId(emailRec, hospRespStr);
                        hospIdSol_Resp = await getHospId(emailSol, hospRespStr) || hospIdRec_Resp;
                    }

                    const nameRec = emailRec.split('@')[0].substring(0,6).toUpperCase();
                    const nameSol = emailSol.split('@')[0].substring(0,6).toUpperCase();

                    // === 1. ATUALIZA SOLICITANTE ===
                    const { data: bkSol } = await _supabase.from('backup_gp').select('dados').eq('id_do_proprietario', emailSol).eq('chave_do_mes', monthKey).maybeSingle(); 
                    const shiftsSol = (bkSol && bkSol.dados) ? Object.assign({}, bkSol.dados) : {};
                    
                    if (hospIdSol_Orig) {
                        if (!shiftsSol[dateOrigKey]) shiftsSol[dateOrigKey] = [];
                        shiftsSol[dateOrigKey] = shiftsSol[dateOrigKey].filter(i => !String(i).startsWith(hospIdSol_Orig + '-'));
                        shiftsSol[dateOrigKey].push(hospIdSol_Orig + '-SO-' + (isContra ? diaResp : diaOrig) + '-' + nameRec);
                    }
                    if (isContra && hospIdSol_Resp) {
                        if (!shiftsSol[dateRespKey]) shiftsSol[dateRespKey] = [];
                        shiftsSol[dateRespKey] = shiftsSol[dateRespKey].filter(i => !String(i).startsWith(hospIdSol_Resp + '-'));
                        shiftsSol[dateRespKey].push(hospIdSol_Resp + '-SI-' + diaOrig + '-' + nameRec);
                    }
                    await _supabase.from('backup_gp').upsert({ id_do_proprietario: emailSol, chave_do_mes: monthKey, dados: shiftsSol }, { onConflict: 'id_do_proprietario, chave_do_mes' }); 

                    // === 2. ATUALIZA RECEPTOR ===
                    const { data: bkRec } = await _supabase.from('backup_gp').select('dados').eq('id_do_proprietario', emailRec).eq('chave_do_mes', monthKey).maybeSingle(); 
                    const shiftsRec = (bkRec && bkRec.dados) ? Object.assign({}, bkRec.dados) : {};

                    if (hospIdRec_Orig) {
                        if (!shiftsRec[dateOrigKey]) shiftsRec[dateOrigKey] = [];
                        shiftsRec[dateOrigKey] = shiftsRec[dateOrigKey].filter(i => !String(i).startsWith(hospIdRec_Orig + '-'));
                        shiftsRec[dateOrigKey].push(hospIdRec_Orig + '-SI-' + (isContra ? diaResp : diaOrig) + '-' + nameSol);
                    }
                    if (isContra && hospIdRec_Resp) {
                        if (!shiftsRec[dateRespKey]) shiftsRec[dateRespKey] = [];
                        shiftsRec[dateRespKey] = shiftsRec[dateRespKey].filter(i => !String(i).startsWith(hospIdRec_Resp + '-'));
                        shiftsRec[dateRespKey].push(hospIdRec_Resp + '-SO-' + diaOrig + '-' + nameSol);
                    }
                    await _supabase.from('backup_gp').upsert({ id_do_proprietario: emailRec, chave_do_mes: monthKey, dados: shiftsRec }, { onConflict: 'id_do_proprietario, chave_do_mes' }); 

                    if (currentUser === emailRec) { shifts = shiftsRec; saveData(); }
                    if (currentUser === emailSol) { shifts = shiftsSol; saveData(); }

                    showToast('✅ ACORDO FECHADO!', 'success');
                    if (typeof Swal !== 'undefined') Swal.close();
                    await syncWithCloud(true);
                    renderCalendar();
                    return;
                }
            }
            carregarAcordos();
        }

        `;
    c = c.substring(0, idxA1) + nA + c.substring(idxA2);
}

fs.writeFileSync('index.html', c, 'utf8');
console.log('✅ OK - Aplicativo totalmente curado e Histórico restaurado!');
