const { municipios, distancias } = require("./parser");
const { construirSolucaoGRASP }  = require("./construction");
const { realizarBuscaLocal } = require("./search");
const fs = require("fs");

const p = 5; // número de centros a serem escolhidos

function executarExperimentoCompleto() {
    console.log("Iniciando os testes comparativos...\n");

    // =========================================================================
    // HEURÍSTICA 1: GULOSA PURA (Alpha = 0, 1 Iteração)
    // =========================================================================
    console.log("Executando Heurística 1 (Gulosa Pura)...");
    
    //captura o uso inicial do cpu
    const cpuInicioH1 = process.cpuUsage();
    
    // Alpha = 0 faz a LRC conter apenas a melhor cidade absoluta de cada passo
    const solucaoInicialH1 = construirSolucaoGRASP(municipios, distancias, p, 0); 
    const resultadoH1 = realizarBuscaLocal(solucaoInicialH1, municipios, distancias);


    //calcula a diferenca de uso da CPU
   const cpuDiferencaH1 = process.cpuUsage(cpuInicioH1);
    //divide 1.000.000 para converter de microssegundos para segundos, e formata com 4 casas decimais
   const tempoCPU_H1 = ((cpuDiferencaH1.user + cpuDiferencaH1.system) / 1000000).toFixed(4);


    // =========================================================================
    // HEURÍSTICA 2: META-HEURÍSTICA GRASP COMPLETA (Alpha = 0.2, 10 Iterações)
    // =========================================================================
    console.log("\nExecutando Heurística 2 (GRASP + Busca Local)...");
    
    //captura o uso inicial do cpu
    const cpuInicioH2 = process.cpuUsage();

    const alpha = 0.2;
    const iteracoes = 10;
    let melhorSolucaoH2 = null;
    let melhorCustoH2 = Infinity;

    for (let i = 0; i < iteracoes; i++) {
        console.log(` -> Iteração ${i + 1} de ${iteracoes}`);   

        const solucaoInicial = construirSolucaoGRASP(municipios, distancias, p, alpha);
        const resultadoBusca = realizarBuscaLocal(solucaoInicial, municipios, distancias);

        if (resultadoBusca.melhorCusto < melhorCustoH2) {
            melhorCustoH2 = resultadoBusca.melhorCusto;
            melhorSolucaoH2 = resultadoBusca.melhorSolucao;
        }
    }

    //Calcula a diferença de uso da CPU
   const cpuDiferencaH2 = process.cpuUsage(cpuInicioH2);
    const tempoCPU_H2 = ((cpuDiferencaH2.user + cpuDiferencaH2.system) / 1000000).toFixed(4);


    // =========================================================================
    // GERANDO O RELATÓRIO COMPARATIVO NO RESULTADO.TXT
    // =========================================================================
    
    // Monta a lista de cidades da Heurística 1
    let cidadesH1 = "";
    resultadoH1.melhorSolucao.forEach((indice, f) => {
        cidadesH1 += `   ${f + 1}. ${municipios[indice]["Município"]}\n`;
    });

    // Monta a lista de cidades da Heurística 2
    let cidadesH2 = "";
    melhorSolucaoH2.forEach((indice, f) => {
        cidadesH2 += `   ${f + 1}. ${municipios[indice]["Município"]}\n`;
    });

    // Calcula a melhoria percentual (GAP) entre uma e outra
    const melhoria = (((resultadoH1.melhorCusto - melhorCustoH2) / resultadoH1.melhorCusto) * 100).toFixed(2);

    const relatorioComparativo = `=======================================================
       RELATÓRIO COMPARATIVO DE DIRETRIZES (TEO)
=======================================================

-------------------------------------------------------
HEURÍSTICA 1: GULOSA PURA (Alpha = 0.0)
-------------------------------------------------------
Soma das Menores Distâncias (Z): ${resultadoH1.melhorCusto.toFixed(2)} km
Tempo de CPU: ${tempoCPU_H1} segundos
Centros Escolhidos:
${cidadesH1}
-------------------------------------------------------
HEURÍSTICA 2: META-HEURÍSTICA GRASP (Alpha = 0.2)
-------------------------------------------------------
Soma das Menores Distâncias (Z): ${melhorCustoH2.toFixed(2)} km
Tempo de CPU: ${tempoCPU_H2} segundos
Centros Escolhidos:
${cidadesH2}
=======================================================
ANÁLISE DE PERFORMANCE:
A Heurística 2 (GRASP) reduziu o custo logístico em ${melhoria}% 
em comparação com a abordagem Gulosa Pura.
=======================================================`;

    console.log("\n" + relatorioComparativo + "\n");
    fs.writeFileSync("resultado.txt", relatorioComparativo, "utf8");
    console.log("✔ Sucesso! O arquivo comparativo com Tempo de CPU 'resultado.txt' foi gerado.\n");
}

executarExperimentoCompleto();