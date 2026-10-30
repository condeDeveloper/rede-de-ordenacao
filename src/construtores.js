// As redes que a literatura ensina a montar. Servem de comparacao com o que a
// busca acha sozinha. Nenhuma delas e aceita de antemao: o verificador roda em
// todas, e e ele quem diz se ordenam.

import { Rede } from './rede.js';

/** Bolha: n(n-1)/2 comparadores. O jeito ingenuo, e o teto de todos os outros. */
export function bolha(n) {
  const c = [];
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < n - 1 - i; j++) c.push([j, j + 1]);
  return new Rede(n, c);
}

/** Insercao: o mesmo tamanho da bolha, com os comparadores em outra ordem. */
export function insercao(n) {
  const c = [];
  for (let i = 1; i < n; i++) for (let j = i; j > 0; j--) c.push([j - 1, j]);
  return new Rede(n, c);
}

/**
 * Par-impar de Batcher (1968), na forma iterativa que vale para qualquer n e nao
 * so para potencia de dois. E a construcao que troca profundidade O(n) por
 * O(log^2 n): para 8 fios sao 6 camadas em vez de 13.
 */
export function batcher(n) {
  const c = [];
  for (let p = 1; p < n; p *= 2) {
    for (let k = p; k >= 1; k /= 2) {
      for (let j = k % p; j + k < n; j += 2 * k) {
        for (let i = 0; i < k && i + j + k < n; i++) {
          if (Math.floor((i + j) / (p * 2)) === Math.floor((i + j + k) / (p * 2))) {
            c.push([i + j, i + j + k]);
          }
        }
      }
    }
  }
  return new Rede(n, c);
}

/** Os tamanhos minimos conhecidos, S(n), para comparar com o que a busca achar. */
export const MENOR_CONHECIDO = { 1: 0, 2: 1, 3: 3, 4: 5, 5: 9, 6: 12, 7: 16, 8: 19 };

/** As profundidades minimas conhecidas. */
export const MENOR_PROFUNDIDADE_CONHECIDA = { 1: 0, 2: 1, 3: 3, 4: 3, 5: 5, 6: 5, 7: 6, 8: 6 };
