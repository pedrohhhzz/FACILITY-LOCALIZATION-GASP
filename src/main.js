const { municipios, distancias } = require("./parser");
const { construirSolucaoGRASP }  = require("./construction");
const { realizarBuscaLocal } = require("./search");


const p = 5; // número de centros a serem escolhidos
const alpha = 0.2; // parâmetro de aleatoriedade para o GRASP
const iteracoes = 10; // número de iterações do GRASP

function executarGRASP() {
    console.log("Iniciando GRASP para o problema de localização de centros...");

    let melhorSolucaoGlobal = null;
    let melhorCustoGlobal = Infinity;

    for (let i = 0; i < iteracoes; i++) {
        console.log(`Iteração ${i + 1} de ${iteracoes}`);   

        const solucaoInicial = construirSolucaoGRASP(municipios, distancias, p, alpha);

        const resultadoBusca = realizarBuscaLocal(solucaoInicial, municipios, distancias);

        if (resultadoBusca.melhorCusto < melhorCustoGlobal) {
            melhorCustoGlobal = resultadoBusca.melhorCusto;
            melhorSolucaoGlobal = resultadoBusca.melhorSolucao;
            console.log(`Nova melhor solução encontrada com custo: ${melhorCustoGlobal.toFixed(2)}`);
        }else {
    console.log("ok");
        }
    
}
    exibirResultado(melhorSolucaoGlobal, melhorCustoGlobal);

}

function exibirResultado(solucao, custoZ) {
    console.log("\n=========================================");
    console.log("      MELHOR SOLUÇÃO ENCONTRADA         ");
    console.log("=========================================");
    console.log(`Soma das Menores Distâncias (Z): ${custoZ.toFixed(2)} km`);
    console.log("Centros escolhidos para as bases:");

    solucao.forEach((indice, f) => {
        const cidade = municipios[indice];
        if (cidade) {
            console.log(` ${f + 1}. ${cidade["Município"]}`);
        }
    });
    console.log("=========================================\n");
}

executarGRASP();