/*
  A cor de cada capítulo. A sequência alterna campo claro e campo escuro, para dois vizinhos
  nunca terem a mesma luminosidade. A abertura é verde, então a pessoa 1 começa no rosa.
*/
export const CICLO_DE_CAMPOS = ['rosa', 'noite', 'pistache', 'verde', 'tangerina', 'musgo']

export const campoDe = (indice) => CICLO_DE_CAMPOS[indice % CICLO_DE_CAMPOS.length]
