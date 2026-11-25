/**
 * Aviso de monitoramento no modo API (contrato do backend 20ef962), com `fetch`
 * e o armazenamento seguro mockados. Nenhuma rede real é tocada.
 */
jest.mock('../../lib/config', () => ({
  API_BASE_URL: 'https://vm.test/api',
  IS_API_MODE: true,
}));

const mockSecureStore = {
  getItemAsync: jest.fn(async () => 'jwt-abc' as string | null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
};
jest.mock('expo-secure-store', () => mockSecureStore);

import { apiCampaignRepository, apiNoticeRepository } from '../../lib/api/apiRepository';
import { isNoticePending } from '../../lib/notice';

function reply(status: number, body: Record<string, unknown>): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  mockSecureStore.deleteItemAsync.mockClear();
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
});

const AVISO = {
  versao: '2026-10-19',
  rascunho: false,
  titulo: 'Aviso de Monitoramento',
  introducao: 'Introdução do servidor.',
  secoes: [
    { id: 'coleta', titulo: '1. Coleta', paragrafos: ['P1'], itens: ['I1', 'I2'], observacoes: ['O1'] },
    { id: 'sem-listas', titulo: '2. Outra' },
  ],
  ciencia: { registrada: false, registradaEm: null },
};

describe('apiNoticeRepository', () => {
  it('GET /monitoramento/aviso: texto e versão vêm do servidor', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { status: 'sucesso', dados: AVISO }));

    const notice = await apiNoticeRepository.get();

    expect(fetchMock.mock.calls[0][0]).toBe('https://vm.test/api/monitoramento/aviso');
    expect(notice).toEqual({
      version: '2026-10-19',
      title: 'Aviso de Monitoramento',
      intro: 'Introdução do servidor.',
      sections: [
        { id: 'coleta', title: '1. Coleta', paragraphs: ['P1'], items: ['I1', 'I2'], notes: ['O1'] },
        { id: 'sem-listas', title: '2. Outra', paragraphs: [], items: [], notes: [] },
      ],
      acknowledged: false,
    });
  });

  it('ciência só conta com registrada === true explícito', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { status: 'sucesso', dados: { ...AVISO, ciencia: undefined } }));
    expect((await apiNoticeRepository.get()).acknowledged).toBe(false);
  });

  it.each([201, 200])('POST /monitoramento/ciencia com a versão lida: %i libera', async (status) => {
    fetchMock.mockResolvedValueOnce(
      reply(status, {
        status: 'sucesso',
        dados: { versao: '2026-10-19', registradaEm: '2026-11-25T01:00:00.000Z', nova: status === 201 },
      }),
    );

    await expect(apiNoticeRepository.acknowledge('2026-10-19')).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://vm.test/api/monitoramento/ciencia');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ versao: '2026-10-19' });
  });

  it('409 VERSAO_DESATUALIZADA sobe com o código (a tela recarrega)', async () => {
    fetchMock.mockResolvedValueOnce(
      reply(409, { status: 'erro', mensagem: 'O aviso mudou', codigoErro: 'VERSAO_DESATUALIZADA' }),
    );
    await expect(apiNoticeRepository.acknowledge('2026-01-01')).rejects.toMatchObject({
      status: 409,
      code: 'VERSAO_DESATUALIZADA',
    });
  });

  it('POST /campaigns com 403 de ciência é reconhecido como pendência, sem apagar a sessão', async () => {
    fetchMock.mockResolvedValueOnce(
      reply(403, {
        status: 'erro',
        mensagem: 'Confirme que leu o aviso de monitoramento para usar o Baluarte',
        codigoErro: 'CIENCIA_AVISO_PENDENTE',
      }),
    );
    const error = await apiCampaignRepository
      .create({
        name: 'X',
        template: 'urgency',
        targetGroup: 'Colaboradores internos',
        scheduledAt: new Date(),
        recipients: ['a@baluarte.test'],
      })
      .catch((e: unknown) => e);

    expect(isNoticePending(error)).toBe(true);
    expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('isNoticePending decide por status + código, não pelo texto', () => {
    const { ApiError } = jest.requireActual('../../lib/api/client');
    expect(isNoticePending(new ApiError('qualquer texto', 403, 'CIENCIA_AVISO_PENDENTE'))).toBe(true);
    expect(isNoticePending(new ApiError('aviso de monitoramento', 403, 'PERFIL_SEM_PERMISSAO'))).toBe(false);
    expect(isNoticePending(new ApiError('x', 401, 'CIENCIA_AVISO_PENDENTE'))).toBe(false);
    expect(isNoticePending(new Error('CIENCIA_AVISO_PENDENTE'))).toBe(false);
  });
});
