import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, ListHeader, Screen } from '../../components';
import { useAuth } from '../../contexts';
import { assetRepository } from '../../data/repository';
import {
  ASSET_SEVERITIES,
  formatOpenFindings,
  formatRiskScore,
  sortByRisk,
} from '../../lib/assets';
import { colors, spacing } from '../../theme';
import type { Asset } from '../../types';
import type { AppScreenProps } from '../../types/navigation';
import {
  DENIED_MESSAGE,
  FORBIDDEN_MESSAGE,
  stateFromError,
  type LoadState,
} from './load';
import { styles } from './styles';

/** Cor da nota: a da severidade aberta mais grave; sem abertos ou sem dado, neutra. */
export function riskTone(asset: Asset): string {
  if (!asset.openBySeverity) return colors.text.muted;
  const worst = ASSET_SEVERITIES.find((s) => (asset.openBySeverity?.[s] ?? 0) > 0);
  return worst ? colors.severity[worst] : colors.text.muted;
}

function AssetRow({ asset, onPress }: { asset: Asset; onPress: () => void }) {
  const tone = riskTone(asset);
  const score = formatRiskScore(asset.riskScore);
  const open = formatOpenFindings(asset.openFindings);
  return (
    <View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${asset.name}. ${asset.type}, ${asset.host}. Nota de risco ${score}. Achados: ${open}.`}
        accessibilityHint="Abre os detalhes do ativo"
        testID={`asset-item-${asset.id}`}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.score, { borderColor: tone }]}>
          <Text style={[styles.scoreValue, { color: tone }]}>{score}</Text>
          <Text style={styles.scoreCaption}>RISCO</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.line}>
            <Text style={styles.name} numberOfLines={1}>
              {asset.name}
            </Text>
            {asset.status === 'inactive' ? <Text style={styles.inactive}>Inativo</Text> : null}
          </View>
          <View style={styles.line}>
            <Text style={styles.meta} numberOfLines={1}>
              {asset.type} · {asset.host}
            </Text>
            <Text style={styles.open}>{open}</Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.divider} />
    </View>
  );
}

/** Lista de ativos, só leitura (GET /assets): maior risco primeiro. */
export function AssetsScreen({ navigation }: AppScreenProps<'Assets'>) {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<LoadState<Asset[]>>({ kind: 'loading' });
  const { requireNotice } = useAuth();

  const load = useCallback(() => {
    let active = true;
    setState({ kind: 'loading' });
    assetRepository
      .list()
      .then((assets) => {
        if (active) setState({ kind: 'ready', data: sortByRisk(assets) });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const next = stateFromError<Asset[]>(error);
        if (next.kind === 'notice') requireNotice();
        setState(next);
      });
    return () => {
      active = false;
    };
  }, [requireNotice]);

  useEffect(() => load(), [load]);

  const assets = state.kind === 'ready' ? state.data : [];

  const empty =
    // 'notice': a tela do aviso já está entrando no lugar desta; nunca "nenhum ativo".
    state.kind === 'loading' || state.kind === 'notice' ? (
      <Text style={styles.empty}>Carregando ativos…</Text>
    ) : state.kind === 'forbidden' ? (
      <Text style={styles.empty}>{FORBIDDEN_MESSAGE}</Text>
    ) : state.kind === 'denied' ? (
      <Text style={styles.empty}>{DENIED_MESSAGE}</Text>
    ) : state.kind === 'error' ? (
      <View style={styles.emptyBox}>
        <Text style={styles.empty}>{state.message}</Text>
        <Pressable
          onPress={load}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.retry}>Tentar de novo</Text>
        </Pressable>
      </View>
    ) : (
      <Text style={styles.empty}>Nenhum ativo cadastrado.</Text>
    );

  return (
    <Screen edges={['bottom']}>
      <Header title="Ativos" onBack={() => navigation.goBack()} />
      <FlatList
        data={assets}
        keyExtractor={(asset) => asset.id}
        renderItem={({ item }) => (
          <AssetRow
            asset={item}
            onPress={() => navigation.navigate('AssetDetails', { assetId: item.id })}
          />
        )}
        ListHeaderComponent={
          state.kind === 'ready' ? (
            <ListHeader title="Ativos" subtitle={`Total ${assets.length}`} style={styles.listHeader} />
          ) : null
        }
        ListEmptyComponent={empty}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
