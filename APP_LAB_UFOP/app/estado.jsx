import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import BackButton from '../components/BackButton';
import { useRoute, useNavigation } from '@react-navigation/native';

const Estado = () => {
  const route = useRoute(); // Obtém os parâmetros da rota
  const navigation = useNavigation(); // Hook de navegação

  const { itens = [] } = route.params || {}; // Garante que itens seja um array vazio se não houver parâmetros

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <Text style={styles.cardText}>{`Local: ${item.local || 'Não especificado'}`}</Text>
      <Text style={styles.cardText}>{`Validade: ${item.validade || 'Sem validade'}`}</Text>
      <Text style={styles.cardText}>{`Embalagem: ${item.embalagem || '-'}`}</Text>
      <Text style={styles.cardText}>{`Frascos Fechados: ${item.quantidade_frascos_fechados || 0}`}</Text>
      <Text style={styles.cardText}>{`Frascos Abertos: ${item.quantidade_frascos_abertos || 0}`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Estado dos Itens</Text>
      {itens.length > 0 ? (
        <FlatList
          data={itens}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noItemsText}>Nenhum item selecionado.</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Estado;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#ff4d4d',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
