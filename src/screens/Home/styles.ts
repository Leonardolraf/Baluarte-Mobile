import { StyleSheet } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

/** Saudação → título "Campanhas" (versão enxuta, sem o filtro por modelo). */
const LIST_HEADER_GAP = spacing.xxxl;
const LIST_TOP = spacing.md;

/**
 * Bloco da saudação no topo da lista (respiro + linha do avatar e do botão +).
 * A Home informa essa altura ao toast, que aparece logo abaixo da saudação,
 * como aparece abaixo do cabeçalho nas outras telas.
 */
export const greetingBlockHeight = LIST_TOP + layout.avatar;

export const styles = StyleSheet.create({
  list: {
    paddingTop: LIST_TOP,
    paddingHorizontal: layout.screenPadding,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  greetingBox: {
    flex: 1,
  },
  greeting: {
    ...typography.greeting,
    color: colors.text.primary,
  },
  greetingName: {
    fontFamily: typography.greetingStrong.fontFamily,
  },
  role: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
    color: colors.text.secondary,
  },
  listHeader: {
    marginTop: LIST_HEADER_GAP,
    marginBottom: spacing.lg,
  },
  empty: {
    ...typography.body,
    paddingVertical: spacing.xxl,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyBox: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retry: {
    ...typography.body,
    fontFamily: typography.greetingStrong.fontFamily,
    color: colors.text.primary,
  },
});
