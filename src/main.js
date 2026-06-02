const { municipios, distancias } = require("./parser");
const { construirSolucaoGRASP }  = require("./construction");
const { realizarBuscaLocal } = require("./search");


const fs = require("fs");




const p = 5; // número de centros a serem escolhidos
const alpha = 0.2; // parâmetro de aleatoriedade para o GRASP
const iteracoes = 10; // número de iterações do GRASP

function executarGRASP() {
    console.log("Iniciando GRASP para o problema de localização de centros...");

    // 1. Marca o tempo exato antes de começar o GRASP
    const tempoInicio = performance.now();

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


const tempoFim = performance.now();

const tempoTotalSegundos = ((tempoFim - tempoInicio) / 1000).toFixed(3);


    exibirEGravarResultado(melhorSolucaoGlobal, melhorCustoGlobal, tempoTotalSegundos);

}

function exibirEGravarResultado(solucao, custoZ, tempoExecucao) {
    // Monta a lista de cidades textualmente
    let listaCidadesTexto = "";
    solucao.forEach((indice, f) => {
        const cidade = municipios[indice];
        if (cidade) {
            listaCidadesTexto += ` ${f + 1}. ${cidade["Município"]}\n`;
        }
    });

    // Estrutura o esqueleto do relatório igualzinho ao seu print do terminal
    const relatorioFinal = `=========================================
      MELHOR SOLUÇÃO ENCONTRADA         
=========================================
Soma das Menores Distâncias (Z): ${custoZ.toFixed(2)} km
Centros escolhidos para as bases:
${listaCidadesTexto}=========================================
Tempo de Execução: ${tempoExecucao} segundos
=========================================`;

    // 1. Mostra na tela do terminal normalmente
    console.log("\n" + relatorioFinal + "\n");

    // 2. CRIA O ARQUIVO AUTOMATICAMENTE NA SUA PASTA!
    // Ele pega a string 'relatorioFinal' e injeta num arquivo chamado 'resultado.txt'
    fs.writeFileSync("resultado.txt", relatorioFinal, "utf8");
  
}

// Executa o algoritmo completo
executarGRASP();