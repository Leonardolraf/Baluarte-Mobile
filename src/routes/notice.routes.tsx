import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NoticeScreen } from '../screens/Notice';
import { stackScreenOptions } from './options';

const Stack = createNativeStackNavigator<{ Notice: undefined }>();

/**
 * Pilha de quem está logado mas ainda sem a ciência do aviso: só a tela do aviso.
 * Nenhuma rota de dados existe até a ciência (o servidor também barra com 403).
 */
export function NoticeRoutes() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Notice" component={NoticeScreen} options={{ title: 'Aviso de monitoramento' }} />
    </Stack.Navigator>
  );
}
