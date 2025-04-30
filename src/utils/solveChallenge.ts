import crypto from 'crypto';

/**
 * Resolve o desafio do Akamai Proof-of-Work.
 * Busca um sufixo numérico que, quando concatenado ao token+timestamp+nonce,
 * produz um hash SHA256 com um prefixo binário contendo N zeros (difficulty).
 */
export async function solveChallenge({
  token,
  timestamp,
  nonce,
  difficulty = 5,
  maxAttempts = 10_000_000,
}: {
  token: string;
  timestamp: number;
  nonce: string;
  difficulty: number;
  maxAttempts?: number;
}): Promise<{ result: number; hash: string } | null> {
  const prefix = `${token}${timestamp}${nonce}`;
  const target = '0'.repeat(difficulty);

  for (let i = 0; i < maxAttempts; i++) {
    const input = `${prefix}${i}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');

    if (hash.startsWith(target)) {
      console.log(`✅ Solução encontrada após ${i} tentativas: ${hash}`);
      return { result: i, hash };
    }
  }

  console.warn('⚠️ Desafio não resolvido dentro do limite de tentativas.');
  return null;
}
