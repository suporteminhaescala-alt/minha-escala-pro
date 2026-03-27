const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Localiza o bloco de registro atual
const regexRegister = /<div id="registerForm"[\s\S]*?Voltar para o Login\s*<\/button>\s*<\/div>/;

// Novo bloco com o QR Code integrado
const novoRegister = `<div id="registerForm" class="hidden flex flex-col items-center py-2 text-center animate-fade-in">
    <div class="mb-4">
        <h3 class="text-white font-bold text-lg uppercase tracking-widest">Novo Cadastro</h3>
        <p class="text-slate-400 text-[10px] uppercase tracking-tighter">Exclusivo via Aplicativo Oficial</p>
    </div>
    
    <a href="https://play.google.com/store/apps/details?id=com.minhaescala.pro" target="_blank" class="block active:scale-95 transition-transform mb-5">
        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" 
             alt="Disponível no Google Play" 
             style="width: 180px; height: auto;" class="mx-auto">
    </a>

    <div class="bg-[#0B1121] p-2 rounded-xl border border-slate-700 shadow-inner mb-2">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.minhaescala.pro&bgcolor=162032&color=ffffff&margin=2" alt="QR Code Play Store" class="rounded-lg shadow-lg">
    </div>
    <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-6">Aponte a câmera para baixar</p>

    <button type="button" onclick="toggleAuthMode('login')" class="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold border-b border-transparent hover:border-white transition-all">
        Voltar para o Login
    </button>
</div>`;

if (regexRegister.test(html)) {
    html = html.replace(regexRegister, novoRegister);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("✅ QR Code inserido com sucesso na Segunda Tela!");
} else {
    console.log("❌ Erro: Não foi possível localizar a área de registro.");
}
