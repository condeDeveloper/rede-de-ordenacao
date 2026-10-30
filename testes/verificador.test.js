import test from 'node:test';
import assert from 'node:assert/strict';
import { Rede } from '../src/rede.js';
import {
  ordenaTodasBinarias, ordenaTodasPermutacoes, ordenadoEmBits, custoDosDoisCaminhos,
} from '../src/verificador.js';

test('em bits, ordenado e ter os zeros antes dos uns', () => {
  // bit 0 e o fio 0: 0b110 = fios [0,1,1], que esta ordenado
  assert.equal(ordenadoEmBits(0b110, 3), true);
  assert.equal(ordenadoEmBits(0b000, 3), true);
  assert.equal(ordenadoEmBits(0b111, 3), true);
});

test('em bits, um zero depois de um um nao esta ordenado', () => {
  assert.equal(ordenadoEmBits(0b001, 3), false);
  assert.equal(ordenadoEmBits(0b101, 3), false);
});

test('das 8 entradas de 3 bits, 4 ja estao ordenadas', () => {
  let ordenadas = 0;
  for (let m = 0; m < 8; m++) if (ordenadoEmBits(m, 3)) ordenadas++;
  assert.equal(ordenadas, 4);
});

test('das 2^n entradas, exatamente n+1 ja estao ordenadas', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    let ordenadas = 0;
    for (let m = 0; m < 1 << n; m++) if (ordenadoEmBits(m, n)) ordenadas++;
    assert.equal(ordenadas, n + 1, `n=${n}`);
  }
});

test('a rede vazia nao ordena 2 fios', () => {
  assert.equal(ordenaTodasBinarias(new Rede(2, [])).ordena, false);
});

test('a rede vazia ordena 1 fio', () => {
  assert.equal(ordenaTodasBinarias(new Rede(1, [])).ordena, true);
});

test('um comparador ordena 2 fios pelos dois caminhos', () => {
  const rede = new Rede(2, [[0, 1]]);
  assert.equal(ordenaTodasBinarias(rede).ordena, true);
  assert.equal(ordenaTodasPermutacoes(rede).ordena, true);
});

test('dois comparadores nao bastam para 3 fios, pelos dois caminhos', () => {
  const rede = new Rede(3, [[0, 1], [1, 2]]);
  assert.equal(ordenaTodasBinarias(rede).ordena, false);
  assert.equal(ordenaTodasPermutacoes(rede).ordena, false);
});

test('a rede de 3 comparadores ordena 3 fios pelos dois caminhos', () => {
  const rede = new Rede(3, [[0, 1], [0, 2], [1, 2]]);
  assert.equal(ordenaTodasBinarias(rede).ordena, true);
  assert.equal(ordenaTodasPermutacoes(rede).ordena, true);
});

test('a verificacao por binarias olha 2^n entradas', () => {
  assert.equal(ordenaTodasBinarias(new Rede(5, [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3], [0, 4], [1, 4], [2, 4], [3, 4]])).testadas, 32);
});

test('a verificacao por permutacoes olha n! entradas', () => {
  const rede = new Rede(4, [[0, 1], [2, 3], [0, 2], [1, 3], [1, 2]]);
  assert.equal(ordenaTodasPermutacoes(rede).testadas, 24);
});

test('a verificacao para no primeiro erro e diz qual foi', () => {
  const r = ordenaTodasPermutacoes(new Rede(3, [[0, 1]]));
  assert.equal(r.ordena, false);
  assert.ok(Array.isArray(r.primeiroErro));
  assert.ok(r.testadas < 6);
});

test('a ordem dos comparadores muda o resultado', () => {
  // os mesmos tres pares, em duas ordens: uma ordena e a outra nao
  const ordena = new Rede(3, [[0, 1], [0, 2], [1, 2]]);
  const naoOrdena = new Rede(3, [[0, 1], [1, 2], [0, 2]]);
  assert.equal(ordenaTodasBinarias(ordena).ordena, true);
  assert.equal(ordenaTodasBinarias(naoOrdena).ordena, false);
});

test('das 6 ordens dos tres pares, 4 ordenam e 2 nao', () => {
  const pares = [[0, 1], [0, 2], [1, 2]];
  const ordens = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  const quantas = ordens.filter((o) => ordenaTodasBinarias(new Rede(3, o.map((i) => pares[i]))).ordena).length;
  assert.equal(quantas, 4);
});

test('uma rede de 3 comparadores pode ordenar REPETINDO um par', () => {
  // o par 1-2 nunca e comparado, e mesmo assim a rede ordena os tres fios:
  // depois de 0-1 e 1-2, o segundo 0-1 ja encontra tudo no lugar
  const rede = new Rede(3, [[0, 1], [1, 2], [0, 1]]);
  assert.equal(new Set(rede.comparadores.map(String)).size, 2);
  assert.equal(ordenaTodasBinarias(rede).ordena, true);
  assert.equal(ordenaTodasPermutacoes(rede).ordena, true);
});

test('repetir um comparador nao estraga a rede', () => {
  const rede = new Rede(3, [[0, 1], [0, 1], [0, 2], [1, 2]]);
  assert.equal(ordenaTodasBinarias(rede).ordena, true);
});

test('custo dos dois caminhos: 2^n contra n!', () => {
  assert.deepEqual(custoDosDoisCaminhos(4), { binarias: 16, permutacoes: 24 });
  assert.deepEqual(custoDosDoisCaminhos(8), { binarias: 256, permutacoes: 40320 });
});

test('ate 3 fios as binarias custam MAIS que as permutacoes', () => {
  for (const n of [2, 3]) {
    const c = custoDosDoisCaminhos(n);
    assert.ok(c.binarias > c.permutacoes, `n=${n}`);
  }
});

test('de 4 fios em diante as binarias custam menos', () => {
  for (const n of [4, 5, 6, 7, 8]) {
    const c = custoDosDoisCaminhos(n);
    assert.ok(c.binarias < c.permutacoes, `n=${n}`);
  }
});
