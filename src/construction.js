
const meuModulo = require('./parser');

const Municipios = meuModulo.municipios;
const Distancias = meuModulo.distancias;

function calcularCustoTotal(centrosEscolhidos, municipios, matrizDistancias) {
    let custoTotal = 0;
    for (let i = 0; i < municipios.length; i++) {
        let menorDistancia = Infinity;
        for (let centro of centrosEscolhidos) {
            const d = matrizDistancias[i][centro];
            if (d < menorDistancia) {
                menorDistancia = d;
            }  
        }
        
        const populacao = municipios[i]["Populacao"] || 1; 
        custoTotal += menorDistancia * populacao;
    }
    return custoTotal;
}

function calcularCustoFixo(centrosEscolhidos, municipios) {
    let custoFixoTotal = 0;
    for (let centro of centrosEscolhidos) {
        const custoInstalacao = municipios[centro]["CustoFixo"] || 50000;
        custoFixoTotal += custoInstalacao;
    }
    return custoFixoTotal;
}

function calcularObjetivo(centrosEscolhidos, municipios, matrizDistancias) {
   if (centrosEscolhidos.length === 0) {
        return Infinity; 
   }
        let custoDistanciaTotal = 0;

        for (let i = 0; i < municipios.length; i++) {
            let menorDistancia = Infinity;
            for (let centro of centrosEscolhidos) {
                const d = matrizDistancias[i][centro];
                if (d < menorDistancia) {
                    menorDistancia = d;
                }
            }
           
            const populacao = municipios[i]["Populacao"] || 1;

            custoDistanciaTotal += menorDistancia * populacao;
        
    }
    return custoDistanciaTotal;
}

//GRASP
function construirSolucaoGRASP(municipios, distancias, k, alpha) {
    let centrosEscolhidos = [];
    
    const primeiroCentro = Math.floor(Math.random() * municipios.length);
    centrosEscolhidos.push(primeiroCentro);

    while (centrosEscolhidos.length < k) {
        let candidatos = [];

        for (let i = 0; i < municipios.length; i++) {
            if (!centrosEscolhidos.includes(i)) {
                const custoPotencial = calcularObjetivo([...centrosEscolhidos, i], municipios, distancias);
                candidatos.push({ index: i, custo: custoPotencial });
            }
        }

        candidatos.sort((a, b) => a.custo - b.custo);
       
        const cMin = candidatos[0].custo;
        const cMax = candidatos[candidatos.length - 1].custo;
        const limiteLRC = cMin + alpha * (cMax - cMin);

        const lrc = candidatos.filter(c => c.custo <= limiteLRC);
    
        const escolhido = lrc[Math.floor(Math.random() * lrc.length)];
        centrosEscolhidos.push(escolhido.index);
    }

    return centrosEscolhidos;
}

module.exports = {
    construirSolucaoGRASP,
    calcularObjetivo,
    calcularCustoTotal 
}