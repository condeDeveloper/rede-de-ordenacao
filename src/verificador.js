// Duas maneiras de responder "esta rede ordena?". Elas nao compartilham codigo e
// nao sabem uma da outra. Se discordarem, uma esta errada, e e ai que mora a
// resposta interessante.

import { permutacoes, fatorial } from './rede.js';

/**
 * Caminho 1, o caro e obvio: rodar a rede sobre TODAS as n! permutacoes e
 * conferir que cada uma sai ordenada.
 * @returns {{ordena: boolean, testadas: number, primeiroErro: number[]|null}}
 */
export function ordenaTodasPermutacoes(rede) {
  let testadas = 0;
  for (const p of permutacoes(rede.n)) {
    testadas++;
    const saida = rede.aplicar(p);
    for (let i = 1; i < saida.length; i++) {
      if (saida[i - 1] > saida[i]) return { ordena: false, testadas, primeiroErro: p };
    }
  }
  return { ordena: true, testadas, primeiroErro: null };
}

/**
 * Caminho 2, o barato: rodar a rede so sobre as 2^n entradas de ZEROS E UNS.
 *
 * O principio 0-1 diz que isso basta. A razao e que um comparador comuta com
 * qualquer funcao monotona f: aplicar f na entrada e rodar a rede da o mesmo que
 * rodar a rede e aplicar f. Se a rede errasse alguma entrada, daria para escolher
 * um limiar e transformar o erro num erro binario.
 */
export function ordenaTodasBinarias(rede) {
  const total = 1 << rede.n;
  let testadas = 0;
  for (let m = 0; m < total; m++) {
    testadas++;
    const saida = rede.aplicarBits(m);
    if (!ordenadoEmBits(saida, rede.n)) return { ordena: false, testadas, primeiroErro: m };
  }
  return { ordena: true, testadas, primeiroErro: null };
}

/** Em bits, "ordenado" e ter todos os zeros antes de todos os uns. */
export function ordenadoEmBits(m, n) {
  let viuUm = false;
  for (let i = 0; i < n; i++) {
    const bit = (m >> i) & 1;
    if (bit === 1) viuUm = true;
    else if (viuUm) return false;
  }
  return true;
}

/** Quantas entradas cada caminho precisa olhar, no pior caso. */
export function custoDosDoisCaminhos(n) {
  return { binarias: 2 ** n, permutacoes: fatorial(n) };
}

/**
 * Roda os dois caminhos e devolve se eles concordaram. E o teste do proprio
 * principio 0-1, feito rede a rede em vez de aceito de antemao.
 */
export function conferirPrincipio(rede) {
  const porBinarias = ordenaTodasBinarias(rede);
  const porPermutacoes = ordenaTodasPermutacoes(rede);
  return {
    binarias: porBinarias.ordena,
    permutacoes: porPermutacoes.ordena,
    concordam: porBinarias.ordena === porPermutacoes.ordena,
    custoBinarias: porBinarias.testadas,
    custoPermutacoes: porPermutacoes.testadas,
  };
}
