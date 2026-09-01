import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import AppNavigator from './AppNavigator'; // Caminho correto para o arquivo AppNavigator
const App = () => {
  return (
    <View style={styles.container}>
      <Text>Ícone de Teste</Text>
      <Image source={require('./assets/icons/horarios.png')} style={styles.icon} />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
  },
});

export default App;
