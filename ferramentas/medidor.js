#!/usr/bin/env node
// O medidor: roda as varreduras e imprime as tabelas que vao para o README.
// Nenhum numero do README e digitado a mao; todos saem daqui.

import { Rede } from '../src/rede.js';
import { ordenaTodasBinarias, conferirPrincipio, custoDosDoisCaminhos } from '../src/verificador.js';
import { bolha, insercao, batcher, MENOR_CONHECIDO, MENOR_PROFUNDIDADE_CONHECIDA } from '../src/construtores.js';
import { menorRede, menorProfundidade } from '../src/busca.js';

const br = (x) => x.toLocaleString('pt-BR');

/**
 * Varre TODAS as redes de k comparadores sobre n fios e conta quantas ordenam.
 * O dominio e finito: sao pares^k sequencias. Varrido inteiro.
 */
export function varrerRedes(n, k) {
  const pares = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);
  const total = pares.length ** k;
  let ordenam = 0;
  const indices = new Array(k).fill(0);

  for (let conta = 0; conta < total; conta++) {
    let x = conta;
    for (let p = 0; p < k; p++) {
      indices[p] = x % pares.length;
      x = Math.floor(x / pares.length);
    }
    const rede = new Rede(n, indices.map((i) => pares[i]));
    if (ordenaTodasBinarias(rede).ordena) ordenam++;
  }
  return { n, k, total, ordenam };
}

/** O principio 0-1 posto a prova em todas as redes de k comparadores. */
export function conferirPrincipioEmTodas(n, k) {
  const pares = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pares.push([i, j]);
  const total = pares.length ** k;
  let concordam = 0;
  let discordam = 0;
  const indices = new Array(k).fill(0);

  for (let conta = 0; conta < total; conta++) {
    let x = conta;
    for (let p = 0; p < k; p++) {
      indices[p] = x % pares.length;
      x = Math.floor(x / pares.length);
    }
    const rede = new Rede(n, indices.map((i) => pares[i]));
    if (conferirPrincipio(rede).concordam) concordam++; else discordam++;
  }
  return { n, k, total, concordam, discordam };
}

export function tabelaDeCusto(ns = [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  return ns.map((n) => {
    const c = custoDosDoisCaminhos(n);
    return { n, ...c, razao: c.permutacoes / c.binarias };
  });
}

export function tabelaDeConstrucoes(ns = [2, 3, 4, 5, 6, 7, 8]) {
  return ns.map((n) => {
    const linha = { n, conhecido: MENOR_CONHECIDO[n], profundidadeConhecida: MENOR_PROFUNDIDADE_CONHECIDA[n] };
    for (const [nome, f] of [['bolha', bolha], ['insercao', insercao], ['batcher', batcher]]) {
      const rede = f(n);
      linha[nome] = {
        tamanho: rede.tamanho,
        profundidade: rede.profundidade(),
        ordena: ordenaTodasBinarias(rede).ordena,
      };
    }
    return linha;
  });
}

export function tabelaDeBusca(ns = [2, 3, 4, 5]) {
  return ns.map((n) => {
    const porTamanho = menorRede(n);
    const porProfundidade = menorProfundidade(n);
    return {
      n,
      achado: porTamanho.tamanho,
      conhecido: MENOR_CONHECIDO[n],
      nos: porTamanho.nos,
      profundidadeAchada: porProfundidade.profundidade,
      profundidadeConhecida: MENOR_PROFUNDIDADE_CONHECIDA[n],
      nosProfundidade: porProfundidade.nos,
    };
  });
}

function imprimir() {
  console.log('\n== Tabela 1: quantas entradas cada caminho precisa olhar ==');
  console.log('  n | binarias (2^n) | permutacoes (n!) | quantas vezes mais');
  for (const l of tabelaDeCusto()) {
    console.log(
      `  ${String(l.n).padStart(2)} | ${br(l.binarias).padStart(14)} | ${br(l.permutacoes).padStart(16)} | ${l.razao.toFixed(1)}x`
    );
  }

  console.log('\n== Tabela 2: as construcoes classicas contra o minimo conhecido ==');
  console.log('  n | bolha | insercao | Batcher | minimo conhecido | Batcher bate?');
  for (const l of tabelaDeConstrucoes()) {
    const bate = l.batcher.tamanho === l.conhecido ? 'sim' : `nao, sobra ${l.batcher.tamanho - l.conhecido}`;
    console.log(
      `  ${l.n} | ${String(l.bolha.tamanho).padStart(5)} | ${String(l.insercao.tamanho).padStart(8)} | ${String(l.batcher.tamanho).padStart(7)} | ${String(l.conhecido).padStart(16)} | ${bate}`
    );
    if (!l.bolha.ordena || !l.insercao.ordena || !l.batcher.ordena) {
      console.error(`CONSTRUCAO QUE NAO ORDENA em n=${l.n}`);
      process.exit(1);
    }
  }

  console.log('\n== Tabela 3: profundidade das construcoes ==');
  console.log('  n | bolha | Batcher | minima conhecida | Batcher bate?');
  for (const l of tabelaDeConstrucoes()) {
    const bate = l.batcher.profundidade === l.profundidadeConhecida ? 'sim' : `nao, sobra ${l.batcher.profundidade - l.profundidadeConhecida}`;
    console.log(
      `  ${l.n} | ${String(l.bolha.profundidade).padStart(5)} | ${String(l.batcher.profundidade).padStart(7)} | ${String(l.profundidadeConhecida).padStart(16)} | ${bate}`
    );
  }

  console.log('\n== Tabela 4: a busca achando a menor rede sozinha ==');
  console.log('  n | menor achada | conhecida | nos | menor profundidade | conhecida | nos');
  for (const l of tabelaDeBusca()) {
    console.log(
      `  ${l.n} | ${String(l.achado).padStart(12)} | ${String(l.conhecido).padStart(9)} | ${br(l.nos).padStart(9)} | ${String(l.profundidadeAchada).padStart(18)} | ${String(l.profundidadeConhecida).padStart(9)} | ${br(l.nosProfundidade)}`
    );
    if (l.achado !== l.conhecido || l.profundidadeAchada !== l.profundidadeConhecida) {
      console.error(`BUSCA DISCORDA DO CONHECIDO em n=${l.n}`);
      process.exit(1);
    }
  }
  console.log('  6 | a busca nao termina em tempo util: fica fora da tabela');

  console.log('\n== Tabela 5: de todas as redes de k comparadores, quantas ordenam ==');
  console.log('  n | k | redes possiveis | ordenam | fatia');
  for (const [n, k] of [[3, 3], [3, 4], [3, 5], [4, 5], [4, 6], [4, 7]]) {
    const r = varrerRedes(n, k);
    console.log(
      `  ${r.n} | ${r.k} | ${br(r.total).padStart(15)} | ${br(r.ordenam).padStart(7)} | ${((100 * r.ordenam) / r.total).toFixed(3)}%`
    );
  }

  console.log('\n== Tabela 6: o principio 0-1 posto a prova rede a rede ==');
  console.log('  n | k | redes testadas | os dois caminhos concordam | discordam');
  let totalDiscordam = 0;
  for (const [n, k] of [[3, 3], [3, 4], [4, 5], [4, 6]]) {
    const r = conferirPrincipioEmTodas(n, k);
    totalDiscordam += r.discordam;
    console.log(
      `  ${r.n} | ${r.k} | ${br(r.total).padStart(14)} | ${br(r.concordam).padStart(26)} | ${r.discordam}`
    );
  }

  console.log('\n== Fechamento ==');
  console.log(`  divergencias do principio 0-1 .......... ${totalDiscordam}`);
  console.log('');
  if (totalDiscordam > 0) {
    console.error('O PRINCIPIO 0-1 FALHOU EM ALGUM CASO: ver tabela 6');
    process.exit(1);
  }
}


if (process.argv[1]?.endsWith('medidor.js')) imprimir();
