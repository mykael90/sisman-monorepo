// Favor não incluir propriedades do formData com o nome da chave começando com $ACTION_

// FormDataEntryValue é string | File

function formDataToObject<T = Record<string, any>>(formData: FormData): T {
  const result: Record<string, string | File | (string | File)[]> = {};
  const keys = new Set<string>();

  // Coleta todas as chaves únicas, filtrando as indesejadas
  for (const key of formData.keys()) {
    if (!key.startsWith('$ACTION_')) {
      keys.add(key);
    }
  }

  // Para cada chave única, obtém todos os seus valores
  for (const key of keys) {
    const values = formData.getAll(key); // Retorna (string | File)[]

    // Se houver múltiplos valores para a chave, usa o array de valores.
    // Se houver apenas um valor, usa o valor diretamente.
    // formData.keys() garante que a chave existe, então values.length >= 1.
    result[key] = values.length > 1 ? values : values[0];
  }
  return result as T;
}

export default formDataToObject;
