// O valor no mapa de configuração pode ser:
// 1. Uma string, que é a chave correspondente no formulário.
// 2. Uma função que recebe todos os dados do formulário e retorna o valor transformado.
type MappingRule<TForm> = keyof TForm | ((formData: TForm) => any);

// O mapa de configuração completo
// As chaves são as chaves do Payload final (TPayload)
// Os valores são as regras para preencher essas chaves a partir do formulário (TForm)
export type MappingConfig<TForm, TPayload> = {
  [K in keyof TPayload]: MappingRule<TForm>;
};

export function createPayload<TForm extends object, TPayload extends object>(
  formData: TForm,
  config: MappingConfig<TForm, TPayload>
): TPayload {
  // Inicializamos o payload como um objeto vazio, mas o tipamos corretamente.
  const payload = {} as TPayload;

  // Iteramos sobre as chaves do *payload final* que estão definidas no config.
  for (const key in config) {
    const rule = config[key];

    let value: any;

    if (typeof rule === 'function') {
      // Se a regra for uma função, a executamos passando todos os dados do formulário.
      // Isso permite transformações complexas, como criar objetos ou gerar valores.
      value = rule(formData);
    } else if (typeof rule === 'string' && rule in formData) {
      // Se a regra for uma string (nome do campo do formulário), pegamos o valor diretamente.
      value = formData[rule as keyof TForm];
    } else {
      // Opcional: Lançar um erro se a configuração for inválida.
      console.warn(`Regra de mapeamento inválida para a chave "${key}".`);
      continue;
    }

    payload[key as keyof TPayload] = value;
  }

  return payload;
}
