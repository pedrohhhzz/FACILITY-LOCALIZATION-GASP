// trazer a matriz

const meuModulo = require('./parser');

const municipios = meuModulo.municipios;
const distancias = meuModulo.distancias;

//função implementa o cálculo do custo de transporte (ou atendimento) total,
//  que é o critério de avaliação para o seu problema
function calcularCustoTotal(centrosEscolhidos, municipios, matrizDistancias) {
    let custoTotal = 0;

    //percorre por todos os 102 municipios de alagoas
    for (let i = 0; i < municipios.length; i++) {
        let menorDistancia = Infinity;

        //para cada município, encontrar a distância para o centro mais próximo
for (let centro of centrosEscolhidos) {
          const d = matrizDistancias[i][centro];
          if (d < menorDistancia) {
            menorDistancia = d;
          }  
}
//
const populacao = municipios[i]["População"] || 1; //existe pelo menoos 1 pessoa no json
custoTotal += menorDistancia * populacao;
}
return custoTotal;
}

function calcularCustoFixo(centrosEscolhidos, municipios) {
    let custoFixoTotal = 0;

    for (let centro of centrosEscolhidos) {

        const custoInstalacao = municipios[centro]["CustoFixo"] || 5000;
        custoFixoTotal += custoInstalacao;
    }

    return custoFixoTotal;
}

function calcularObjetivo(centrosEscolhidos, municipios, matrizDistancias) {
    if (centrosEscolhidos.length === 0) return Infinity; // Evita erro se nenhum centro for passado

    const CUSTO_FIXO_POR_INSTALACAO = 50000; 
    let custoTransporteTotal = 0;

    for (let i = 0; i < municipios.length; i++) {
        let menorDistancia = Infinity;
        
        for (let centro of centrosEscolhidos) {
            const d = matrizDistancias[i][centro];
            if (d < menorDistancia) {
             
             
       menorDistancia = d;
            }
        }
        
        // Pega a população ou define 1 caso não exista no JSON
        const populacao = municipios[i]["População"] || 1; 
        custoTransporteTotal += menorDistancia * populacao;
    }

    let custoFixoTotal = centrosEscolhidos.length * CUSTO_FIXO_POR_INSTALACAO;
    return custoTransporteTotal + custoFixoTotal;
}

//GRASP
function construirSolucaoGRASP(municipios, distancias, k, alpha) {
    //inicialmnete uma solução vazia é criada
    let centrosEscolhidos = [];

    
    const primeiroCentro = Math.floor(Math.random() * municipios.length);
    centrosEscolhidos.push(primeiroCentro);

   //Loop Adaptativo: Adicionar centros até atingir a quantidade k
    while (centrosEscolhidos.length < k) {
        let candidatos = [];

      // Avalia o custo de adicionar cada município que ainda não foi escolhido
        for (let i = 0; i < municipios.length; i++) {
            if (!centrosEscolhidos.includes(i)) {
                
                const custoPotencial = calcularObjetivo([...centrosEscolhidos, i], municipios, distancias);
                candidatos.push({ index: i, custo: custoPotencial });
            }
        }

       // Ordena os candidatos do menor custo para o maior
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