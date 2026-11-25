import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Button, Header, Screen, SectionCard } from '../../components';
import { assetRepository } from '../../data/repository';
import {
  ASSET_SEVERITIES,
  ASSET_STATUS_LABEL,
  SEVERITY_LABEL,
  UNKNOWN,
  formatOpenFindings,
  formatRiskScore,
} from '../../lib/assets';
import { formatDateTime } from '../../lib/format';
import { colors } from '../../theme';
import type { Asset } from '../../types';
import type { AppScreenProps } from '../../types/navigation';
import { riskTone } from '../Assets';
import { FORBIDDEN_MESSAGE, NOTICE_MESSAGE, stateFromError, type LoadState } from '../Assets/load';
import { styles } from '../Assets/styles';

function Field({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.field} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

/** Detalhe do ativo com os campos que o GET /assets já traz (sem endpoint novo). */
export function AssetDetailsScreen({ navigation, route }: AppScreenProps<'AssetDetails'>) {
  const { assetId } = route.params;
  const [state, setState] = useState<LoadState<Asset | undefined>>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    assetRepository
      .get(assetId)
      .then((asset) => {
        if (active) setState({ kind: 'ready', data: asset });
      })
      .catch((error: unknown) => {
        if (active) setState(stateFromError(error));
      });
    return () => {
      active = false;
    };
  }, [assetId]);

  const header = <Header title="Ativo" onBack={() => navigation.goBack()} />;

  if (state.kind !== 'ready' || !state.data) {
    const message =
      state.kind === 'forbidden'
        ? FORBIDDEN_MESSAGE
        : state.kind === 'notice'
          ? NOTICE_MESSAGE
          : state.kind === 'error'
            ? state.message
            : state.kind === 'ready'
              ? 'Ativo não encontrado'
              : null;
    return (
      <Screen edges={['bottom']}>
        {header}
        <View style={styles.center}>
          {message === null ? (
            <ActivityIndicator color={colors.text.secondary} />
          ) : (
            <>
              <Text style={styles.centerText}>{message}</Text>
              <Button title="Voltar para ativos" variant="outline" onPress={() => navigation.goBack()} />
            </>
          )}
        </View>
      </Screen>
    );
  }

  const asset = state.data;
  const tone = riskTone(asset);

  return (
    <Screen edges={['bottom']}>
      {header}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title} accessibilityRole="header">
            {asset.name}
          </Text>
          <Text style={styles.subtitle}>
            {asset.type} · {asset.host}
          </Text>
        </View>

        <SectionCard title="Risco" subtitle="Calculado pelo servidor a partir dos achados abertos.">
          <Field label="Nota de risco" value={formatRiskScore(asset.riskScore)} valueColor={tone} />
          <Field label="Achados abertos" value={formatOpenFindings(asset.openFindings)} />
          {ASSET_SEVERITIES.map((severity) => {
            const count = asset.openBySeverity?.[severity];
            const value = typeof count === 'number' ? String(count) : UNKNOWN;
            return (
              <View
                key={severity}
                style={styles.field}
                accessible
                accessibilityLabel={`${SEVERITY_LABEL[severity]}: ${value}`}
              >
                <View style={styles.severityLabel}>
                  <View style={[styles.severityDot, { backgroundColor: colors.severity[severity] }]} />
                  <Text style={styles.fieldLabel}>{SEVERITY_LABEL[severity]}</Text>
                </View>
                <Text style={styles.fieldValue}>{value}</Text>
              </View>
            );
          })}
        </SectionCard>

        <SectionCard title="Identificação">
          <Field label="Tipo" value={asset.type} />
          <Field label="Host" value={asset.host} />
          <Field label="IP" value={asset.ip ?? UNKNOWN} />
          <Field label="Situação" value={ASSET_STATUS_LABEL[asset.status]} />
          <Field
            label="Última varredura"
            value={asset.lastScanAt ? formatDateTime(asset.lastScanAt) : 'Nunca varrido'}
          />
        </SectionCard>

        {asset.description ? (
          <SectionCard title="Descrição">
            <Text style={styles.description}>{asset.description}</Text>
          </SectionCard>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
