/**
 * Repositório do modo demo: tudo em memória, a partir de `src/data/*`.
 * É o default quando não há API configurada — funciona offline e é o que
 * os testes exercitam.
 */
import { authenticate, type AuthResult } from '../lib/auth';
import { createScheduledCampaign, sortByScheduleDesc } from '../lib/campaigns';
import type { Asset, Campaign, MonitoringNotice, NewCampaignInput, User } from '../types';
import { buildInitialAssets } from './assets';
import { MOCK_MONITORING_NOTICE } from './monitoringNotice';
import { buildInitialCampaigns } from './campaigns';
import type { AssetRepository, AuthRepository, CampaignRepository, NoticeRepository } from './repository';

export const mockAuthRepository: AuthRepository = {
  async signIn(email, password): Promise<AuthResult> {
    return authenticate(email, password);
  },
  async signOut() {
    /* demo: sem sessão no servidor para encerrar */
  },
  async restoreSession(): Promise<User | null> {
    // Demo não persiste sessão: sempre começa no Login.
    return null;
  },
};

export function createMockCampaignRepository(): CampaignRepository {
  let seeded: Campaign[] | null = null;
  // Próximo número de id (camp-006, camp-007…): continua depois dos dados iniciais.
  let counter = 0;

  const ensureSeed = (): Campaign[] => {
    if (seeded === null) {
      seeded = buildInitialCampaigns(new Date());
      counter = seeded.length;
    }
    return seeded;
  };

  return {
    async list(): Promise<Campaign[]> {
      return sortByScheduleDesc(ensureSeed());
    },
    async get(id: string): Promise<Campaign | undefined> {
      return ensureSeed().find((campaign) => campaign.id === id);
    },
    async create(input: NewCampaignInput): Promise<Campaign> {
      ensureSeed();
      counter += 1;
      return createScheduledCampaign(input, `camp-${String(counter).padStart(3, '0')}`);
    },
  };
}

export const mockCampaignRepository = createMockCampaignRepository();

export function createMockAssetRepository(): AssetRepository {
  let seeded: Asset[] | null = null;
  const ensureSeed = (): Asset[] => (seeded ??= buildInitialAssets(new Date()));
  return {
    async list(): Promise<Asset[]> {
      return ensureSeed();
    },
    async get(id: string): Promise<Asset | undefined> {
      return ensureSeed().find((asset) => asset.id === id);
    },
  };
}

export const mockAssetRepository = createMockAssetRepository();

export function createMockNoticeRepository(): NoticeRepository {
  let acknowledged = false;
  return {
    async get(): Promise<MonitoringNotice> {
      return { ...MOCK_MONITORING_NOTICE, acknowledged };
    },
    async acknowledge(version: string): Promise<void> {
      if (version !== MOCK_MONITORING_NOTICE.version) throw new Error('Versão do aviso desatualizada.');
      acknowledged = true;
    },
  };
}

export const mockNoticeRepository = createMockNoticeRepository();
