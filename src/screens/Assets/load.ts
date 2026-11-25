import { ApiError } from '../../lib/api/client';

/** Estado de carga das telas de ativos. */
export type LoadState<T> =
  | { kind: 'loading' }
  | { kind: 'ready'; data: T }
  /** 403 de perfil (ou 403 com código desconhecido): o servidor negou, não tenta de novo. */
  | { kind: 'forbidden' }
  /** 403 CIENCIA_AVISO_PENDENTE: a sessão vale, falta a ciência no portal. */
  | { kind: 'notice' }
  | { kind: 'error'; message: string };

export const FORBIDDEN_MESSAGE = 'Seu perfil não tem acesso aos ativos.';
export const NOTICE_MESSAGE = 'Confirme o aviso de monitoramento no portal Baluarte para usar o app.';
export const LOAD_ERROR_MESSAGE = 'Não foi possível carregar os ativos.';

/**
 * O 403 do servidor é a autoridade: decide pelo STATUS e só o código de ciência
 * vira outra mensagem. Qualquer outro 403 é "sem permissão", nunca "tente de novo".
 */
export function stateFromError<T>(error: unknown): LoadState<T> {
  if (error instanceof ApiError && error.status === 403) {
    return error.code === 'CIENCIA_AVISO_PENDENTE' ? { kind: 'notice' } : { kind: 'forbidden' };
  }
  return { kind: 'error', message: LOAD_ERROR_MESSAGE };
}
