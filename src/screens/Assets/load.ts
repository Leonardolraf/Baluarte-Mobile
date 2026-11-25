import { ApiError } from '../../lib/api/client';
import { isNoticePending } from '../../lib/notice';

/** Estado de carga das telas de ativos. */
export type LoadState<T> =
  | { kind: 'loading' }
  | { kind: 'ready'; data: T }
  /** 403 PERFIL_SEM_PERMISSAO: o servidor negou pelo perfil, não tenta de novo. */
  | { kind: 'forbidden' }
  /** Outro 403 (código desconhecido): o servidor negou sem dizer por quê; mensagem neutra. */
  | { kind: 'denied' }
  /** 403 CIENCIA_AVISO_PENDENTE: a sessão vale; quem chama leva à tela do aviso. */
  | { kind: 'notice' }
  | { kind: 'error'; message: string };

export const FORBIDDEN_MESSAGE = 'Seu perfil não tem acesso aos ativos.';
export const DENIED_MESSAGE = 'O servidor não liberou os ativos agora.';
export const LOAD_ERROR_MESSAGE = 'Não foi possível carregar os ativos.';

/**
 * O 403 do servidor é a autoridade e decide pelo STATUS + código: ciência leva à
 * tela do aviso, PERFIL_SEM_PERMISSAO é "sem acesso", e um 403 de código desconhecido
 * não vira "sem acesso" (não sabemos o motivo) nem "tente de novo".
 */
export function stateFromError<T>(error: unknown): LoadState<T> {
  if (isNoticePending(error)) return { kind: 'notice' };
  if (error instanceof ApiError && error.status === 403) {
    return error.code === 'PERFIL_SEM_PERMISSAO' ? { kind: 'forbidden' } : { kind: 'denied' };
  }
  return { kind: 'error', message: LOAD_ERROR_MESSAGE };
}
