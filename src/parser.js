const fs = require('fs');
const path = require('path');

// 1. Converte GMS para decimal com limpeza de espaços extras(Graus, Minutos, Segundos)
//formato das coodenadas: "23° 32' 45'' S" ou "23 32 45 S" ou "23°32'45''S"
function gmsParaDecimal(gmsStr) {
    //Se TextoGMS for vazio retorna 0
    if (!gmsStr) return 0;

    //2. TextoLimpo para remover espaços extras
    //Substitui símbolos (° , ' , ") por espaços vazios em TextoLimpo
    const stringLimpa = gmsStr.replace(/\s+/g, '');
    
    //3 Extração dos valores numéricos

    const partes = stringLimpa.replace(/[^\d\s.-]/g, ' ').trim().split(/\s+/);

    const graus = parseFloat(partes[0]); //Graus <- Converte Partes[0] para Número Real

    const minutos = parseFloat(partes[1]) || 0;//Minutos <- Converte Partes[1] para Número Real

    const segundos = parseFloat(partes[2]) || 0;//Segundos <- Converte Partes[2] para Número Real
    
    

    //4. Aplicação da fórmula matemática
    //ValorDecimal <- Absoluto(Graus) + (Minutos / 60) + (Segundos / 3600)

    //CALCULA o tamanho e o comprimento da parte decimal, e se o valor é negativo ou positivo para retornar o resultado final
    let decimal = Math.abs(graus) + (minutos / 60) + (segundos / 3600);


    //se graus for menor que 0, o resultado final é negativo, caso contrário, é positivo
    if (graus < 0) {
    return decimal * -1;
    } else {
    return decimal;
    }



    // DECIMAL -9.66583
}
//# Calcular a distância entre dois pontos usando a fórmula de Haversine
//leva em considerção que a terra é esferica, e calcula a distancia entre dois pontos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em Quilômetros

    // Converte os Graus das duas cidades para Radianos
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
   // Conta matemática da curvatura da esfera (Fórmula de Haversine)
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

//Para i de 0 até total de Municipios Faça
for (let i = 0; i < listaMunicipios.length; i++) {
    //MatrizDistancias[i] <- CriarNovaLinhaVazia()
    matrizDistancias[i] = [];
    //Para j de 0 até total de Municipios Faça
    for (let j = 0; j < listaMunicipios.length; j++) {
        // Se a cidade i for igual à cidade j (a cidade contra ela mesma)
        if (i === j) {

            //Pule para a próxima repetição //
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