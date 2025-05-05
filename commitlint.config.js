// Na raiz do seu monorepo: ./commitlint.config.js
module.exports = {
    extends: ['@commitlint/config-conventional'],
    // Você pode adicionar regras personalizadas aqui se precisar,
    // mas o config-conventional já cobre o padrão que você descreveu.
    // Exemplo: Aumentar o tamanho máximo do header
    // rules: {
    //   'header-max-length': [2, 'always', 100],
    // },
  };