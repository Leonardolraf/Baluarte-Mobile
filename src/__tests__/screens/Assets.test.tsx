import { fireEvent, screen } from '@testing-library/react-native';
import { assetRepository } from '../../data/repository';
import { DEMO_USERS } from '../../data/users';
import { ApiError } from '../../lib/api/client';
import { ADMIN, ANALYST, freezeDate, renderApp } from '../../test-utils';

const COLLABORATOR = DEMO_USERS[2];

function listedAssetIds() {
  return screen.getAllByTestId(/^asset-item-/).map((item) => item.props.testID as string);
}

async function openAssets() {
  await fireEvent.press(screen.getByRole('button', { name: 'Ativos' }));
}

describe('Ativos', () => {
  beforeEach(() => freezeDate());
  afterEach(() => jest.restoreAllMocks());

  it('a Home do Administrador tem o atalho para os ativos', async () => {
    await renderApp({ user: ADMIN });
    expect(screen.getByRole('button', { name: 'Ativos' })).toBeOnTheScreen();
  });

  it('a Home do Analista tem o atalho para os ativos', async () => {
    await renderApp({ user: ANALYST });
    expect(screen.getByRole('button', { name: 'Ativos' })).toBeOnTheScreen();
  });

  it('a Home do Colaborador não mostra o atalho', async () => {
    await renderApp({ user: COLLABORATOR });
    expect(screen.queryByRole('button', { name: 'Ativos' })).not.toBeOnTheScreen();
  });

  it('lista os seis ativos, maior risco primeiro, só leitura', async () => {
    await renderApp({ user: ADMIN });
    await openAssets();

    expect(await screen.findByText('Total 6')).toBeOnTheScreen();
    // 004 e 003 empatam em 21: desempata pelo nome (api-pagamentos < portal-cliente).
    expect(listedAssetIds()).toEqual([
      'asset-item-asset-004',
      'asset-item-asset-003',
      'asset-item-asset-001',
      'asset-item-asset-002',
      'asset-item-asset-006',
      'asset-item-asset-005',
    ]);
    expect(screen.getByText('Aplicação · portal.empresa.com')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum aberto')).toBeOnTheScreen();
    expect(screen.getByText('Inativo')).toBeOnTheScreen();
    // Sem cadastro, edição ou exclusão.
    expect(screen.queryByRole('button', { name: /cadastrar|novo ativo|editar|excluir/i })).not.toBeOnTheScreen();
  });

  it('tocar num ativo abre o detalhe com risco por severidade e identificação', async () => {
    await renderApp({ user: ADMIN });
    await openAssets();

    await fireEvent.press(await screen.findByTestId('asset-item-asset-001'));

    expect(await screen.findByText('srv-web-01')).toBeOnTheScreen();
    expect(screen.getByLabelText('Nota de risco: 14')).toBeOnTheScreen();
    expect(screen.getByLabelText('Achados abertos: 2 abertos')).toBeOnTheScreen();
    expect(screen.getByLabelText('Alto: 2')).toBeOnTheScreen();
    expect(screen.getByLabelText('Crítico: 0')).toBeOnTheScreen();
    expect(screen.getByLabelText('IP: 192.168.0.10')).toBeOnTheScreen();
    expect(screen.getByLabelText('Situação: Ativo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Última varredura: 18/09/2026 10:00')).toBeOnTheScreen();
    expect(
      screen.getByText('Servidor web de produção (Nginx + Node.js) que expõe o portal público.'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(await screen.findByText('Total 6')).toBeOnTheScreen();
  });

  it('403 de perfil: o servidor manda — mostra "sem acesso" e não oferece tentar de novo', async () => {
    jest
      .spyOn(assetRepository, 'list')
      .mockRejectedValue(new ApiError('Sem permissão', 403, 'PERFIL_SEM_PERMISSAO'));
    await renderApp({ user: ANALYST });
    await openAssets();

    expect(await screen.findByText('Seu perfil não tem acesso aos ativos.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
    expect(screen.queryByText(/^Total/)).not.toBeOnTheScreen();
  });

  it('403 com código desconhecido dá mensagem neutra: nem "sem acesso", nem lista vazia', async () => {
    jest.spyOn(assetRepository, 'list').mockRejectedValue(new ApiError('x', 403, 'CODIGO_NOVO'));
    await renderApp({ user: ADMIN });
    await openAssets();

    expect(await screen.findByText('O servidor não liberou os ativos agora.')).toBeOnTheScreen();
    expect(screen.queryByText('Seu perfil não tem acesso aos ativos.')).not.toBeOnTheScreen();
    expect(screen.queryByText('Nenhum ativo cadastrado.')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeOnTheScreen();
  });

  it('403 de ciência pendente leva à tela do aviso de monitoramento', async () => {
    jest
      .spyOn(assetRepository, 'list')
      .mockRejectedValue(new ApiError('Ciência pendente', 403, 'CIENCIA_AVISO_PENDENTE'));
    await renderApp({ user: ADMIN });
    await openAssets();

    expect(await screen.findByRole('button', { name: 'Li e estou ciente' })).toBeOnTheScreen();
    expect(screen.queryByText('Carregando ativos…')).not.toBeOnTheScreen();
  });

  it('falha de rede ou 5xx oferece tentar de novo, e a nova tentativa carrega', async () => {
    const spy = jest
      .spyOn(assetRepository, 'list')
      .mockRejectedValueOnce(new Error('rede'));
    await renderApp({ user: ADMIN });
    await openAssets();

    expect(await screen.findByText('Não foi possível carregar os ativos.')).toBeOnTheScreen();
    spy.mockRestore();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Total 6')).toBeOnTheScreen();
  });

  it('ativo sem nota informada mostra travessão, não zero', async () => {
    jest.spyOn(assetRepository, 'list').mockResolvedValue([
      {
        id: 'x1',
        name: 'sem-dado',
        type: 'Servidor',
        host: 'h.baluarte.test',
        ip: null,
        description: null,
        status: 'active',
        lastScanAt: null,
      },
    ]);
    await renderApp({ user: ADMIN });
    await openAssets();

    expect(await screen.findByText('Total 1')).toBeOnTheScreen();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText('Nenhum aberto')).not.toBeOnTheScreen();
  });
});
