import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ErrorBanner, Screen } from '../../components';
import { useAuth } from '../../contexts';
import { noticeRepository } from '../../data/repository';
import { ApiError } from '../../lib/api/client';
import { colors, layout, spacing, typography } from '../../theme';
import type { MonitoringNotice } from '../../types';

export const NOTICE_LOAD_ERROR = 'Não foi possível carregar o aviso de monitoramento.';
export const NOTICE_ACK_ERROR = 'Não foi possível registrar a ciência. Tente de novo.';
export const NOTICE_UPDATED = 'O aviso foi atualizado. Leia a nova versão antes de confirmar.';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; notice: MonitoringNotice }
  | { kind: 'error' };

/**
 * Aviso de monitoramento, antes de qualquer dado: aparece logo depois do login
 * (quando o /me diz que falta a ciência) ou quando uma rota responde 403
 * CIENCIA_AVISO_PENDENTE. O texto e a versão vêm do servidor; o app só exibe e
 * registra a ciência da versão que a pessoa leu. Depois volta para a Home.
 */
export function NoticeScreen() {
  const { noticeAcknowledged, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'ready', notice: await noticeRepository.get() });
    } catch {
      setState({ kind: 'error' });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function acknowledge(notice: MonitoringNotice) {
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      // 201 (primeira vez) ou 200 (já registrada): os dois liberam.
      await noticeRepository.acknowledge(notice.version);
      noticeAcknowledged();
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError && error.code === 'VERSAO_DESATUALIZADA') {
        // O texto mudou desde a leitura: recarrega a versão atual para ler de novo.
        await load();
        setMessage(NOTICE_UPDATED);
      } else {
        setMessage(NOTICE_ACK_ERROR);
      }
    }
  }

  const signOutLink = (
    <Pressable
      onPress={signOut}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
    >
      <Text style={styles.signOutText}>Sair da conta</Text>
    </Pressable>
  );

  if (state.kind !== 'ready') {
    return (
      <Screen>
        <View style={styles.center}>
          {state.kind === 'loading' ? (
            <ActivityIndicator color={colors.text.secondary} />
          ) : (
            <>
              <Text style={styles.centerText}>{NOTICE_LOAD_ERROR}</Text>
              <Button title="Tentar de novo" variant="outline" onPress={() => void load()} />
              {signOutLink}
            </>
          )}
        </View>
      </Screen>
    );
  }

  const { notice } = state;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>ANTES DE CONTINUAR</Text>
        <Text style={styles.title} accessibilityRole="header">
          {notice.title}
        </Text>
        <Text style={styles.version}>Versão {notice.version}</Text>
        <Text style={styles.paragraph}>{notice.intro}</Text>

        {notice.sections.map((section) => (
          <View key={section.id} style={styles.section} testID={`notice-section-${section.id}`}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph, i) => (
              <Text key={`p${i}`} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
            {section.items.map((item, i) => (
              <Text key={`i${i}`} style={styles.item}>
                {'•  '}
                {item}
              </Text>
            ))}
            {section.notes.map((note, i) => (
              <Text key={`n${i}`} style={styles.paragraph}>
                {note}
              </Text>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          {message ? <ErrorBanner message={message} /> : null}
          <Button
            title={submitting ? 'Registrando…' : 'Li e estou ciente'}
            disabled={submitting}
            onPress={() => void acknowledge(notice)}
          />
          {signOutLink}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.xxl,
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
  kicker: {
    ...typography.caps,
    color: colors.text.muted,
  },
  title: {
    ...typography.pageTitle,
    color: colors.text.primary,
  },
  version: {
    ...typography.caption,
    color: colors.text.muted,
  },
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.text.primary,
  },
  paragraph: {
    ...typography.paragraph,
    color: colors.text.secondary,
  },
  item: {
    ...typography.paragraph,
    paddingLeft: spacing.sm,
    color: colors.text.secondary,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  signOut: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  pressed: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: layout.screenPadding,
  },
  centerText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
