  import { Stack } from 'expo-router';
  import { useEffect, useState } from 'react';


  export default function RootLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    // Verifica se o usuário está logado
    

    // Renderiza as telas de acordo com o status de login
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // Exibe a tela de login
          <Stack.Screen name="index" />
        ) : (
          // Exibe a tela inicial após o login
          <Stack.Screen name="telainicial" />
        )}
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="horarios" />
        <Stack.Screen name="meushorarios" />
        <Stack.Screen name="estoque" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="estado"/>
      </Stack>
    );
  }
