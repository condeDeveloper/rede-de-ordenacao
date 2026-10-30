# Redes de ordenação e o princípio 0-1

Uma rede de ordenação é uma lista **fixa** de comparadores: o mesmo programa roda
para toda entrada, sem desvio e sem laço que dependa do dado. É por isso que ela
cabe em hardware — e é por isso que dá para varrer todas as entradas e **provar**
que ela ordena, em vez de testar e torcer.

O princípio 0-1 diz que basta conferir as `2^n` entradas de zeros e uns para saber
se a rede ordena qualquer entrada. Este repositório não aceita isso de antemão:
roda os **dois** caminhos, as `2^n` binárias e as `n!` permutações, rede a rede, e
mede se eles alguma vez discordam. Node puro, sem dependência nenhuma.

## Os quatro achados

1. **O princípio 0-1 foi conferido rede a rede em 54.540 redes, sem uma única
   divergência.** São todas as redes de 3 e 4 comparadores sobre 3 fios e de 5 e 6
   comparadores sobre 4 fios. Nas 54.540, o veredito das binárias e o das
   permutações foi sempre o mesmo.
2. **A construção de Batcher atinge o tamanho mínimo conhecido nos sete tamanhos
   medidos — mas erra a profundidade em exatamente um.** Para 2 a 8 fios ela dá 1,
   3, 5, 9, 12, 16 e 19 comparadores, que são os ótimos. Em profundidade ela também
   acerta, menos em **6 fios**, onde gasta 6 camadas e o mínimo conhecido é 5.
3. **De todas as 7.776 redes de 5 comparadores sobre 4 fios, só 12 ordenam.** São
   0,154%. Com 4 comparadores, nenhuma das 1.296 ordena: 5 é mesmo o piso.
4. **A economia do princípio 0-1 só começa em 4 fios.** Em 2 e 3 fios as binárias
   custam *mais* que as permutações (4 contra 2, e 8 contra 6). A vantagem vira em
   4 fios e dispara: em 10 fios são 1.024 entradas contra 3.628.800.

## As tabelas

Tudo abaixo sai de `node ferramentas/medidor.js`, e está preso em
`testes/medidas.test.js`.

### Quantas entradas cada caminho precisa olhar

| n | binárias (2ⁿ) | permutações (n!) | quantas vezes mais |
|---|---|---|---|
| 2 | 4 | 2 | 0,5x |
| 3 | 8 | 6 | 0,8x |
| 4 | 16 | 24 | 1,5x |
| 5 | 32 | 120 | 3,8x |
| 6 | 64 | 720 | 11,3x |
| 8 | 256 | 40.320 | 157,5x |
| 10 | 1.024 | 3.628.800 | 3.543,8x |

### As construções clássicas contra o mínimo conhecido

| n | bolha | inserção | Batcher | mínimo conhecido |
|---|---|---|---|---|
| 4 | 6 | 6 | **5** | 5 |
| 5 | 10 | 10 | **9** | 9 |
| 6 | 15 | 15 | **12** | 12 |
| 7 | 21 | 21 | **16** | 16 |
| 8 | 28 | 28 | **19** | 19 |

### Profundidade

| n | bolha | Batcher | mínima conhecida | Batcher bate? |
|---|---|---|---|---|
| 4 | 5 | 3 | 3 | sim |
| 5 | 7 | 5 | 5 | sim |
| 6 | 9 | 6 | 5 | **não, sobra 1** |
| 7 | 11 | 6 | 6 | sim |
| 8 | 13 | 6 | 6 | sim |

Em 8 fios, Batcher troca 28 comparadores por 19 e 13 camadas por 6.

### A busca achando a menor rede sozinha

A busca não sabe quanto deve dar: o número conhecido só entra na hora de conferir.

| n | menor achada | conhecida | nós | menor profundidade | conhecida | nós |
|---|---|---|---|---|---|---|
| 2 | 1 | 1 | 3 | 1 | 1 | 3 |
| 3 | 3 | 3 | 7 | 3 | 3 | 19 |
| 4 | 5 | 5 | 104 | 3 | 3 | 157 |
| 5 | 9 | 9 | 229.106 | 5 | 5 | 262.607 |

De 4 para 5 fios a busca custa **2.203 vezes** mais nós. Em 6 fios ela não termina
em tempo útil, e por isso **não tem linha aqui**.

### De todas as redes de k comparadores, quantas ordenam

| n | k | redes possíveis | ordenam | fatia |
|---|---|---|---|---|
| 3 | 3 | 27 | 6 | 22,222% |
| 3 | 4 | 81 | 36 | 44,444% |
| 3 | 5 | 243 | 150 | 61,728% |
| 4 | 5 | 7.776 | 12 | 0,154% |
| 4 | 6 | 46.656 | 900 | 1,929% |
| 4 | 7 | 279.936 | 16.800 | 6,001% |

### O princípio 0-1 posto à prova

| n | k | redes testadas | concordam | discordam |
|---|---|---|---|---|
| 3 | 3 | 27 | 27 | 0 |
| 3 | 4 | 81 | 81 | 0 |
| 4 | 5 | 7.776 | 7.776 | 0 |
| 4 | 6 | 46.656 | 46.656 | 0 |

## O que as medidas me corrigiram

- **Escrevi num teste que a rede `1-2, 0-2, 0-1` não ordena três fios. Ela
  ordena.** Fui medir as seis ordens possíveis dos três pares: **quatro ordenam e
  duas não**. A que de fato falha é `0-1, 1-2, 0-2`. Eu tinha escolhido a ordem
  "invertida" por achar que seria a errada, e inverter não era o que importava.
- **Achei que ordenar três fios com três comparadores exigisse os três pares
  distintos. Não exige.** Duas das seis redes que ordenam **repetem** um par:
  `0-1, 1-2, 0-1` ordena, e o par `0-2` nunca é comparado. Depois de `0-1` e `1-2`,
  o maior já está no fim e o segundo `0-1` termina o serviço. Foi a varredura das
  27 que me obrigou a olhar isso, porque a conta não fechava com as 4 permutações.
- **Escrevi uma rede bitônica e ela não ordenava nada acima de 3 fios.** O motivo
  não era a construção: minha classe `Rede` normaliza todo comparador para `i < j`,
  e a bitônica precisa de comparadores com **direção**, metade deles ordenando ao
  contrário. Tirei a bitônica em vez de inchar a classe, porque o projeto é sobre o
  princípio 0-1 e sobre a busca.

## Como está organizado

```
src/rede.js           a rede, a aplicação em vetor e em bits, camadas e profundidade
src/verificador.js    os dois caminhos: 2^n binárias e n! permutações
src/construtores.js   bolha, inserção e Batcher, mais os mínimos conhecidos
src/busca.js          a menor rede achada do zero, por aprofundamento iterativo
ferramentas/medidor.js  roda as varreduras e imprime as tabelas acima
testes/               137 testes
```

A busca usa o próprio princípio 0-1 como estrutura: o estado não é uma lista de
permutações, é o **conjunto das saídas binárias ainda possíveis**. Começa com as
`2^n` e cada comparador encolhe o conjunto; a rede está pronta quando sobram apenas
as `n+1` saídas já ordenadas.

## Rodar

```bash
node --test testes/*.test.js   # a bateria inteira
node ferramentas/medidor.js    # recalcula todas as tabelas deste README
```

Sem `npm install`: não há dependência. Precisa de Node 18 ou mais novo.

## Licença

MIT.
