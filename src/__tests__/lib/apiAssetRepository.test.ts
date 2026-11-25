/**
 * GET /assets no modo API, com `fetch` e o armazenamento seguro mockados.
 * Nenhuma rede real é tocada.
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

import { createApiAssetRepository } from '../../lib/api/apiRepository';
import { ApiError } from '../../lib/api/client';

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

const ASSETS = [
  { id: 'a1', nome: 'Servidor', host: 'srv.baluarte.test', tipo: 'Servidor', status: 'Ativo', notaRisco: 10 },
  { id: 'a2', nome: 'Rede', host: '10.0.0.1', tipo: 'Rede', status: 'Ativo' },
];

describe('apiAssetRepository', () => {
  it('lista pelo GET /assets com o Bearer da sessão', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { status: 'sucesso', dados: ASSETS }));
    const repo = createApiAssetRepository();

    const assets = await repo.list();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://vm.test/api/assets');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer jwt-abc');
    expect(assets.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(assets[1].riskScore).toBeUndefined();
  });

  it('detalhe sai da última lista, sem nova requisição nem endpoint novo', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { status: 'sucesso', dados: ASSETS }));
    const repo = createApiAssetRepository();
    await repo.list();

    expect((await repo.get('a2'))?.name).toBe('Rede');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('detalhe sem lista em memória lê o GET /assets; id inexistente = undefined', async () => {
    fetchMock.mockResolvedValue(reply(200, { status: 'sucesso', dados: ASSETS }));
    const repo = createApiAssetRepository();

    expect((await repo.get('a1'))?.name).toBe('Servidor');
    expect(await repo.get('zzz')).toBeUndefined();
    expect(fetchMock.mock.calls.every(([url]) => url === 'https://vm.test/api/assets')).toBe(true);
  });

  it('403 de perfil sobe como ApiError (a tela decide) e não apaga a sessão', async () => {
    fetchMock.mockResolvedValueOnce(
      reply(403, { status: 'erro', mensagem: 'Sem permissão', codigoErro: 'PERFIL_SEM_PERMISSAO' }),
    );
    const repo = createApiAssetRepository();

    await expect(repo.list()).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      code: 'PERFIL_SEM_PERMISSAO',
    });
    await expect(repo.list()).rejects.toBeInstanceOf(Error);
    expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('erro na leitura não envenena o cache: o detalhe tenta de novo', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(500, { status: 'erro', mensagem: 'x', codigoErro: 'ERRO_INTERNO' }))
      .mockResolvedValueOnce(reply(200, { status: 'sucesso', dados: ASSETS }));
    const repo = createApiAssetRepository();

    await expect(repo.list()).rejects.toBeInstanceOf(ApiError);
    expect((await repo.get('a1'))?.name).toBe('Servidor');
  });
});
