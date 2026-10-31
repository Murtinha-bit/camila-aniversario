# Prompt para a etapa 3

Copie tudo abaixo da linha e cole numa conversa nova do Claude Code, aberta nesta pasta.

---

Estou fazendo o site de aniversário de 23 anos da minha namorada, Camila (apelido "mosquito"). O projeto está nesta pasta: Vite + React 19 + GSAP/ScrollTrigger + Lenis + vite-imagetools. As etapas 1 (abertura) e 2 (pessoa de exemplo) estão prontas e aprovadas. Agora quero a **etapa 3: a sequência completa das 22 pessoas**.

Antes de começar, leia: `src/data/conteudo.js`, `src/data/fotos.js`, `src/data/campos.js`, `src/components/Pessoa.jsx` e `Pessoa.css`, `src/motion/capitulos.js`, `src/motion/scroll.js`, `src/App.jsx`, `src/styles/tokens.css` e `.taste-skill/direction.json` (a direção de arte sorteada).

## Decisões já tomadas (não mude sem me perguntar)

- **Direção de arte:** "Colour chapters", da skill design-taste-frontend (seed 1491315899). Cada pessoa é um capítulo de tela cheia com um campo de cor chapado. Uma fonte só: Schibsted Grotesk 400/600/800, auto-hospedada via @fontsource. Nada de gradientes, sombras, vidro, cartões ou linhas finas.
- **Paleta A "Pomar"** em `tokens.css`: verde #556B2F com rosa, pistache, tangerina e tons de oliva. O ciclo de campos fica em `campos.js` (rosa, noite, pistache, verde, tangerina, musgo) e alterna claro e escuro. O contraste já foi conferido. Sobre o verde, o texto é sempre claro.
- **Tom divertido. Sem música.** Ela vai abrir no notebook dela, então a prioridade é 1280×720 e 1440×900. Mas tem que funcionar no celular (390px).
- **Abertura (não mexer):** as letras de "Camila 23" caem com física, o "i" chega sem pingo e um mosquito vira o pingo, e o cursor é uma raquete elétrica. A cortina do capítulo 1 empurra as letras para cima.
- **Navegação por capítulo** (`scroll.js`): no computador, cada gesto (trackpad, roda, setas, espaço, Page Down) anda exatamente uma pessoa, numa transição de 1,3s. No celular e no movimento reduzido, é CSS scroll-snap com os marcadores `.encaixe` gerados em `capitulos.js`. Os pontos de parada vêm de `definirPontos()`. Todo layout novo tem que continuar funcionando com isso.
- **Capítulos:** cada um fica preso (pin com `pinSpacing: false`) enquanto o próximo sobe por cima, como uma cortina. O contador fixo "NN / 23" muda quando a cortina passa por baixo dele e assume a cor do texto do capítulo.
- **Conteúdo:**
  - O campo `relacao` **não aparece** no site.
  - As fotos são ligadas pelo nome do arquivo em `src/fotos/` (`Bianca.jpeg`, `Bianca 2.jpeg`). O campo `foco` (object-position) é opcional por pessoa.
  - Pessoa sem foto usa o layout só com o nome (`pessoa--sem-foto`). Pessoa sem mensagem não quebra o site.
  - Hoje há 5 pessoas reais com foto (Bianca, Harumi, Rafa, Carla, Iza) e 17 de exemplo, sem foto.
  - **Não edite os nomes e textos que eu escrevi** em `conteudo.js`.
- **prefers-reduced-motion:** sem pins e sem entradas, com o conteúdo visível. O contador e o encaixe continuam funcionando.

## O que quero na etapa 3

1. **Mostrar as 22 pessoas.** Hoje o `App.jsx` usa `pessoas.slice(0, 1)`. A seção provisória do fim passa a avisar que ali entra a etapa 4 (o final, pessoa 23).
2. **Variar o layout.** Quero 4 ou 5 layouts em rodízio, com a mesma linguagem visual. As ideias já propostas:
   - o retrato (o atual);
   - o nome gigante atravessando por trás da foto, para aproveitar telas largas (hoje, a 1844px, sobra espaço entre o nome e a foto);
   - a foto horizontal larga, para fotos de paisagem como a da Rafa;
   - duas fotos;
   - o recado em destaque com a foto menor.

   O layout deve ser escolhido pela proporção da foto quando fizer sentido, e eu quero poder forçar um com um campo opcional `layout` em `conteudo.js`.
3. **Variar a entrada de cada capítulo:** cortina de cor, janela que abre, nome que atravessa, eco da queda da abertura. Nunca o mesmo efeito em dois capítulos seguidos.
4. **Easter egg (opcional, me pergunte antes):** o mosquito reaparecer em algum capítulo.
5. **Contador:** manter o odômetro que já existe.

## Como trabalhar

- **Antes de programar,** me mostre um resumo dos layouts (pode ser um rascunho visual) e espere eu aprovar.
- **Use as skills e me diga** qual aplicou e o que mudou por causa dela:
  - **design-taste-frontend:** para a direção dos layouts e para evitar cara de site feito por IA.
  - **web-design-guidelines:** no fim da etapa. Busque as regras atualizadas, relate no formato `arquivo:linha` e corrija tudo antes de seguir.
  - **playwright-cli:** para testar no Chrome a 1440×900, a 1280×720 e no iPhone 15 emulado. Simule um gesto de trackpad (eventos de roda com intensidade decrescente) para confirmar que anda uma pessoa por gesto, teste o movimento reduzido e veja o console. Salve as capturas em `capturas/etapa-3/` e me mostre os caminhos.
- **Comandos:** servidor `npm run dev` (porta 5173), lint `npx oxlint src`, build `npx vite build`.
- **Estilo:** código e comentários em português, como nos arquivos que já existem.
