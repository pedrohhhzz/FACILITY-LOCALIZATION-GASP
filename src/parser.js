//A lista de coordenadas dos municípios.
//As populações (que geralmente definem o "peso" ou a demanda).
//A quantidade de equipamentos (p) que devem ser instalados.


const fs = require('fs');
const path = require('path');

//que converte coordenadas no formato GMS (Graus, Minutos, Segundos) para decimal
function gmsParaDecimal(gmsStr) {
    if (!gmsStr) return 0;
    // Remove símbolos e separa os números (Graus, Minutos, Segundos)
    const partes = gmsStr.replace(/[^\d\s-]/g, ' ').trim().split(/\s+/);
    const graus = parseFloat(partes[0]);
    const minutos = parseFloat(partes[1]) || 0;
    const segundos = parseFloat(partes[2]) || 0;
    
    let decimal = Math.abs(graus) + (minutos / 60) + (segundos / 3600);
    return graus < 0 ? decimal * -1 : decimal;
}

//função calcular distancia entre dois pontos geográficos usando a fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em quilômetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

//para ler o arquivo JSON contendo os dados dos municípios
const caminhoArquivo = path.join(__dirname, '../data/Instancia.json');
const conteudoRaw = fs.readFileSync(caminhoArquivo, 'utf8');

//converter objetos JSON em estruturas de dados utilizáveis no JavaScript
const dadosBrutos = JSON.parse(conteudoRaw);


const listaMunicipios = dadosBrutos.data || dadosBrutos; 

const matrizDistancias = [];

//loop alinahado com o número de municípios para calcular as distâncias entre cada par de municípios usando a função calcularDistancia e armazenar os resultados em uma matriz de distâncias.
for (let i = 0; i < listaMunicipios.length; i++) {
    matrizDistancias[i] = [];
    
    for (let j = 0; j < listaMunicipios.length; j++) {
        // Se for o mesmo município, a distância é zero
        if (i === j) {
            matrizDistancias[i][j] = 0;
            continue;
        }

       // Converte as coordenadas de GMS para decimal
        const latI = gmsParaDecimal(listaMunicipios[i].Latitude);
        const lonI = gmsParaDecimal(listaMunicipios[i].Longitude);
        const latJ = gmsParaDecimal(listaMunicipios[j].Latitude);
        const lonJ = gmsParaDecimal(listaMunicipios[j].Longitude);

        // Calcula e armazena na matriz
        matrizDistancias[i][j] = calcularDistancia(latI, lonI, latJ, lonJ);
    }
}

//exporta dados processados para serem utilizados em outras partes do projeto, como o algoritmo GRASP.
module.exports = {
    municipios: listaMunicipios,
    distancias: matrizDistancias,
    p: 5,     // Número de equipamentos a instalar (Exemplo)
    alfa: 0.2  // Parâmetro de aleatoriedade do GRASP
};

// Log de sucesso para teste
console.log(`finalizado: ${listaMunicipios.length} municipios processados.`);
console.log(`Exemplo de distância entre index 0 e 1: ${matrizDistancias[0][1].toFixed(2)} km`);