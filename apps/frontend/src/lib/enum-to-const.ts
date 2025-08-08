function enumToConst<T extends Record<string, string | number>>(
  enumObj: T
): { [K in keyof T]: T[K] } {
  return { ...enumObj };
}
