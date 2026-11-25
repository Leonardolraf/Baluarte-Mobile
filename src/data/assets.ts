/**
 * Ativos do modo demo, coerentes com `baluarte-frontend/src/mocks/data.ts`
 * (MOCK_ASSETS): mesmos nomes, hosts, IPs e descrições. Os abertos por
 * severidade são os achados abertos de cada ativo no mock do frontend
 * (aberta, em análise ou em correção), e a nota segue a regra do servidor:
 * min(100, 10×crítico + 7×alto + 4×médio + 1×baixo).
 */
import type { Asset, AssetSeverity } from '../types';

const DAY_MS = 86_400_000;

function open(critical: number, high: number, medium: number, low: number): Record<AssetSeverity, number> {
  return { critical, high, medium, low };
}

const WEIGHT: Record<AssetSeverity, number> = { critical: 10, high: 7, medium: 4, low: 1 };

function score(bySeverity: Record<AssetSeverity, number>): number {
  const points = (Object.keys(WEIGHT) as AssetSeverity[]).reduce(
    (sum, s) => sum + WEIGHT[s] * bySeverity[s],
    0,
  );
  return Math.min(100, points);
}

function total(bySeverity: Record<AssetSeverity, number>): number {
  return Object.values(bySeverity).reduce((sum, n) => sum + n, 0);
}

interface Seed extends Omit<Asset, 'lastScanAt' | 'riskScore' | 'openFindings'> {
  lastScanDaysAgo: number | null;
  openBySeverity: Record<AssetSeverity, number>;
}

const SEEDS: Seed[] = [
  {
    id: 'asset-001',
    name: 'srv-web-01',
    type: 'Servidor',
    host: 'srv-web-01.empresa.com',
    ip: '192.168.0.10',
    description: 'Servidor web de produção (Nginx + Node.js) que expõe o portal público.',
    status: 'active',
    lastScanDaysAgo: 5,
    openBySeverity: open(0, 2, 0, 0),
  },
  {
    id: 'asset-002',
    name: 'vpn-gateway',
    type: 'Rede',
    host: 'vpn.empresa.com',
    ip: '200.10.20.5',
    description: 'Concentrador VPN e gateway SSH de acesso remoto dos colaboradores.',
    status: 'active',
    lastScanDaysAgo: 2,
    openBySeverity: open(1, 0, 0, 0),
  },
  {
    id: 'asset-003',
    name: 'portal-cliente',
    type: 'Aplicação',
    host: 'portal.empresa.com',
    ip: null,
    description: 'Aplicação web voltada ao cliente final, com autenticação e área logada.',
    status: 'active',
    lastScanDaysAgo: 9,
    openBySeverity: open(1, 1, 1, 0),
  },
  {
    id: 'asset-004',
    name: 'api-pagamentos',
    type: 'Aplicação',
    host: 'api.empresa.com',
    ip: null,
    description: 'API REST de processamento de pagamentos e emissão de faturas.',
    status: 'active',
    lastScanDaysAgo: 2,
    openBySeverity: open(1, 1, 1, 0),
  },
  {
    id: 'asset-005',
    name: 'db-central',
    type: 'Banco de Dados',
    host: 'db.empresa.com',
    ip: '10.0.5.20',
    description: 'Instância PostgreSQL central com dados transacionais e cadastrais.',
    status: 'active',
    lastScanDaysAgo: 3,
    openBySeverity: open(0, 0, 0, 0),
  },
  {
    id: 'asset-006',
    name: 'srv-legado',
    type: 'Servidor',
    host: '192.168.0.20',
    ip: '192.168.0.20',
    description: 'Servidor Apache legado em processo de desativação; ainda hospeda relatórios internos.',
    status: 'inactive',
    lastScanDaysAgo: 22,
    openBySeverity: open(0, 0, 0, 1),
  },
];

/** Ativos com datas relativas a `now` (os testes congelam o relógio). */
export function buildInitialAssets(now: Date): Asset[] {
  return SEEDS.map(({ lastScanDaysAgo, ...seed }) => ({
    ...seed,
    lastScanAt:
      lastScanDaysAgo === null ? null : new Date(now.getTime() - lastScanDaysAgo * DAY_MS).toISOString(),
    riskScore: score(seed.openBySeverity),
    openFindings: total(seed.openBySeverity),
  }));
}
