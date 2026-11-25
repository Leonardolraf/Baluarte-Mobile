import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { campaignRepository, noticeRepository } from '../../data/repository';
import { MOCK_MONITORING_NOTICE } from '../../data/monitoringNotice';
import { DEMO_USERS } from '../../data/users';
import { ApiError } from '../../lib/api/client';
import { ADMIN, ANALYST, freezeDate, renderApp } from '../../test-utils';
import type { User } from '../../types';

const PENDING_ANALYST: User = { ...ANALYST, noticePending: true };
const NOTICE_403 = () => new ApiError('Confirme que leu o aviso de monitoramento para usar o Baluarte', 403, 'CIENCIA_AVISO_PENDENTE');

describe('Aviso de monitoramento', () => {
  beforeEach(() => freezeDate());
  afterEach(() => jest.restoreAllMocks());

  it('cienciaAvisoPendente no /me: o aviso vem antes de qualquer tela de dados', async () => {
    await renderApp({ user: PENDING_ANALYST });

    expect(await screen.findByText(MOCK_MONITORING_NOTICE.title)).toBeOnTheScreen();
    expect(screen.getByText('Versão 2026-10-19')).toBeOnTheScreen();
    expect(screen.getByText('9. Registro de ciência')).toBeOnTheScreen();
    expect(screen.queryByText('Campanhas')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Nova campanha' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ativos' })).not.toBeOnTheScreen();
  });

  it('noticePending ausente (desconhecido) não abre o aviso: quem decide é o 403', async () => {
    await renderApp({ user: ADMIN });
    expect(screen.getByText('Total 5')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Li e estou ciente' })).not.toBeOnTheScreen();
  });

  it('"Li e estou ciente" registra a versão lida e volta para a Home', async () => {
    const ack = jest.spyOn(noticeRepository, 'acknowledge');
    await renderApp({ user: PENDING_ANALYST });

    await fireEvent.press(await screen.findByRole('button', { name: 'Li e estou ciente' }));

    expect(ack).toHaveBeenCalledWith('2026-10-19');
    expect(await screen.findByText('Olá, Rafael')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Li e estou ciente' })).not.toBeOnTheScreen();
  });

  it('409 VERSAO_DESATUALIZADA: recarrega o aviso e pede nova leitura, sem liberar', async () => {
    const get = jest.spyOn(noticeRepository, 'get');
    jest
      .spyOn(noticeRepository, 'acknowledge')
      .mockRejectedValueOnce(new ApiError('O aviso mudou', 409, 'VERSAO_DESATUALIZADA'));
    await renderApp({ user: PENDING_ANALYST });

    await fireEvent.press(await screen.findByRole('button', { name: 'Li e estou ciente' }));

    expect(
      await screen.findByText('O aviso foi atualizado. Leia a nova versão antes de confirmar.'),
    ).toBeOnTheScreen();
    expect(get).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Olá, Rafael')).not.toBeOnTheScreen();
  });

  it('falha ao registrar mostra erro e continua no aviso', async () => {
    jest.spyOn(noticeRepository, 'acknowledge').mockRejectedValueOnce(new Error('rede'));
    await renderApp({ user: PENDING_ANALYST });

    await fireEvent.press(await screen.findByRole('button', { name: 'Li e estou ciente' }));

    expect(await screen.findByText('Não foi possível registrar a ciência. Tente de novo.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Li e estou ciente' })).toBeOnTheScreen();
  });

  it('POST /campaigns com 403 de ciência leva ao aviso (sem caixa de erro) e, depois, à Home', async () => {
    jest.spyOn(campaignRepository, 'create').mockRejectedValue(NOTICE_403());
    await renderApp({ user: ADMIN });

    await fireEvent.press(screen.getByRole('button', { name: 'Nova campanha' }));
    await fireEvent.changeText(screen.getByLabelText('Nome da campanha'), 'Simulação Q4');
    await fireEvent.press(screen.getByRole('radio', { name: 'Urgência' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Agendar campanha' }));

    expect(await screen.findByRole('button', { name: 'Li e estou ciente' })).toBeOnTheScreen();
    expect(
      screen.queryByText('Confirme que leu o aviso de monitoramento para usar o Baluarte'),
    ).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Li e estou ciente' }));
    expect(await screen.findByText('Olá, Leonardo')).toBeOnTheScreen();
  });

  it('o aviso não depende do perfil: o Colaborador também vê', async () => {
    await renderApp({ user: { ...DEMO_USERS[2], noticePending: true } });
    expect(await screen.findByRole('button', { name: 'Li e estou ciente' })).toBeOnTheScreen();
  });

  it('dá para sair da conta pelo aviso', async () => {
    await renderApp({ user: PENDING_ANALYST });
    await fireEvent.press(await screen.findByRole('button', { name: 'Sair da conta' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).toBeOnTheScreen());
  });

  it('erro ao carregar o aviso oferece tentar de novo', async () => {
    jest.spyOn(noticeRepository, 'get').mockRejectedValueOnce(new Error('rede'));
    await renderApp({ user: PENDING_ANALYST });

    expect(await screen.findByText('Não foi possível carregar o aviso de monitoramento.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('button', { name: 'Li e estou ciente' })).toBeOnTheScreen();
  });
});
