import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenaTodasBinarias, ordenaTodasPermutacoes } from '../src/verificador.js';
import { bolha, insercao, batcher, MENOR_CONHECIDO, MENOR_PROFUNDIDADE_CONHECIDA } from '../src/construtores.js';

for (const n of [2, 3, 4, 5, 6, 7, 8]) {
  test(`a bolha ordena ${n} fios`, () => {
    assert.equal(ordenaTodasBinarias(bolha(n)).ordena, true);
  });

  test(`a insercao ordena ${n} fios`, () => {
    assert.equal(ordenaTodasBinarias(insercao(n)).ordena, true);
  });

  test(`Batcher ordena ${n} fios`, () => {
    assert.equal(ordenaTodasBinarias(batcher(n)).ordena, true);
  });
}

test('a bolha tem n(n-1)/2 comparadores', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    assert.equal(bolha(n).tamanho, (n * (n - 1)) / 2, `n=${n}`);
  }
});

test('a insercao tem o mesmo tamanho da bolha', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) assert.equal(insercao(n).tamanho, bolha(n).tamanho);
});

test('a bolha e a insercao tem a mesma profundidade, 2n-3', () => {
  for (const n of [3, 4, 5, 6, 7, 8]) {
    assert.equal(bolha(n).profundidade(), 2 * n - 3, `n=${n}`);
    assert.equal(insercao(n).profundidade(), 2 * n - 3, `n=${n}`);
  }
});

test('Batcher atinge o tamanho minimo conhecido de 2 a 8 fios', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    assert.equal(batcher(n).tamanho, MENOR_CONHECIDO[n], `n=${n}`);
  }
});

test('Batcher atinge a profundidade minima conhecida, menos em 6 fios', () => {
  for (const n of [2, 3, 4, 5, 7, 8]) {
    assert.equal(batcher(n).profundidade(), MENOR_PROFUNDIDADE_CONHECIDA[n], `n=${n}`);
  }
  assert.equal(batcher(6).profundidade(), 6);
  assert.equal(MENOR_PROFUNDIDADE_CONHECIDA[6], 5);
});

test('Batcher economiza 9 comparadores da bolha em 8 fios', () => {
  assert.equal(bolha(8).tamanho - batcher(8).tamanho, 9);
});

test('Batcher corta a profundidade da bolha de 13 para 6 em 8 fios', () => {
  assert.equal(bolha(8).profundidade(), 13);
  assert.equal(batcher(8).profundidade(), 6);
});

test('a bolha e a insercao concordam pelos dois caminhos de verificacao', () => {
  for (const n of [2, 3, 4, 5, 6, 7]) {
    for (const f of [bolha, insercao, batcher]) {
      const rede = f(n);
      assert.equal(ordenaTodasBinarias(rede).ordena, ordenaTodasPermutacoes(rede).ordena, `${f.name} n=${n}`);
    }
  }
});

test('tirar qualquer comparador de Batcher quebra a rede, em 4 e 5 fios', () => {
  // se a rede e minima, nenhum comparador sobra: medida, nao suposta
  for (const n of [4, 5]) {
    const rede = batcher(n);
    for (let k = 0; k < rede.tamanho; k++) {
      const menor = new (rede.constructor)(n, rede.comparadores.filter((_, i) => i !== k));
      assert.equal(ordenaTodasBinarias(menor).ordena, false, `n=${n}, sem o comparador ${k}`);
    }
  }
});

test('o minimo conhecido nunca passa do tamanho da bolha', () => {
  for (const n of [2, 3, 4, 5, 6, 7, 8]) {
    assert.ok(MENOR_CONHECIDO[n] <= bolha(n).tamanho, `n=${n}`);
  }
});
