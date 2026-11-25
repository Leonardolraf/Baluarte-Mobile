import { buildInitialAssets } from '../../data/assets';
import { createMockAssetRepository } from '../../data/mockRepository';
import {
  canAccessAssets,
  formatOpenFindings,
  formatRiskScore,
  sortByRisk,
} from '../../lib/assets';
import { assetFromApi, severityMapFromApi, type BackendAsset } from '../../lib/api/mappers';
import type { Asset } from '../../types';

const NOW = new Date(2026, 8, 23, 10, 0, 0, 0);

describe('regras de exibição dos ativos (lib/assets)', () => {
  it('só Administrador e Analista veem o atalho', () => {
    expect(canAccessAssets('admin')).toBe(true);
    expect(canAccessAssets('analyst')).toBe(true);
    expect(canAccessAssets('collaborator')).toBe(false);
  });

  it('nota e achados desconhecidos viram travessão, nunca zero', () => {
    expect(formatRiskScore(undefined)).toBe('—');
    expect(formatRiskScore(0)).toBe('0');
    expect(formatRiskScore(21)).toBe('21');
    expect(formatOpenFindings(undefined)).toBe('—');
    expect(formatOpenFindings(0)).toBe('Nenhum aberto');
    expect(formatOpenFindings(1)).toBe('1 aberto');
    expect(formatOpenFindings(3)).toBe('3 abertos');
  });

  it('ordena por nota (maior primeiro), desconhecida por último, empate pelo nome', () => {
    const base: Omit<Asset, 'id' | 'name' | 'riskScore'> = {
      type: 'Servidor',
      host: 'h',
      ip: null,
      description: null,
      status: 'active',
      lastScanAt: null,
    };
    const sorted = sortByRisk([
      { ...base, id: '1', name: 'b', riskScore: 10 },
      { ...base, id: '2', name: 'sem-nota' },
      { ...base, id: '3', name: 'a', riskScore: 10 },
      { ...base, id: '4', name: 'z', riskScore: 0 },
      { ...base, id: '5', name: 'c', riskScore: 50 },
    ]);
    expect(sorted.map((a) => a.name)).toEqual(['c', 'a', 'b', 'z', 'sem-nota']);
  });
});

describe('dados do modo demo (data/assets)', () => {
  it('seis ativos do mock do frontend, com nota pela regra do servidor', () => {
    const assets = buildInitialAssets(NOW);
    expect(assets.map((a) => a.id)).toEqual([
      'asset-001',
      'asset-002',
      'asset-003',
      'asset-004',
      'asset-005',
      'asset-006',
    ]);
    const byId = Object.fromEntries(assets.map((a) => [a.id, a]));
    // 2 altos = 14; 1 crítico = 10; crítico + alto + médio = 21; nada = 0; 1 baixo = 1.
    expect(byId['asset-001']).toMatchObject({ riskScore: 14, openFindings: 2 });
    expect(byId['asset-002']).toMatchObject({ riskScore: 10, openFindings: 1 });
    expect(byId['asset-003']).toMatchObject({ riskScore: 21, openFindings: 3 });
    expect(byId['asset-005']).toMatchObject({ riskScore: 0, openFindings: 0 });
    expect(byId['asset-006']).toMatchObject({ riskScore: 1, status: 'inactive' });
    expect(byId['asset-001'].lastScanAt).toBe(new Date(2026, 8, 18, 10, 0, 0, 0).toISOString());
  });

  it('repositório mock: lista e detalhe pelo id', async () => {
    const repo = createMockAssetRepository();
    expect(await repo.list()).toHaveLength(6);
    expect((await repo.get('asset-004'))?.name).toBe('api-pagamentos');
    expect(await repo.get('nao-existe')).toBeUndefined();
  });
});

describe('mapper do GET /assets (lib/api/mappers)', () => {
  const RAW: BackendAsset = {
    id: 'a1',
    nome: 'Servidor B14',
    host: 'srv.baluarte.test',
    tipo: 'Servidor',
    status: 'Ativo',
    criadoEm: '2026-10-01T12:00:00.000Z',
    ip: '10.0.0.5',
    descricao: 'Servidor de arquivos',
    achadosAbertos: 3,
    notaRisco: 21,
    abertosPorSeveridade: { Crítico: 1, Alto: 1, Médio: 1, Baixo: 0 },
    ultimaVarredura: {
      id: 's1',
      status: 'CONCLUIDA',
      criadoEm: '2026-10-02T12:00:00.000Z',
      concluidoEm: '2026-10-02T12:00:20.000Z',
    },
  };

  it('converte os campos em português para o modelo do app', () => {
    expect(assetFromApi(RAW)).toEqual({
      id: 'a1',
      name: 'Servidor B14',
      type: 'Servidor',
      host: 'srv.baluarte.test',
      ip: '10.0.0.5',
      description: 'Servidor de arquivos',
      status: 'active',
      lastScanAt: '2026-10-02T12:00:20.000Z',
      riskScore: 21,
      openFindings: 3,
      openBySeverity: { critical: 1, high: 1, medium: 1, low: 0 },
    });
  });

  it('campos de risco ausentes ficam desconhecidos (undefined), nunca 0', () => {
    const asset = assetFromApi({ id: 'a2', nome: 'X', host: 'x', tipo: 'Rede', status: 'Inativo' });
    expect(asset.status).toBe('inactive');
    expect(asset.riskScore).toBeUndefined();
    expect(asset.openFindings).toBeUndefined();
    expect(asset.openBySeverity).toBeUndefined();
    expect(asset.ip).toBeNull();
    expect(asset.lastScanAt).toBeNull();
  });

  it('mapa de severidade parcial ou inválido não é completado com zero', () => {
    expect(severityMapFromApi({ Crítico: 1, Alto: 0 })).toBeUndefined();
    expect(severityMapFromApi({ Crítico: 1, Alto: 0, Médio: 0, Baixo: -1 })).toBeUndefined();
    expect(severityMapFromApi({ Critico: 2, alto: 0, Medio: 1, BAIXO: 0 })).toEqual({
      critical: 2,
      high: 0,
      medium: 1,
      low: 0,
    });
  });

  it('varredura ainda em curso usa a data de início', () => {
    const asset = assetFromApi({
      ...RAW,
      ultimaVarredura: { id: 's2', status: 'EM_ANDAMENTO', criadoEm: '2026-10-03T08:00:00.000Z', concluidoEm: null },
    });
    expect(asset.lastScanAt).toBe('2026-10-03T08:00:00.000Z');
  });
});
