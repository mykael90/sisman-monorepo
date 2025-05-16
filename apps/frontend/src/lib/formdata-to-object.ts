// Favor não incluir propriedades do formData com o nome da chave começando com $ACTION_
function formDataToObject<T = any>(formData: FormData): T {
  const filteredEntries = Array.from(formData.entries()).filter(
    ([key]) => !key.startsWith('$ACTION_')
  );
  return Object.fromEntries(filteredEntries) as T;
}

export default formDataToObject;
