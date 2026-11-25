import type { Asset, AssetSeverity, Role } from '../types';

/** Perfis que veem os ativos (os mesmos do servidor: Administrador e Analista). */
const ASSET_ROLES: Role[] = ['admin', 'analyst'];

/**
 * Só decide se o app MOSTRA o atalho. Quem autoriza é o servidor: um 403 no
 * GET /assets vale mais do que esta lista.
 */
export function canAccessAssets(role: Role): boolean {
  return ASSET_ROLES.includes(role);
}

/** Ordem de exibição: da mais grave para a mais leve. */
export const ASSET_SEVERITIES: AssetSeverity[] = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_LABEL: Record<AssetSeverity, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
};

export const ASSET_STATUS_LABEL: Record<Asset['status'], string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

/** Valor desconhecido aparece como travessão, nunca como zero. */
export const UNKNOWN = '—';

export function formatRiskScore(score: number | undefined): string {
  return typeof score === 'number' ? String(score) : UNKNOWN;
}

/** "2 abertos", "1 aberto", "Nenhum aberto" ou travessão quando o servidor não informou. */
export function formatOpenFindings(count: number | undefined): string {
  if (typeof count !== 'number') return UNKNOWN;
  if (count === 0) return 'Nenhum aberto';
  return count === 1 ? '1 aberto' : `${count} abertos`;
}

/** Ordem da lista: maior nota primeiro; nota desconhecida vai para o fim; empate pelo nome. */
export function sortByRisk(assets: Asset[]): Asset[] {
  return [...assets].sort((a, b) => {
    const ra = a.riskScore ?? -1;
    const rb = b.riskScore ?? -1;
    return rb - ra || a.name.localeCompare(b.name, 'pt-BR');
  });
}
