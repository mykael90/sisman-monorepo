/**
 * Extrai as chaves de T que não são opcionais.
 * Uma chave é considerada não opcional se não for declarada com '?'.
 */
export type NonOptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
