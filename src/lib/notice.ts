import { ApiError } from './api/client';

/** Código do 403 que o servidor devolve em toda rota de dados sem a ciência do aviso. */
export const NOTICE_PENDING_CODE = 'CIENCIA_AVISO_PENDENTE';

/** O 403 de ciência é a AUTORIDADE: decide por status + código, nunca pelo texto. */
export function isNoticePending(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403 && error.code === NOTICE_PENDING_CODE;
}
