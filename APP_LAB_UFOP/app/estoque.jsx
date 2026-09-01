import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import BackButton from '../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';

const { width } = Dimensions.get('window');

const Estoque = () => {
  const [item, setItem] = useState('');
  const [resultados, setResultados] = useState([]);
  const [itensEscolhidos, setItensEscolhidos] = useState([]);
  const [digitou, setDigitou] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [todosItens, setTodosItens] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const reagentesLiquidosRef = ref(database, 'estoque/reagentes_liquidos');
    const reagentesSolidosRef = ref(database, 'estoque/reagentes_solidos');

    const processarDados = (data, tipo) => {
      if (!data) return [];
      return Object.entries(data).map(([key, value]) => ({
        id: key,
        nome: key.replace(/_/g, ' '),
        validade: Array.isArray(value.validade) ? value.validade.join(', ') : value.validade || 'Sem validade',
        embalagem: value.embalagem || '-',
        tipo,
        local: value.local || 'Local não especificado',
        quantidade_frascos_fechados: value.estoque_frascos_fechados || 0,
        quantidade_frascos_abertos: value.frascos_abertos || 0,
      }));
    };

    const carregarDados = () => {
      const liquidosListener = onValue(reagentesLiquidosRef, (snapshot) => {
        const liquidos = processarDados(snapshot.val(), 'Líquido');
        setTodosItens((prev) => [...prev, ...liquidos]);
      });

      const solidosListener = onValue(reagentesSolidosRef, (snapshot) => {
        const solidos = processarDados(snapshot.val(), 'Sólido');
        setTodosItens((prev) => [...prev, ...solidos]);
      });

      return () => {
        liquidosListener();
        solidosListener();
      };
    };

    const unsubscribe = carregarDados();
    return () => unsubscribe();
  }, []);

  const pesquisarItem = (texto) => {
    setDigitou(true);
    setItem(texto);
    const resultadosFiltrados = todosItens.filter((i) =>
      i.nome.toLowerCase().includes(texto.toLowerCase())
    );
    setResultados(resultadosFiltrados);
  };

  const selecionarItem = (itemSelecionado) => {
    if (!itensEscolhidos.some((item) => item.id === itemSelecionado.id)) {
      setItensEscolhidos([...itensEscolhidos, { ...itemSelecionado, selecionado: false }]);
    }
    limparPesquisa();
  };

  const limparPesquisa = () => {
    setResultados([]);
    setItem('');
    setDigitou(false);
  };

  const retirarItens = () => {
    setModalVisible(true);
  };

  const confirmarRetirada = () => {
    setModalVisible(false);
    setItensEscolhidos([]);
    setResultados([]);
    Alert.alert('Itens retirados com sucesso!');
  };

  const toggleSelecionado = (id) => {
    setItensEscolhidos(
      itensEscolhidos.map((item) =>
        item.id === id ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const renderResultado = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => selecionarItem(item)}>
      <Text style={styles.cardTitle}>{item.nome} ({item.tipo})</Text>
      <Text style={styles.cardText}>Validade: {item.validade}</Text>
      <Text style={styles.cardText}>Embalagem: {item.embalagem}</Text>
      <Text style={styles.cardText}>Frascos fechados: {item.quantidade_frascos_fechados}</Text>
      <Text style={styles.cardText}>Frascos abertos: {item.quantidade_frascos_abertos}</Text>
    </TouchableOpacity>
  );

  const renderItemEscolhido = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome} ({item.tipo})</Text>
      <Text style={styles.cardText}>Validade: {item.validade}</Text>
      <Text style={styles.cardText}>Embalagem: {item.embalagem}</Text>
      <Text style={styles.cardText}>Frascos fechados: {item.quantidade_frascos_fechados}</Text>
      <Text style={styles.cardText}>Frascos abertos: {item.quantidade_frascos_abertos}</Text>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => toggleSelecionado(item.id)} style={styles.checkbox}>
          <View style={[styles.checkboxBox, item.selecionado && styles.selectedCheckbox]}>
            {item.selecionado && <Text style={styles.checkmark}>✔</Text>}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const verEstado = () => {
    const itensSelecionados = itensEscolhidos.filter((item) => item.selecionado);
    if (itensSelecionados.length === 0) {
      Alert.alert('Atenção', 'Nenhum item foi selecionado.');
      return;
    }
    navigation.navigate('estado', { itens: itensSelecionados });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Pesquisar Item:</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={pesquisarItem}
            placeholder="Digite o nome do item"
          />
        </View>

        {digitou && (
          <FlatList
            data={resultados}
            renderItem={renderResultado}
            keyExtractor={(item) => item.id}
            style={styles.resultadosList}
          />
        )}

        {itensEscolhidos.length > 0 && (
          <View style={styles.itensEscolhidosContainer}>
            <Text style={styles.label}>Itens Escolhidos:</Text>
            <FlatList
              data={itensEscolhidos}
              renderItem={renderItemEscolhido}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.removeButton} onPress={retirarItens}>
          <Text style={styles.buttonText}>Retirar Itens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stateButton} onPress={verEstado}>
          <Text style={styles.buttonText}>Ver Estado</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Retirada</Text>
            <Text style={styles.modalMessage}>Você tem certeza que deseja retirar esses itens?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={confirmarRetirada}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Estoque;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  title: {
    alignSelf:'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
    width: '100%'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultadosList: {
    marginBottom: 20,
  },
  itensEscolhidosContainer: {
    marginTop: 20,
  },
  card: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
  checkboxContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,  // Ajustado para o canto inferior direito
  },
  checkbox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  removeButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  stateButton: {
    backgroundColor: '#2196F3',  // Cor azul
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
