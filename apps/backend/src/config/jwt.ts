import 'dotenv/config';

const INSECURE_DEFAULT_SECRETS = new Set([
  'dev-secret-change-in-production',
  'secret',
  'jwt-secret',
  'jwt_secret',
  'changeme',
  'password',
  '123456',
  '12345678',
  'admin123',
]);

export const MIN_JWT_SECRET_LENGTH = 32;
export const JWT_ALGORITHM = 'HS256' as const;

export interface SecretValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates whether a given JWT secret meets the minimum security standards.
 * Must be non-empty, at least 32 characters (256-bit entropy for HS256),
 * and not match known default or trivial values.
 */
export function validateJwtSecret(secret?: string): SecretValidationResult {
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    return {
      valid: false,
      reason: 'JWT_SECRET environment variable is missing or empty',
    };
  }

  const trimmed = secret.trim();

  if (INSECURE_DEFAULT_SECRETS.has(trimmed.toLowerCase())) {
    return {
      valid: false,
      reason: `JWT_SECRET cannot be an insecure default value ("${trimmed}")`,
    };
  }

  if (trimmed.length < MIN_JWT_SECRET_LENGTH) {
    return {
      valid: false,
      reason: `JWT_SECRET is too short (length: ${trimmed.length}, minimum required: ${MIN_JWT_SECRET_LENGTH} characters for HS256)`,
    };
  }

  return { valid: true };
}

/**
 * Retrieves the validated JWT secret from the environment.
 * If missing or weak, halts the server or throws an error.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const validation = validateJwtSecret(secret);

  if (!validation.valid) {
    const errorMsg = `[FATAL JWT SECURITY ERROR] ${validation.reason}. Server startup halted.`;
    console.error(errorMsg);

    // In test environment, throw error so unit tests can assert on it.
    // In production or development, halt process execution.
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  return secret!.trim();
}

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
