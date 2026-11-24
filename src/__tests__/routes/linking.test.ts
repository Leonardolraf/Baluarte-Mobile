import { webLinking } from '../../routes/linking';

/** Pilha montada a partir de uma URL (nome de cada rota, de baixo para cima). */
function stackFor(path: string) {
  return webLinking.getStateFromPath?.(path, webLinking.config)?.routes.map((route) => route.name);
}

function focusedRoute(path: string) {
  const routes = webLinking.getStateFromPath?.(path, webLinking.config)?.routes;
  return routes?.[routes.length - 1];
}

describe('URLs na web (routes/linking.ts)', () => {
  it('cada tela tem um caminho em português', () => {
    expect(focusedRoute('/')).toMatchObject({ name: 'Login' });
    expect(focusedRoute('/campanhas')).toMatchObject({ name: 'Home' });
    expect(focusedRoute('/campanhas/nova')).toMatchObject({ name: 'NewCampaign' });
    expect(focusedRoute('/campanhas/camp-001')).toMatchObject({
      name: 'CampaignDetails',
      params: { campaignId: 'camp-001' },
    });
  });

  it('versão enxuta: redefinição de senha e treinamento não têm mais rota', () => {
    const names = Object.keys(webLinking.config?.screens ?? {});
    expect(names).toEqual(['Login', 'Home', 'NewCampaign', 'CampaignDetails']);
  });

  it('tela aberta direto pela URL (ou página recarregada) ganha a tela de base embaixo', () => {
    expect(stackFor('/')).toEqual(['Login']);
    expect(stackFor('/campanhas')).toEqual(['Home']);
    expect(stackFor('/campanhas/camp-001')).toEqual(['Home', 'CampaignDetails']);
    expect(stackFor('/campanhas/nova')).toEqual(['Home', 'NewCampaign']);
  });

  it('parâmetros fora do caminho não vão para a URL', () => {
    const path = webLinking.getPathFromState?.(
      {
        index: 1,
        routes: [{ name: 'Home' }, { name: 'CampaignDetails', params: { campaignId: 'camp-001', extra: 'x' } }],
      },
      webLinking.config,
    );
    expect(path).toBe('/campanhas/camp-001');
  });
});
