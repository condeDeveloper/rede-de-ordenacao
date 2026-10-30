import test from 'node:test';
import assert from 'node:assert/strict';
import { Rede, permutacoes, fatorial } from '../src/rede.js';

test('a rede vazia nao muda nada', () => {
  const r = new Rede(4, []);
  assert.deepEqual(r.aplicar([3, 1, 2, 0]), [3, 1, 2, 0]);
});

test('um comparador troca quando esta fora de ordem', () => {
  assert.deepEqual(new Rede(2, [[0, 1]]).aplicar([5, 2]), [2, 5]);
});

test('um comparador nao troca quando ja esta em ordem', () => {
  assert.deepEqual(new Rede(2, [[0, 1]]).aplicar([2, 5]), [2, 5]);
});

test('o comparador e normalizado para i menor que j', () => {
  assert.deepEqual(new Rede(2, [[1, 0]]).comparadores, [[0, 1]]);
});

test('aplicar nao altera o vetor de entrada', () => {
  const entrada = [3, 1, 2];
  new Rede(3, [[0, 1], [1, 2], [0, 1]]).aplicar(entrada);
  assert.deepEqual(entrada, [3, 1, 2]);
});

test('aplicarBits da o mesmo que aplicar, nas 16 entradas de 4 bits', () => {
  const rede = new Rede(4, [[0, 1], [2, 3], [0, 2], [1, 3], [1, 2]]);
  for (let m = 0; m < 16; m++) {
    const vetor = [0, 1, 2, 3].map((i) => (m >> i) & 1);
    const porVetor = rede.aplicar(vetor);
    const porBits = rede.aplicarBits(m);
    const comoVetor = [0, 1, 2, 3].map((i) => (porBits >> i) & 1);
    assert.deepEqual(comoVetor, porVetor, `entrada ${m}`);
  }
});

test('aplicarBits da o mesmo que aplicar nas 256 entradas de 8 bits', () => {
  const rede = new Rede(8, [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7]]);
  for (let m = 0; m < 256; m++) {
    const vetor = Array.from({ length: 8 }, (_, i) => (m >> i) & 1);
    const porBits = rede.aplicarBits(m);
    const comoVetor = Array.from({ length: 8 }, (_, i) => (porBits >> i) & 1);
    assert.deepEqual(comoVetor, rede.aplicar(vetor), `entrada ${m}`);
  }
});

test('mais() devolve uma rede nova sem mexer na original', () => {
  const a = new Rede(3, [[0, 1]]);
  const b = a.mais(1, 2);
  assert.equal(a.tamanho, 1);
  assert.equal(b.tamanho, 2);
});

test('comparadores sem fio em comum cabem na mesma camada', () => {
  assert.equal(new Rede(4, [[0, 1], [2, 3]]).profundidade(), 1);
});

test('comparadores com fio em comum ocupam camadas diferentes', () => {
  assert.equal(new Rede(3, [[0, 1], [1, 2]]).profundidade(), 2);
});

test('a profundidade da rede vazia e zero', () => {
  assert.equal(new Rede(5, []).profundidade(), 0);
});

test('as camadas somam o total de comparadores', () => {
  const rede = new Rede(4, [[0, 1], [2, 3], [0, 2], [1, 3], [1, 2]]);
  assert.equal(rede.camadas().flat().length, rede.tamanho);
  assert.equal(rede.camadas().length, rede.profundidade());
});

test('dentro de uma camada nenhum fio se repete', () => {
  const rede = new Rede(8, [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3]]);
  for (const camada of rede.camadas()) {
    const fios = camada.flat();
    assert.equal(new Set(fios).size, fios.length);
  }
});

test('permutacoes de 0 e 1 elemento', () => {
  assert.deepEqual([...permutacoes(1)], [[0]]);
});

test('permutacoes de 3 sao 6 e nao se repetem', () => {
  const todas = [...permutacoes(3)].map((p) => p.join(''));
  assert.equal(todas.length, 6);
  assert.equal(new Set(todas).size, 6);
});

test('permutacoes de n sao n! para n ate 7', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7]) {
    assert.equal([...permutacoes(n)].length, fatorial(n));
  }
});

test('toda permutacao gerada contem cada indice uma vez', () => {
  for (const p of permutacoes(5)) {
    assert.deepEqual(p.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4]);
  }
});

test('fatorial de 0 e 1', () => {
  assert.equal(fatorial(0), 1);
  assert.equal(fatorial(1), 1);
});

test('fatorial de 10 e 3.628.800', () => {
  assert.equal(fatorial(10), 3628800);
});
