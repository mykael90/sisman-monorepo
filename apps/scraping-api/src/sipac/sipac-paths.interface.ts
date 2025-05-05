/**
 * Define a estrutura base comum para todas as opções.
 */
interface SipacOptionsBase {
  url: string;
  parser: string;
  //parser é relativo ao script que vai ler o html e transformar em JSON depende de qual página está lendo
  // queryParams não é definido aqui ainda
}

/**
 * Define as opções específicas para requisições GET.
 * queryParams é opcional para GET.
 */
interface SipacGetOptions extends SipacOptionsBase {
  method: 'GET';
  queryParams?: string[]; // Opcional para GET
}

/**
 * Define as opções específicas para requisições POST.
 * queryParams é obrigatório para POST (conforme sua lógica no controller).
 */
interface SipacPostOptions extends SipacOptionsBase {
  method: 'POST';
  queryParams: string[]; // Obrigatório para POST
}

/**
 * Cria um tipo de união discriminada. O TypeScript saberá que se
 * method === 'POST', então queryParams deve existir.
 */
export type SipacOptions = SipacGetOptions | SipacPostOptions;

/**
 * O mapa de mapeamentos. Agora o TypeScript validará a estrutura
 * de cada entrada com base no valor de 'method'.
 */
