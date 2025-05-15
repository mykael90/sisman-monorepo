function formDataToObject<T = any>(formData: FormData): T {
  return Object.fromEntries(formData.entries()) as T;
}

export default formDataToObject;
