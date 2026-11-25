import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  CampaignListItem,
  ConfirmDialog,
  ListHeader,
  Screen,
  SquareButton,
  ToastOffset,
} from '../../components';
import { useAuth, useCampaigns } from '../../contexts';
import { canAccessAssets } from '../../lib/assets';
import { firstName } from '../../lib/format';
import { ROLE_LABEL } from '../../lib/labels';
import { icons, spacing } from '../../theme';
import type { AppScreenProps } from '../../types/navigation';
import { greetingBlockHeight, styles } from './styles';

export function HomeScreen({ navigation }: AppScreenProps<'Home'>) {
  const { user, signOut } = useAuth();
  const { campaigns, loading, error, reload } = useCampaigns();
  const insets = useSafeAreaInsets();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  if (!user) return null;

  const header = (
    <View>
      <View style={styles.profile}>
        <Pressable
          onPress={() => setConfirmingSignOut(true)}
          accessibilityRole="button"
          accessibilityLabel={`${user.name}, ${ROLE_LABEL[user.role]}. Sair da conta`}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Avatar name={user.name} />
        </Pressable>

        <View style={styles.greetingBox}>
          <Text style={styles.greeting} numberOfLines={1}>
            Olá, <Text style={styles.greetingName}>{firstName(user.name)}</Text>
          </Text>
          <Text style={styles.role} numberOfLines={1}>
            {ROLE_LABEL[user.role]} · {user.department}
          </Text>
        </View>

        {/* Ativos: só Administrador e Analista (o servidor confirma com 403 se não). */}
        {canAccessAssets(user.role) ? (
          <SquareButton
            icon={icons.Server}
            accessibilityLabel="Ativos"
            onPress={() => navigation.navigate('Assets')}
          />
        ) : null}

        <SquareButton
          icon={icons.Plus}
          accessibilityLabel="Nova campanha"
          onPress={() => navigation.navigate('NewCampaign')}
        />
      </View>

      <ListHeader
        title="Campanhas"
        subtitle={`Total ${campaigns.length}`}
        style={styles.listHeader}
      />
    </View>
  );

  return (
    <Screen edges={['top']}>
      {/* A Home não tem cabeçalho: o toast (ex.: ao voltar logo depois de agendar) fica abaixo da saudação. */}
      <ToastOffset offset={greetingBlockHeight} />
      <FlatList
        data={campaigns}
        keyExtractor={(campaign) => campaign.id}
        renderItem={({ item }) => (
          <CampaignListItem
            campaign={item}
            onPress={() => navigation.navigate('CampaignDetails', { campaignId: item.id })}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Carregando campanhas…</Text>
          ) : error ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{error}</Text>
              <Pressable
                onPress={reload}
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.retry}>Tentar de novo</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.empty}>Nenhuma campanha por enquanto.</Text>
          )
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmDialog
        visible={confirmingSignOut}
        title="Deseja sair do Baluarte?"
        message="Você volta para a tela de login."
        cancelLabel="Não"
        confirmLabel="Sim, sair"
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={() => {
          setConfirmingSignOut(false);
          signOut();
        }}
      />
    </Screen>
  );
}
