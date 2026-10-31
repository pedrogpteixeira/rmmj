export interface Offering { number: string; title: string; description: string; details: readonly string[]; icon: 'bolt' | 'flame' | 'home' | 'building'; }
export const offerings: readonly Offering[] = [
  { number: '01', title: 'Eletricidade', description: 'Acompanhamento na escolha de uma solução de eletricidade adequada ao seu perfil e necessidades.', icon: 'bolt', details: ['Compreensão das condições comerciais', 'Apoio na organização do pedido', 'Esclarecimento de dúvidas durante o processo'] },
  { number: '02', title: 'Gás natural', description: 'Informação clara sobre opções de fornecimento de gás e apoio na adesão.', icon: 'flame', details: ['Esclarecimento das condições aplicáveis', 'Acompanhamento da contratação', 'Contacto com uma equipa dedicada'] },
  { number: '03', title: 'Soluções para casa', description: 'Um ponto de contacto para quem procura orientação sobre eletricidade, gás ou ambos.', icon: 'home', details: ['Atenção às necessidades do agregado', 'Informação sobre eletricidade e gás', 'Acompanhamento próximo'] },
  { number: '04', title: 'Soluções para empresas', description: 'Apoio personalizado para negócios que procuram compreender melhor as suas opções energéticas.', icon: 'building', details: ['Análise inicial das necessidades do negócio', 'Esclarecimento de condições contratuais', 'Acompanhamento comercial dedicado'] },
];
export const steps = [
  { number: '01', title: 'Conversamos', description: 'Partilhe connosco o que procura e o tipo de fornecimento de energia de que necessita.' },
  { number: '02', title: 'Esclarecemos', description: 'Explicamos as opções disponíveis e as condições aplicáveis à sua situação.' },
  { number: '03', title: 'Acompanhamos', description: 'Ajudamos nos passos seguintes e mantemos um ponto de contacto ao longo do processo.' },
] as const;
export const faqs = [
  { question: 'A RMMJ é uma comercializadora de energia?', answer: 'A RMMJ presta apoio comercial e acompanhamento a clientes particulares e empresas. A contratação e o fornecimento dependem das condições da entidade comercializadora.' },
  { question: 'Posso pedir informações sobre eletricidade e gás?', answer: 'Sim. Pode utilizar o formulário para indicar o tipo de fornecimento que procura. A equipa poderá esclarecer as opções e os passos seguintes.' },
  { question: 'A RMMJ acompanha empresas?', answer: 'Sim. A RMMJ trabalha com particulares e empresas, com acompanhamento adaptado às necessidades de cada cliente.' },
  { question: 'Como posso candidatar-me à equipa?', answer: 'Acede à página Recrutamento para conhecer as oportunidades e apresentar uma candidatura. O formulário comercial é exclusivo para pedidos sobre energia.' },
] as const;

// Localidades das equipas conforme apresentação institucional da RMMJ; não equivalem a lojas próprias.
export const teamCities = ['Coimbra', 'Leiria', 'Castelo Branco', 'Beja'] as const;
