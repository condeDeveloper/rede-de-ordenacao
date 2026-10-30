// Os numeros que aparecem no README, presos aqui. Todos sairam de
// `node ferramentas/medidor.js`; nenhum foi digitado de cabeca.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  varrerRedes, conferirPrincipioEmTodas, tabelaDeCusto, tabelaDeConstrucoes, tabelaDeBusca,
} from '../ferramentas/medidor.js';

test('tabela 1: as binarias viram vantagem em 4 fios e disparam em 10', () => {
  const porN = Object.fromEntries(tabelaDeCusto().map((l) => [l.n, l]));
  assert.equal(porN[4].binarias, 16);
  assert.equal(porN[4].permutacoes, 24);
  assert.equal(porN[8].binarias, 256);
  assert.equal(porN[8].permutacoes, 40320);
  assert.equal(porN[10].binarias, 1024);
  assert.equal(porN[10].permutacoes, 3628800);
  assert.ok(porN[10].razao > 3543 && porN[10].razao < 3544);
});

test('tabela 1: em 2 e 3 fios a razao e menor que 1', () => {
  const porN = Object.fromEntries(tabelaDeCusto().map((l) => [l.n, l]));
  assert.equal(porN[2].razao, 0.5);
  assert.equal(porN[3].razao, 0.75);
});

const construcoes = {
  2: { bolha: 1, batcher: 1, conhecido: 1, profBolha: 1, profBatcher: 1, profConhecida: 1 },
  3: { bolha: 3, batcher: 3, conhecido: 3, profBolha: 3, profBatcher: 3, profConhecida: 3 },
  4: { bolha: 6, batcher: 5, conhecido: 5, profBolha: 5, profBatcher: 3, profConhecida: 3 },
  5: { bolha: 10, batcher: 9, conhecido: 9, profBolha: 7, profBatcher: 5, profConhecida: 5 },
  6: { bolha: 15, batcher: 12, conhecido: 12, profBolha: 9, profBatcher: 6, profConhecida: 5 },
  7: { bolha: 21, batcher: 16, conhecido: 16, profBolha: 11, profBatcher: 6, profConhecida: 6 },
  8: { bolha: 28, batcher: 19, conhecido: 19, profBolha: 13, profBatcher: 6, profConhecida: 6 },
};

for (const n of [2, 3, 4, 5, 6, 7, 8]) {
  test(`tabela 2 e 3, n=${n}: tamanhos e profundidades das construcoes`, () => {
    const l = tabelaDeConstrucoes([n])[0];
    assert.equal(l.bolha.tamanho, construcoes[n].bolha);
    assert.equal(l.batcher.tamanho, construcoes[n].batcher);
    assert.equal(l.conhecido, construcoes[n].conhecido);
    assert.equal(l.bolha.profundidade, construcoes[n].profBolha);
    assert.equal(l.batcher.profundidade, construcoes[n].profBatcher);
    assert.equal(l.profundidadeConhecida, construcoes[n].profConhecida);
  });
}

test('tabela 2: Batcher bate o minimo conhecido em todos os 7 tamanhos', () => {
  const linhas = tabelaDeConstrucoes();
  assert.equal(linhas.length, 7);
  assert.equal(linhas.filter((l) => l.batcher.tamanho === l.conhecido).length, 7);
});

test('tabela 3: Batcher erra a profundidade minima em exatamente um tamanho', () => {
  const linhas = tabelaDeConstrucoes();
  const erram = linhas.filter((l) => l.batcher.profundidade !== l.profundidadeConhecida);
  assert.equal(erram.length, 1);
  assert.equal(erram[0].n, 6);
  assert.equal(erram[0].batcher.profundidade - erram[0].profundidadeConhecida, 1);
});

const busca = {
  2: { achado: 1, nos: 3, prof: 1, nosProf: 3 },
  3: { achado: 3, nos: 7, prof: 3, nosProf: 19 },
  4: { achado: 5, nos: 104, prof: 3, nosProf: 157 },
  5: { achado: 9, nos: 229106, prof: 5, nosProf: 262607 },
};

for (const n of [2, 3, 4, 5]) {
  test(`tabela 4, n=${n}: a busca acha ${busca[n].achado} em ${busca[n].nos} nos`, () => {
    const l = tabelaDeBusca([n])[0];
    assert.equal(l.achado, busca[n].achado);
    assert.equal(l.conhecido, busca[n].achado);
    assert.equal(l.nos, busca[n].nos);
    assert.equal(l.profundidadeAchada, busca[n].prof);
    assert.equal(l.nosProfundidade, busca[n].nosProf);
  });
}

test('tabela 4: de 4 para 5 fios a busca custa 2.203 vezes mais nos', () => {
  const razao = busca[5].nos / busca[4].nos;
  assert.ok(razao > 2202 && razao < 2204, `razao medida: ${razao}`);
});

const varreduras = [
  { n: 3, k: 3, total: 27, ordenam: 6 },
  { n: 3, k: 4, total: 81, ordenam: 36 },
  { n: 3, k: 5, total: 243, ordenam: 150 },
  { n: 4, k: 5, total: 7776, ordenam: 12 },
  { n: 4, k: 6, total: 46656, ordenam: 900 },
  { n: 4, k: 7, total: 279936, ordenam: 16800 },
];

for (const v of varreduras) {
  test(`tabela 5: de ${v.total} redes de ${v.k} comparadores sobre ${v.n} fios, ${v.ordenam} ordenam`, () => {
    const r = varrerRedes(v.n, v.k);
    assert.equal(r.total, v.total);
    assert.equal(r.ordenam, v.ordenam);
  });
}

test('tabela 5: so 0,154% das redes de 5 comparadores sobre 4 fios ordenam', () => {
  const r = varrerRedes(4, 5);
  const fatia = (100 * r.ordenam) / r.total;
  assert.ok(fatia > 0.153 && fatia < 0.155, `fatia medida: ${fatia}`);
});

test('tabela 5: nenhuma rede de 4 comparadores ordena 4 fios', () => {
  assert.equal(varrerRedes(4, 4).ordenam, 0);
});

for (const [n, k] of [[3, 3], [3, 4], [4, 5], [4, 6]]) {
  test(`tabela 6: nenhuma divergencia do principio 0-1 em ${n} fios e ${k} comparadores`, () => {
    const r = conferirPrincipioEmTodas(n, k);
    assert.equal(r.discordam, 0);
    assert.equal(r.concordam, r.total);
  });
}

test('tabela 6: 54.540 redes conferidas no total, zero divergencia', () => {
  let total = 0;
  let discordam = 0;
  for (const [n, k] of [[3, 3], [3, 4], [4, 5], [4, 6]]) {
    const r = conferirPrincipioEmTodas(n, k);
    total += r.total;
    discordam += r.discordam;
  }
  assert.equal(total, 54540);
  assert.equal(discordam, 0);
});
