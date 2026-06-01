
const meuModulo = require('./parser');

const Municipios = meuModulo.municipios;
const Distancias = meuModulo.distancias;



//escplher 3 centros de distribuição, e calcular o custo total da solução
function calcularCustoTotal(centrosEscolhidos, municipios, matrizDistancias) {
    let custoTotal = 0;//o contador inicializa em 0

    //percorre cada cidade do estado.
    for (let i = 0; i < municipios.length; i++) {
        //cria variavel menodistancia e coloca o valor infinito
        //  para que qualquer distancia calculada seja menor que esse valor inicial
        let menorDistancia = Infinity;
        //loop para encontrar a menor distancia entre a cidade i e os centros escolhidos
        for (let centro of centrosEscolhidos) {
            const d = matrizDistancias[i][centro];
            if (d < menorDistancia) {//se d for menor que a menor distancia atual
                menorDistancia = d;// atualiza a menor distancia
            }  
        }
        
        const populacao = municipios[i]["Populacao"] || 1; //medida de segurança caso  a população seja zero
        //calcula o custo total multiplicando a menor distancia pela população da cidade i, e somando ao custo total acumulado
        custoTotal += menorDistancia * populacao;
    }
    return custoTotal;
}
//custo fixo de instalação dos centros de distribuição
function calcularCustoFixo(centrosEscolhidos, municipios) {
    let custoFixoTotal = 0;
    //percorre os centros escolhidos e soma o custo fixo de instalação de cada centro
    for (let centro of centrosEscolhidos) {
        //pega o custo fixo de instalação do centro, caso não exista, utiliza um valor padrão de 50000-
        const custoInstalacao = municipios[centro]["CustoFixo"] || 50000;
        custoFixoTotal += custoInstalacao;
    }
    //retorna o custo fixo total da solução, que é a soma dos custos de instalação dos centros escolhidos
    return custoFixoTotal;
}

function calcularObjetivo(centrosEscolhidos, municipios, matrizDistancias) {
    //checa se a lista de centros escolhidos está vazia, se estiver, retorna infinito para indicar que a solução é inviável
   if (centrosEscolhidos.length === 0) {
        return Infinity; 
   }
        let custoDistanciaTotal = 0;
        //percorre cada cidade do estado para calcular o custo total da solução,
        //  que é a soma das menores distâncias multiplicadas pela população de cada cidade
        for (let i = 0; i < municipios.length; i++) {
            //finge que a menor distancia é infinito para garantir que qualquer distancia calculada seja menor
            let menorDistancia = Infinity;
            //testa cada centro escolhido para encontrar a menor distancia entre a cidade i e os centros escolhidos
            for (let centro of centrosEscolhidos) {

                //pega a distancia entre a cidade i e o centro escolhido, utilizando a matriz de distancias
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
    //cria uma lista para armazenar os centros escolhidos, inicialmente vazia
    let centrosEscolhidos = [];
    
    //escolhe o primeiro centro de distribuição aleatoriamente entre os municípios disponíveis
    // Math.random escolhe uma posição qualquer entre 0 e 101.
    const primeiroCentro = Math.floor(Math.random() * municipios.length);
    centrosEscolhidos.push(primeiroCentro);

    //enquanto não atingir o número desejado de centros escolhidos (k), continua o processo de construção da solução
    while (centrosEscolhidos.length < k) {
        let candidatos = [];
        //percorre os 101 minicipios para avaliar quais são os candidatos
        //  a serem escolhidos como próximo centro de distribuição
        for (let i = 0; i < municipios.length; i++) {
            // ...SE a cidade 'i' ainda NÃO foi escolhida como centro...
            if (!centrosEscolhidos.includes(i)) {
                // Chamamos a nossa Função Objetivo para calcular qual seria o custo total do estado nesse cenário.
                const custoPotencial = calcularObjetivo([...centrosEscolhidos, i], municipios, distancias);
                // Guardamos na lista de candidatos qual é a cidade (index) e o custo que ela traria.
                candidatos.push({ index: i, custo: custoPotencial });
            }
        }
        //ordenamos a lista de candidatos com base no custo potencial, do menor para o maior
        //  isso é importante para identificar quais são os melhores candidatos (com menor custo) e os piores candidatos (com maior custo)
        candidatos.sort((a, b) => a.custo - b.custo);
       
        //pega o menor custo (cMin) e o maior custo (cMax) da lista de candidatos,
        //  para calcular o limite da Lista Restrita de Candidatos (LRC)
        const cMin = candidatos[0].custo;
        const cMax = candidatos[candidatos.length - 1].custo;

        //se alpha for 0, o limite da LRC será igual ao menor custo (cMin),
        //  ou seja, apenas os melhores candidatos serão considerados para escolha
        const limiteLRC = cMin + alpha * (cMax - cMin);

        //filtra a lista de candidatos para incluir apenas aqueles cujo custo é menor ou igual ao limite da LRC,
        //  criando assim a Lista Restrita de Candidatos (LRC)
        const lrc = candidatos.filter(c => c.custo <= limiteLRC);
    
        //escolhe aleatoriamente um candidato da LRC para ser o próximo centro de distribuição,
        //  garantindo assim um equilíbrio entre a qualidade da solução (custo) e a diversidade (aleatoriedade)
        const escolhido = lrc[Math.floor(Math.random() * lrc.length)];
        centrosEscolhidos.push(escolhido.index);
    }
        //retorna a lista de centros escolhidos, que representa a solução construída pelo GRASP
    return centrosEscolhidos;
}

module.exports = {
    construirSolucaoGRASP,
    calcularObjetivo,
    calcularCustoTotal 
}