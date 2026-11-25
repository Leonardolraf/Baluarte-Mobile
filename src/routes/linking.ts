import { getPathFromState, getStateFromPath, type LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';

type RootScreen = keyof RootStackParamList;

/**
 * Tela que fica embaixo quando uma tela é aberta direto pela URL (link colado ou
 * página recarregada): assim o "voltar" sempre tem para onde ir.
 */
const BASE_SCREEN: Record<RootScreen, RootScreen | null> = {
  Login: null,
  Home: null,
  NewCampaign: 'Home',
  CampaignDetails: 'Home',
  Assets: 'Home',
  AssetDetails: 'Home',
};

function isRootScreen(name: string): name is RootScreen {
  return Object.prototype.hasOwnProperty.call(BASE_SCREEN, name);
}

/**
 * URLs do app no navegador (só na web, ver `routes/index.tsx`): cada tela ganha um
 * caminho e uma entrada no histórico, então o botão Voltar do navegador volta dentro
 * do app em vez de sair dele. No aparelho (Expo Go, sem esquema próprio) não há deep link.
 *
 * A sessão fica só em memória: recarregar a página mostra o Login e, depois de entrar,
 * o app abre a tela da URL (com a Home embaixo).
 */
export const webLinking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Login: '',
      Home: 'campanhas',
      NewCampaign: 'campanhas/nova',
      CampaignDetails: 'campanhas/:campaignId',
      Assets: 'ativos',
      AssetDetails: 'ativos/:assetId',
    },
  },
  getStateFromPath: (path, options) => {
    const state = getStateFromPath(path, options);
    const route = state?.routes.length === 1 ? state.routes[0] : undefined;
    const base = route && isRootScreen(route.name) ? BASE_SCREEN[route.name] : null;
    if (!state || !route || !base) return state;
    return { ...state, index: 1, routes: [{ name: base }, route] };
  },
  // Parâmetros fora do caminho não viram query string (nada de dado na barra de endereço).
  getPathFromState: (state, options) => getPathFromState(state, options).split('?')[0],
};
