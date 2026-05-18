const fs = require('fs');
const path = require('path');

// Converte GMS para decimal com limpeza de espaços extras
function gmsParaDecimal(gmsStr) {
    if (!gmsStr) return 0;
    // Remove espaços entre o sinal de menos e o número para evitar erro no parseFloat
    const stringLimpa = gmsStr.replace(/\s+/g, '');
    
    // Separa os números (Graus, Minutos, Segundos)
    const partes = stringLimpa.replace(/[^\d\s.-]/g, ' ').trim().split(/\s+/);
    const graus = parseFloat(partes[0]);
    const minutos = parseFloat(partes[1]) || 0;
    const segundos = parseFloat(partes[2]) || 0;
    
    let decimal = Math.abs(graus) + (minutos / 60) + (segundos / 3600);
    return graus < 0 ? decimal * -1 : decimal;
}
//calcular a distancia entre dois pontos usando a fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const caminhoArquivo = path.join(__dirname, '../data/Instancia.json');
const conteudoRaw = fs.readFileSync(caminhoArquivo, 'utf8');
const dadosBrutos = JSON.parse(conteudoRaw);

// 1. PRÉ-PROCESSAMENTO: Converte as coordenadas UMA ÚNICA VEZ antes dos loops
const listaMunicipios = (dadosBrutos.data || dadosBrutos).map(m => {
    return {
        ...m,
        latDec: gmsParaDecimal(m.Latitude),
        lonDec: gmsParaDecimal(m.Longitude),
        // Garante que a população seja um número para o cálculo do custo
        "Populacao": parseInt(String(m["Populacao"] || "1").replace(/\./g, ''))
    };
});

const matrizDistancias = [];

// 2. CÁLCULO DA MATRIZ: Agora muito mais rápido sem chamadas de gmsParaDecimal repetidas
for (let i = 0; i < listaMunicipios.length; i++) {
    matrizDistancias[i] = [];
    for (let j = 0; j < listaMunicipios.length; j++) {
        if (i === j) {
            matrizDistancias[i][j] = 0;
            continue;
        }

        matrizDistancias[i][j] = calcularDistancia(
            listaMunicipios[i].latDec, 
            listaMunicipios[i].lonDec, 
            listaMunicipios[j].latDec, 
            listaMunicipios[j].lonDec
        );
    }
}


module.exports = {
    municipios: listaMunicipios,
    distancias: matrizDistancias,
    p: 5,     
    alfa: 0.2 
};

console.log(`Sucesso: ${listaMunicipios.length} municípios processados.`);