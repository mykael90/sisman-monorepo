// Favor não incluir propriedades do formData com o nome da chave começando com $ACTION_

// FormDataEntryValue é string | File

function formDataToObject<T = Record<string, any>>(formData: FormData): T {
  const result: Record<
    string,
    string | File | object | (string | File | object)[]
  > = {};
  const keys = new Set<string>();

  // Coleta todas as chaves únicas, filtrando as indesejadas
  for (const key of formData.keys()) {
    if (!key.startsWith('$ACTION_')) {
      keys.add(key);
    }
  }

  // Para cada chave única, obtém todos os seus valores
  for (const key of keys) {
    const originalValues = formData.getAll(key); // Retorna (string | File)[]

    const processedValues = originalValues.map((val) => {
      if (typeof val === 'string') {
        // 1. Tenta parsear o formato customizado "{id: ...}" usado para roles
        // Exemplo de entrada: "{id: 123}" ou "{id: abc-123}"
        if (val.startsWith('{id:') && val.endsWith('}')) {
          // Extrai o conteúdo entre "{id:" e "}"
          const idContent = val.substring(4, val.length - 1).trim();
          // Constrói o objeto { id: "conteúdoExtraído" }
          return { id: idContent };
        }
        // 2. Se não for o formato customizado, tenta JSON.parse padrão
        try {
          return JSON.parse(val);
        } catch (e) {
          // Se JSON.parse falhar (não é uma string JSON válida), manter a string original
          return val;
        }
      }
      // Se for File, manter como File
      return val;
    });

    // Se houver múltiplos valores para a chave, usa o array de valores.
    // Se houver apenas um valor, usa o valor diretamente.
    // formData.keys() garante que a chave existe, então values.length >= 1.
    result[key] =
      processedValues.length > 1 ? processedValues : processedValues[0];
  }
  return result as T;
}

export default formDataToObject;
