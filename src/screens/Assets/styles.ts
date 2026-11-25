import { StyleSheet } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  list: {
    paddingTop: spacing.xxl,
    paddingHorizontal: layout.screenPadding,
  },
  listHeader: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  score: {
    width: layout.iconBlock,
    height: layout.iconBlock,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.surface,
  },
  scoreValue: {
    ...typography.numeral,
  },
  scoreCaption: {
    ...typography.capsSmall,
    color: colors.text.muted,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    ...typography.strong,
    flex: 1,
    color: colors.text.primary,
  },
  meta: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.text.secondary,
  },
  open: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  inactive: {
    ...typography.badge,
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
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
  retry: {
    ...typography.body,
    fontFamily: typography.greetingStrong.fontFamily,
    color: colors.text.primary,
  },
  // ----- Detalhe -----
  scroll: {
    padding: layout.screenPadding,
    gap: spacing.lg,
  },
  title: {
    ...typography.campaignName,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xxs,
    color: colors.text.secondary,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  fieldValue: {
    ...typography.label,
    flexShrink: 1,
    color: colors.text.primary,
    textAlign: 'right',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  description: {
    ...typography.paragraph,
    color: colors.text.secondary,
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
