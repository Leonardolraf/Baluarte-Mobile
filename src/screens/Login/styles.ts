import { StyleSheet } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    // Versão enxuta: o formulário fica no centro da tela (no tablet sobra muita altura).
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },
  brand: {
    alignItems: 'center',
  },
  wordmark: {
    marginTop: spacing.xs,
  },
  title: {
    ...typography.heroTitle,
    marginTop: spacing.xxl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.md,
    // Bloco centralizado mais estreito que o formulário (quebra como no protótipo).
    paddingHorizontal: spacing.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  formError: {
    marginTop: spacing.lg,
  },
  submit: {
    marginTop: spacing.xxl,
  },
});
