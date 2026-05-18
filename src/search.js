const { calcularObjetivo } = require('./construction');

function realizarBuscaLocal(solucaoInicial, municipios, matrizDistancias) {

    let melhorSolucao = [...solucaoInicial];

    
    let melhorCusto = calcularObjetivo(
        melhorSolucao,
        municipios,
        matrizDistancias
    );

    
    let houveMelhoria = true; 

    //loop para encontar os melhores centos 
    while (houveMelhoria) {
        houveMelhoria = false; 


        //percorre cada centro na solução atual
        for (let i = 0; i < melhorSolucao.length; i++) {
            
            // Tenta trocar a base 'i' por QUALQUER outra cidade do estado
            for (let j = 0; j < municipios.length; j++) {

                // Validação: Só tentamos trocar por cidades que ainda não são bases
                if (!melhorSolucao.includes(j)) {
                    
                    //realiza a troca e calcula o novo custo
                    let solucaoCandidata = [...melhorSolucao];
                    solucaoCandidata[i] = j;

                    //calcula o custo z
                    let novoCusto = calcularObjetivo(
                        solucaoCandidata,
                        municipios,
                        matrizDistancias
                    );

                   //se o novo custo for menor que o atual , ele atuzaliza
                    if (novoCusto < melhorCusto) {
                        melhorSolucao = solucaoCandidata; 
                        melhorCusto = novoCusto;         
                        houveMelhoria = true;            
                        //fim do loop para tentar trocar a base 'i' por outra cidade, pois já encontramos uma melhoria
                        break;
                    }
                }
            }

         // se ouve melhoria saimos do loop, e reiniciaremos o processo de busca local a partir da nova solução melhorada
            if (houveMelhoria) {
                break;
            }
        }
    }
//retorna com uma nova solução 
    return { melhorSolucao, melhorCusto };
}

module.exports = {
    realizarBuscaLocal
};