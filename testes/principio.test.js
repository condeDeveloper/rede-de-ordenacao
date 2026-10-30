// O principio 0-1 nao e aceito aqui: ele e posto a prova rede a rede, varrendo
// todas as redes de k comparadores e exigindo que os dois caminhos de verificacao
// deem o MESMO veredito. Se discordassem em um caso, o principio cairia.

import test from 'node:test';
import assert from 'node:assert/strict';
import { Rede, permutacoes } from '../src/rede.js';
import { ordenaTodasBinarias, ordenaTodasPermutacoes, conferirPrincipio } from '../src/verificador.js';
import { bolha, batcher } from '../src/construtores.js';

/** Todas as redes de k comparadores sobre n fios, com repeticao permitida. */
function* todasAsRedes(n, k) {
  const pares = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);
  const total = pares.length ** k;
  for (let conta = 0; conta < total; conta++) {
    const escolha = [];
    let x = conta;
    for (let p = 0; p < k; p++) {
      escolha.push(pares[x % pares.length]);
      x = Math.floor(x / pares.length);
    }
    yield new Rede(n, escolha);
  }
}

for (const [n, k] of [[3, 2], [3, 3], [3, 4], [4, 4], [4, 5]]) {
  test(`os dois caminhos concordam em todas as redes de ${k} comparadores sobre ${n} fios`, () => {
    let testadas = 0;
    for (const rede of todasAsRedes(n, k)) {
      testadas++;
      const r = conferirPrincipio(rede);
      assert.equal(r.concordam, true, `discordaram em ${rede}`);
    }
    assert.ok(testadas > 0);
  });
}

test('a verificacao por binarias e MAIS barata so a partir de 4 fios', () => {
  for (const n of [2, 3]) {
    const r = conferirPrincipio(bolha(n));
    assert.ok(r.custoBinarias > r.custoPermutacoes, `n=${n}`);
  }
  for (const n of [4, 5, 6, 7]) {
    const r = conferirPrincipio(bolha(n));
    assert.ok(r.custoBinarias < r.custoPermutacoes, `n=${n}`);
  }
});

test('em 8 fios as binarias custam 256 e as permutacoes 40.320', () => {
  const r = conferirPrincipio(batcher(8));
  assert.equal(r.custoBinarias, 256);
  assert.equal(r.custoPermutacoes, 40320);
});

test('uma rede que falha falha nos dois caminhos, e na mesma hora', () => {
  const quebrada = new Rede(4, [[0, 1], [2, 3], [0, 2]]);
  assert.equal(ordenaTodasBinarias(quebrada).ordena, false);
  assert.equal(ordenaTodasPermutacoes(quebrada).ordena, false);
});

test('a entrada binaria que denuncia a falha vira uma permutacao que tambem falha', () => {
  // o coracao do principio: o contraexemplo binario nao e um caso especial,
  // ele e a sombra de um contraexemplo de verdade
  const quebrada = new Rede(4, [[0, 1], [2, 3], [0, 2]]);
  const bin = ordenaTodasBinarias(quebrada).primeiroErro;
  const comoVetor = [0, 1, 2, 3].map((i) => (bin >> i) & 1);
  const saida = quebrada.aplicar(comoVetor);
  let fora = false;
  for (let i = 1; i < saida.length; i++) if (saida[i - 1] > saida[i]) fora = true;
  assert.equal(fora, true);
});

test('toda permutacao de uma rede que ordena sai ordenada', () => {
  const rede = batcher(5);
  for (const p of permutacoes(5)) {
    assert.deepEqual(rede.aplicar(p), [0, 1, 2, 3, 4]);
  }
});

test('o principio vale tambem quando os valores se repetem', () => {
  // o principio 0-1 fala de 0 e 1, mas a rede tem de ordenar valor repetido
  const rede = batcher(6);
  const entradas = [
    [1, 1, 1, 0, 0, 0], [2, 2, 1, 1, 0, 0], [5, 5, 5, 5, 5, 5], [9, 0, 9, 0, 9, 0],
  ];
  for (const e of entradas) {
    const saida = rede.aplicar(e);
    assert.deepEqual(saida, e.slice().sort((a, b) => a - b), `entrada ${e}`);
  }
});

test('o principio vale para valores negativos e repetidos', () => {
  const rede = batcher(7);
  const e = [-3, 0, -3, 8, 8, -1, 0];
  assert.deepEqual(rede.aplicar(e), e.slice().sort((a, b) => a - b));
});
