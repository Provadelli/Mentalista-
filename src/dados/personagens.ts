// Avatares dos jogadores (personagens de O Mentalista).
// Coloque as fotos em public/avatars/<id>.webp (256x256). Sem foto, a interface mostra as iniciais.
export type Personagem = { id: string; nome: string; papel: string }

export const PERSONAGENS: Personagem[] = [
  { id: 'jane', nome: 'Patrick Jane', papel: 'Consultor' },
  { id: 'lisbon', nome: 'Teresa Lisbon', papel: 'Agente sênior' },
  { id: 'cho', nome: 'Kimball Cho', papel: 'Agente' },
  { id: 'rigsby', nome: 'Wayne Rigsby', papel: 'Agente' },
  { id: 'vanpelt', nome: 'Grace Van Pelt', papel: 'Agente' },
  { id: 'minelli', nome: 'Virgil Minelli', papel: 'Diretor do CBI' },
  { id: 'fischer', nome: 'Kim Fischer', papel: 'Agente do FBI' },
  { id: 'abbott', nome: 'Dennis Abbott', papel: 'Agente do FBI' },
  { id: 'lorelei', nome: 'Lorelei Martins', papel: 'Enigma' },
  { id: 'stiles', nome: 'Bret Stiles', papel: 'Visionary Center' },
]

export const iniciais = (nome: string) =>
  nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
