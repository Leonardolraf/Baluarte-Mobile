import type { NativeStackScreenProps } from '@react-navigation/native-stack';
/** Rotas públicas (antes do login). */
export type AuthStackParamList = {
  Login: undefined;
};

/** Rotas autenticadas (Administrador e Analista). */
export type AppStackParamList = {
  Home: undefined;
  NewCampaign: undefined;
  CampaignDetails: { campaignId: string };
};

/** As duas pilhas juntas (configuração das URLs na web). */
export type RootStackParamList = AuthStackParamList & AppStackParamList;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;
