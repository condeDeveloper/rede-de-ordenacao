// Achar a MENOR rede, sem copiar de ninguem. A busca nao sabe quanto deve dar: o
// numero conhecido so aparece depois, na hora de conferir.
//
// O truque que torna isso possivel e o proprio principio 0-1: em vez de carregar
// permutacoes, o estado da busca e o CONJUNTO das saidas binarias ainda possiveis.
// Comeca com as 2^n entradas e cada comparador encolhe o conjunto. A rede ordena
// quando sobram apenas as n+1 saidas ja ordenadas.

import { Rede } from './rede.js';
import { ordenadoEmBits } from './verificador.js';

/** O conjunto inicial: todas as 2^n entradas binarias. */
export function estadoInicial(n) {
  return Array.from({ length: 1 << n }, (_, m) => m);
}

/** Aplica um comparador ao conjunto inteiro e devolve o conjunto sem repetidos. */
export function aplicarComparador(estado, i, j) {
  const vistos = new Set();
  for (const m of estado) {
    const a = (m >> i) & 1;
    const b = (m >> j) & 1;
    vistos.add(a > b ? m ^ ((1 << i) | (1 << j)) : m);
  }
  return Array.from(vistos).sort((x, y) => x - y);
}

/** Chegou ao fim quando toda saida possivel ja esta ordenada. */
export function terminou(estado, n) {
  return estado.every((m) => ordenadoEmBits(m, n));
}

/**
 * Limite inferior simples e honesto: enquanto houver k saidas nao ordenadas, cada
 * comparador tira no maximo metade delas, entao faltam pelo menos log2(k) passos.
 * E uma poda fraca, mas e correta, e e o que deixa n=5 terminar.
 */
export function minimoQueFalta(estado, n) {
  const fora = estado.filter((m) => !ordenadoEmBits(m, n)).length;
  return fora === 0 ? 0 : Math.ceil(Math.log2(fora + 1));
}

/**
 * Busca em profundidade com limite crescente (aprofundamento iterativo). Devolve
 * a primeira rede de tamanho minimo que ordena, e quantos nos custou.
 *
 * @param {number} n fios
 * @param {{teto?: number, primeiroComparadorFixo?: boolean}} opcoes
 * @returns {{rede: Rede|null, tamanho: number, nos: number, limites: number[]}}
 */
export function menorRede(n, opcoes = {}) {
  const teto = opcoes.teto ?? (n * (n - 1)) / 2;
  const pares = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);

  let nos = 0;
  const limites = [];

  for (let limite = 0; limite <= teto; limite++) {
    limites.push(limite);
    const escolhidos = [];

    const anda = (estado, faltam) => {
      nos++;
      if (terminou(estado, n)) return true;
      if (faltam === 0) return false;
      if (minimoQueFalta(estado, n) > faltam) return false;
      for (const [i, j] of pares) {
        const novo = aplicarComparador(estado, i, j);
        // comparador que nao muda nada e desperdicio puro
        if (novo.length === estado.length) continue;
        escolhidos.push([i, j]);
        if (anda(novo, faltam - 1)) return true;
        escolhidos.pop();
      }
      return false;
    };

    if (anda(estadoInicial(n), limite)) {
      return { rede: new Rede(n, escolhidos), tamanho: limite, nos, limites };
    }
  }
  return { rede: null, tamanho: -1, nos, limites };
}

/**
 * A mesma busca, mas minimizando PROFUNDIDADE em vez de tamanho: a cada passo
 * escolhe uma camada inteira de comparadores que nao compartilham fio.
 */
export function menorProfundidade(n, opcoes = {}) {
  const teto = opcoes.teto ?? 2 * n;
  const pares = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);

  // todas as camadas possiveis: subconjuntos de pares dois a dois sem fio comum
  const camadas = [];
  const montar = (desde, usados, atual) => {
    if (atual.length > 0) camadas.push(atual.slice());
    for (let k = desde; k < pares.length; k++) {
      const [i, j] = pares[k];
      if (usados & ((1 << i) | (1 << j))) continue;
      atual.push([i, j]);
      montar(k + 1, usados | (1 << i) | (1 << j), atual);
      atual.pop();
    }
  };
  montar(0, 0, []);

  let nos = 0;
  for (let limite = 0; limite <= teto; limite++) {
    const escolhidas = [];
    const anda = (estado, faltam) => {
      nos++;
      if (terminou(estado, n)) return true;
      if (faltam === 0) return false;
      for (const camada of camadas) {
        let novo = estado;
        for (const [i, j] of camada) novo = aplicarComparador(novo, i, j);
        if (novo.length === estado.length) continue;
        escolhidas.push(camada);
        if (anda(novo, faltam - 1)) return true;
        escolhidas.pop();
      }
      return false;
    };
    if (anda(estadoInicial(n), limite)) {
      return { rede: new Rede(n, escolhidas.flat()), profundidade: limite, nos };
    }
  }
  return { rede: null, profundidade: -1, nos };
}
