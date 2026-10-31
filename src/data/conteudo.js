/*
  Todo o conteúdo do site mora aqui. Edite à vontade: o código lê deste arquivo.

  Pessoas 1 a 22: cada uma tem
    nome      como vai aparecer, grande
    relacao   só pra você se organizar: não aparece no site (opcional)
    mensagem  o recado, de uma frase a um parágrafo
    fotos     opcional. Deixe [] e a foto é achada pelo nome do arquivo em src/fotos/
              (Bianca.jpeg, Bianca 2.jpeg...). Só preencha para usar outro arquivo.
    foco      opcional. Onde ficam os rostos na foto, para o recorte não cortar ninguém:
              '50% 50%' é o centro; o segundo número é a altura (0% topo, 100% base).
    layout    opcional. Força o layout do capítulo: 'retrato', 'apoiada', 'paisagem',
              'duas' ou 'recado'. Sem ele, o layout é escolhido pela foto e pelo recado.

  A ordem da lista é a ordem no site. Pode reordenar quando quiser.
*/

export const aniversariante = {
  nome: 'Camila',
  apelido: 'mosquito',
  idade: 23,
}

export const abertura = {
  frase: 'Hoje a mulher mais canalha do mundo faz 23 anos.',
  dicaComMouse: 'Tem uma raquete na sua mão.',
  dicaComToque: 'Encosta no mosquito.',
  rolar: 'Role pra baixo',
  // O que aparece cada vez que ela acerta o mosquito com a raquete
  falasDoMosquito: [
    'Deixa o corpo balancar, balancar, balancar',
    'Seu bosta, seu lixo, seu merda',
    'Quero que o TCC EXPLODA',
    'Tá bom, painho. tem mais frase não, rola essa bosta logo',
  ],
}

export const pessoas = [
  { nome: 'Bianca', relacao: 'amiga da faculdade', mensagem: 'Camilete piriguete, espero que o zayn te sorteie. Te amo pra caralho irmã', fotos: [], foco: '50% 45%' },
  { nome: 'Harumi', relacao: 'amiga da faculdade', mensagem: 'Camilette, minha gêmea mais mais! Juntas desde o nascimento e pra sempre, te amooo ', fotos: [], foco: '50% 35%' },
  { nome: 'Rafa', relacao: 'amigo de infância', mensagem: 'Te buscaria em todas as vidas na certeza de que seria imensamente feliz!', fotos: [], foco: '50% 50%' },
  { nome: 'Carla', relacao: 'amigo de infância', mensagem: 'O rapper favorito do seu rapper favorito, pra pessoa que mais me faz rir no planeta, te amo!', fotos: [], foco: '50% 45%' },
  { nome: 'Iza', relacao: 'amigo de infância', mensagem: 'minha alma se ilumina com a sua, porque você é luz!', fotos: [], foco: '50% 68%' },
  { nome: 'Ana Paula', mensagem: '', fotos: [] },
  { nome: 'Pedro Guimarães', mensagem: '', fotos: [] },
  { nome: 'Ana', mensagem: '', fotos: [] },
  { nome: 'Carol', mensagem: '', fotos: [] },
  { nome: 'Fagner ', relacao: '', mensagem: '', fotos: [] },
  { nome: 'Pedro Mesquita', mensagem: '', fotos: [] },
  { nome: 'Laura Maia', mensagem: '', fotos: [] },
  { nome: 'Lara', mensagem: '', fotos: [] },
  { nome: 'Laura Leandra', mensagem: 'Amiga, você entrou de uma forma tão despretensiosa em minha vida, que você não tem noção do quanto foi alguém de apoio em um momento tão difícil pra mim, enquanto pessoas que acreditei estarem comigo me deram as costas. Depois desse momento, eu comecei a te admirar e tive o privilégio de conhecer seu coração que é tão bom e entender o quão admirável ele é. A forma que você leva a vida de um jeito tão especial e alegre marcou minha visão de mundo. Eu torço muito pra que todos os dias você receba 1000x mais luz e felicidade, que os seus planos sejam alcançados e que você possa sempre contar com a esperança e o amor como seus alicerces.  Amo você!!! Sou grata por nosso caminho ter se cruzado e hoje em dia poder te chamar de amiga. Felicidades hoje e acima de tudo, sempre. Um beijo enorme com mtooo carinho!!!! 💖💖💖', fotos: [] },
  { nome: 'Igor', mensagem: 'QUEEN, apenas! É incrível como você consegue levar felicidade por onde passa! Sempre divertida, espontânea e com um jeito só seu de ser. Foi incrível ter me aproximado de você e te conhecer melhor. Te desejo todo o sucesso do mundo, muita felicidade, amor, dinheiro e muita paz. (até porque, trabalhando como UX, cê vai precisar bastante!!!) Continue sendo essa pessoa maravilhosa que você é! Feliz dia! ❤️', fotos: [] },
  { nome: 'Larissa', mensagem: 'Feliz aniversário Camis!!!! É um prazer enorme poder fazer parte de um pedacinho da sua vida e compartilhar momentos com você. Saiba que seu único defeito se chama Gabriel Murta, te adoro e te espero nos próximos comida de boteco que pudermos falar mal até dos copos do lugar 🫶🏻', fotos: [] },
  { nome: 'Gabriela Dias', mensagem: '', fotos: [] },
  { nome: 'João Menezes', mensagem: '', fotos: [] },
  { nome: 'Sara', mensagem: '', fotos: [] },
  { nome: 'Jonny', mensagem: '', fotos: [] },
  { nome: 'Marcos', mensagem: 'Fala, rato! Parabéns pra você, muitas felicidades, saúde, realizações e todas as coisas boas do mundo, que você merece muito. Sinto muita falta de você e de suas brincadeiras no meu dia a dia! Tmj sempre, Ratatouille! 🐭', fotos: [] },
  
  { nome: 'Dalleska', mensagem: '', fotos: [] },
  
]

/*
  A pessoa 23: o final.
    nome        aparece grande, embaixo do mosaico de fotos
    fotos       as fotos são achadas pelo nome: Murtinha.jpeg, Murtinha 2.jpeg, Murtinha 3.jpeg...
                As 4 primeiras vão para o mosaico; as outras aparecem no meio da carta.
    carta       o texto longo. Separe os parágrafos com uma linha em branco.
                Enquanto estiver vazia, o `npm run dev` mostra uma carta de teste; no site, a carta não aparece.
    fraseFinal  a última tela. O mosquito vira o pingo do primeiro "i" dela.
*/
export const namorado = {
  nome: 'Seu amor, o cria mais cria do Vera Cruz',
  fotos: [],
  carta: `Meu amor, eu nunca sei oque escrever para você, primeiro que eu sou burro e mal sei portugues, segundo eu acho tão dificil colocar em palavras oque eu sinto por você, como eu gosto de estar do seu lado e como eu penso em você todas as horas do dia. e eu tenho certeza que eu não estou sozinho nesse sentimento,todo mundo que separou um tempo para te escrever uma mensagem aqui sente a mesma coisa. eu te amo, você é unica e especial`,
  fraseFinal: 'Feliz Aniversario, para a pessoa mais incrivel que tem por ai (tirando eu obviamente, calma la pai).',
}

/*
  A surpresa: depois da frase final, ainda dá para descer mais uma tela (e o contador vira 24 / 23).
    frase   aparece primeiro
    nome    cai de cima, letra por letra
    video   o arquivo do vídeo, dentro de src/videos/ (de preferência .mp4).
            Sem o arquivo, a tela aparece só com a frase e o nome.
*/
export const surpresa = {
  frase: 'Ahhh, pensou que eu era o último? Infelizmente tem uma pessoa que te ama mais…',
  nome: 'Gosuen',
  video: 'Gosuen.mp4',
}
