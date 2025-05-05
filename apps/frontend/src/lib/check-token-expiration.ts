interface TokenExpirationResult {
  isValid: boolean;
  expiresAt: Date;
  timeLeft: number;
  timeLeftFormatted: string;
}

export default function checkTokenExpiration(
  expiresIn: number,
  issuedAt: number = Date.now()
): TokenExpirationResult {
  const expirationTime = issuedAt + expiresIn * 1000;
  const currentTime = Date.now();
  const timeLeft = expirationTime - currentTime;

  return {
    isValid: timeLeft > 60000, // 1 minuto de margem
    expiresAt: new Date(expirationTime),
    timeLeft: Math.floor(timeLeft / 1000), // segundos restantes
    timeLeftFormatted: new Date(timeLeft).toISOString().substr(11, 8) // formato HH:MM:SS
  };
}

// // Exemplo de uso:
// const result = checkTokenExpiration(42671);
// console.log(`
//   Token válido: ${result.isValid}
//   Expira em: ${result.expiresAt}
//   Tempo restante: ${result.timeLeft} segundos (${result.timeLeftFormatted})
// `);
