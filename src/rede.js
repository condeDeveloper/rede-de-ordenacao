// Uma rede de ordenacao e uma lista FIXA de comparadores. O mesmo programa roda
// para toda entrada: nao ha desvio, nao ha laco que dependa do dado. E por isso
// que ela cabe em hardware, e e por isso que da para varrer todas as entradas.

export class Rede {
  /**
   * @param {number} n quantidade de fios
   * @param {Array<[number,number]>} comparadores pares [i, j] com i < j; cada um
   *   troca os valores se estiverem fora de ordem
   */
  constructor(n, comparadores = []) {
    this.n = n;
    this.comparadores = comparadores.map(([i, j]) => (i < j ? [i, j] : [j, i]));
  }

  get tamanho() {
    return this.comparadores.length;
  }

  mais(i, j) {
    return new Rede(this.n, [...this.comparadores, [i, j]]);
  }

  /** Roda a rede sobre uma copia do vetor e devolve o resultado. */
  aplicar(vetor) {
    const v = vetor.slice();
    for (const [i, j] of this.comparadores) {
      if (v[i] > v[j]) {
        const t = v[i];
        v[i] = v[j];
        v[j] = t;
      }
    }
    return v;
  }

  /**
   * Roda a rede sobre os n bits de `mascara`, sem alocar vetor nenhum. O
   * comparador vira operacao de bit: o menor desce, o maior sobe.
   */
  aplicarBits(mascara) {
    let m = mascara;
    for (const [i, j] of this.comparadores) {
      const a = (m >> i) & 1;
      const b = (m >> j) & 1;
      if (a > b) m ^= (1 << i) | (1 << j);
    }
    return m;
  }

  /**
   * A PROFUNDIDADE: quantas camadas de comparadores rodam em paralelo. Dois
   * comparadores cabem na mesma camada se nao compartilham fio.
   */
  profundidade() {
    const pronto = new Array(this.n).fill(0);
    let maior = 0;
    for (const [i, j] of this.comparadores) {
      const camada = Math.max(pronto[i], pronto[j]) + 1;
      pronto[i] = camada;
      pronto[j] = camada;
      if (camada > maior) maior = camada;
    }
    return maior;
  }

  /** As camadas de fato, uma lista de listas de comparadores. */
  camadas() {
    const pronto = new Array(this.n).fill(0);
    const saida = [];
    for (const [i, j] of this.comparadores) {
      const c = Math.max(pronto[i], pronto[j]);
      pronto[i] = c + 1;
      pronto[j] = c + 1;
      (saida[c] ||= []).push([i, j]);
    }
    return saida;
  }

  toString() {
    return this.comparadores.map(([i, j]) => `${i}-${j}`).join(' ');
  }
}

/**
 * Todas as n! permutacoes de 0..n-1, pelo algoritmo de Heap em forma iterativa.
 * Cada permutacao sai de uma unica troca na anterior, entao o gerador custa O(1)
 * amortizado por item e nao guarda a lista inteira na memoria.
 */
export function* permutacoes(n) {
  const v = Array.from({ length: n }, (_, i) => i);
  const contador = new Array(n).fill(0);
  yield v.slice();
  let i = 0;
  while (i < n) {
    if (contador[i] < i) {
      const troca = i % 2 === 0 ? 0 : contador[i];
      [v[troca], v[i]] = [v[i], v[troca]];
      yield v.slice();
      contador[i]++;
      i = 0;
    } else {
      contador[i] = 0;
      i++;
    }
  }
}

export function fatorial(n) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
