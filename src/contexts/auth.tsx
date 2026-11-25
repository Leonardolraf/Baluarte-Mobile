import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authRepository } from '../data/repository';
import { IS_API_MODE } from '../lib/config';
import type { AuthResult } from '../lib/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  /** `true` enquanto o app verifica, na abertura, se há sessão salva (modo API). */
  restoring: boolean;
  /**
   * Autentica. No modo demo é imediato; no modo API chama `POST /login` e guarda
   * o token. Em caso de sucesso, as rotas trocam sozinhas para o app.
   */
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  /**
   * `true` quando falta a ciência do aviso de monitoramento: as rotas trocam para
   * a tela do aviso. Liga pelo `cienciaAvisoPendente` do /me (orienta) ou por
   * QUALQUER 403 CIENCIA_AVISO_PENDENTE (autoridade), via `requireNotice`.
   */
  noticeRequired: boolean;
  /** Chamado por quem recebeu 403 CIENCIA_AVISO_PENDENTE de qualquer rota. */
  requireNotice: () => void;
  /** Ciência registrada: volta ao app (Home) e recarrega os dados. */
  noticeAcknowledged: () => void;
  /** Muda a cada ciência registrada: quem guarda dados do servidor recarrega. */
  dataEpoch: number;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** Usuário já autenticado (útil em testes). */
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  // Só `true` explícito do /me liga a tela antes; ausente = desconhecido, e o 403 decide.
  const [noticeRequired, setNoticeRequired] = useState(initialUser?.noticePending === true);
  const [dataEpoch, setDataEpoch] = useState(0);
  // Só há o que restaurar no modo API e quando não começamos já logados (testes).
  const [restoring, setRestoring] = useState(IS_API_MODE && initialUser === null);

  useEffect(() => {
    if (!restoring) return;
    let active = true;
    authRepository
      .restoreSession()
      .then((restored) => {
        if (active && restored) {
          setUser(restored);
          setNoticeRequired(restored.noticePending === true);
        }
      })
      .finally(() => {
        if (active) setRestoring(false);
      });
    return () => {
      active = false;
    };
    // Só na montagem: a restauração de sessão é feita uma vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authRepository.signIn(email, password);
    if (result.ok) {
      setUser(result.user);
      setNoticeRequired(result.user.noticePending === true);
    }
    return result;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setNoticeRequired(false);
    // Encerra no servidor/limpa o token em segundo plano (não trava a UI).
    void authRepository.signOut();
  }, []);

  const requireNotice = useCallback(() => setNoticeRequired(true), []);
  const noticeAcknowledged = useCallback(() => {
    setNoticeRequired(false);
    setDataEpoch((epoch) => epoch + 1);
  }, []);

  const value = useMemo(
    () => ({ user, restoring, signIn, signOut, noticeRequired, requireNotice, noticeAcknowledged, dataEpoch }),
    [user, restoring, signIn, signOut, noticeRequired, requireNotice, noticeAcknowledged, dataEpoch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return context;
}
