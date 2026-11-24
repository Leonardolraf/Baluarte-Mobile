import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Login';
import type { AuthStackParamList } from '../types/navigation';
import { stackScreenOptions } from './options';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Fluxo público: só o Login. A redefinição de senha saiu na versão enxuta do app
 * (é feita no portal web do Baluarte).
 */
export function AuthRoutes() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
    </Stack.Navigator>
  );
}
