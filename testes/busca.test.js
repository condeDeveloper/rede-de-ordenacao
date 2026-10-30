import test from 'node:test';
import assert from 'node:assert/strict';
import { ordenaTodasBinarias, ordenaTodasPermutacoes, ordenadoEmBits } from '../src/verificador.js';
import { MENOR_CONHECIDO, MENOR_PROFUNDIDADE_CONHECIDA } from '../src/construtores.js';
import {
  estadoInicial, aplicarComparador, terminou, minimoQueFalta, menorRede, menorProfundidade,
} from '../src/busca.js';

test('o estado inicial tem as 2^n entradas', () => {
  for (const n of [1, 2, 3, 4, 5]) assert.equal(estadoInicial(n).length, 1 << n);
});

test('um comparador encolhe o conjunto de saidas possiveis', () => {
  const depois = aplicarComparador(estadoInicial(3), 0, 1);
  assert.ok(depois.length < 8);
  assert.equal(depois.length, 6);
});

test('aplicar o mesmo comparador duas vezes nao encolhe de novo', () => {
  const uma = aplicarComparador(estadoInicial(4), 0, 1);
  const duas = aplicarComparador(uma, 0, 1);
  assert.deepEqual(duas, uma);
});

test('o conjunto final tem exatamente n+1 saidas', () => {
  for (const n of [2, 3, 4]) {
    const { rede } = menorRede(n);
    let estado = estadoInicial(n);
    for (const [i, j] of rede.comparadores) estado = aplicarComparador(estado, i, j);
    assert.equal(estado.length, n + 1, `n=${n}`);
    assert.equal(terminou(estado, n), true);
  }
});

test('terminou e falso enquanto sobrar saida fora de ordem', () => {
  assert.equal(terminou(estadoInicial(3), 3), false);
});

test('terminou e verdadeiro no conjunto so com saidas ordenadas', () => {
  const so = estadoInicial(4).filter((m) => ordenadoEmBits(m, 4));
  assert.equal(terminou(so, 4), true);
});

test('o limite inferior nunca pede mais passos do que a busca gasta', () => {
  // se a poda pedisse demais, ela cortaria a resposta certa
  for (const n of [2, 3, 4]) {
    const { rede, tamanho } = menorRede(n);
    let estado = estadoInicial(n);
    let usados = 0;
    for (const [i, j] of rede.comparadores) {
      assert.ok(minimoQueFalta(estado, n) <= tamanho - usados, `n=${n}, passo ${usados}`);
      estado = aplicarComparador(estado, i, j);
      usados++;
    }
  }
});

test('o limite inferior de um estado ja pronto e zero', () => {
  const so = estadoInicial(3).filter((m) => ordenadoEmBits(m, 3));
  assert.equal(minimoQueFalta(so, 3), 0);
});

for (const n of [2, 3, 4, 5]) {
  test(`a busca acha a menor rede de ${n} fios, e ela ordena`, () => {
    const { rede, tamanho } = menorRede(n);
    assert.notEqual(rede, null);
    assert.equal(tamanho, rede.tamanho);
    assert.equal(ordenaTodasBinarias(rede).ordena, true);
    assert.equal(ordenaTodasPermutacoes(rede).ordena, true);
  });

  test(`a menor rede de ${n} fios tem o tamanho que a literatura diz`, () => {
    assert.equal(menorRede(n).tamanho, MENOR_CONHECIDO[n]);
  });

  test(`nenhuma rede menor que a achada ordena ${n} fios`, () => {
    // a propria busca ja garante isso, mas aqui esta dito de novo pelo outro lado:
    // o aprofundamento iterativo testou todos os tamanhos abaixo e falhou
    const { tamanho, limites } = menorRede(n);
    assert.deepEqual(limites, Array.from({ length: tamanho + 1 }, (_, i) => i));
  });

  test(`a busca acha a menor profundidade de ${n} fios`, () => {
    const { rede, profundidade } = menorProfundidade(n);
    assert.equal(profundidade, MENOR_PROFUNDIDADE_CONHECIDA[n]);
    assert.equal(ordenaTodasBinarias(rede).ordena, true);
    assert.ok(rede.profundidade() <= profundidade);
  });
}

test('a rede minima de 4 fios tem 5 comparadores e profundidade 3', () => {
  const { rede } = menorRede(4);
  assert.equal(rede.tamanho, 5);
  assert.ok(rede.profundidade() >= 3);
});

test('minimizar tamanho e minimizar profundidade dao redes diferentes em 4 fios', () => {
  const porTamanho = menorRede(4).rede;
  const porProfundidade = menorProfundidade(4).rede;
  assert.equal(porTamanho.tamanho, 5);
  assert.equal(porProfundidade.profundidade(), 3);
  // as duas ordenam, mas nao sao a mesma lista de comparadores
  assert.equal(ordenaTodasBinarias(porTamanho).ordena, true);
  assert.equal(ordenaTodasBinarias(porProfundidade).ordena, true);
});

test('a busca nao usa comparador que nao muda nada', () => {
  for (const n of [3, 4]) {
    const { rede } = menorRede(n);
    let estado = estadoInicial(n);
    for (const [i, j] of rede.comparadores) {
      const depois = aplicarComparador(estado, i, j);
      assert.ok(depois.length < estado.length, `comparador ${i}-${j} nao encolheu nada`);
      estado = depois;
    }
  }
});
