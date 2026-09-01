import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Linking } from 'react-native';
import { getAuth } from 'firebase/auth'; // Importando o Auth do Firebase
import { get, ref } from 'firebase/database'; // Importando funções do Firebase Realtime Database
import { database } from './firebaseConfig'; // Certifique-se de que o 'database' está exportado corretamente
import { useRouter } from 'expo-router';

export default function Home() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser; // Obtendo o usuário logado

    if (user) {
      // Buscando o nome do usuário no Realtime Database
      const userRef = ref(database, `/cadastros/${user.uid}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            // Se o usuário existe no banco de dados, pega o nome
            const userData = snapshot.val();
            setUserName(userData.nome || 'Usuário'); // Usando o nome do banco de dados
          } else {
            setUserName('Usuário'); // Caso o usuário não tenha nome registrado
          }
        })
        .catch(error => {
          console.error('Erro ao buscar o nome do usuário:', error);
          setUserName('Usuário'); // Em caso de erro, exibe "Usuário"
        });
    }
  }, []); // Executa uma vez após o componente ser montado

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>Olá, {userName}!</Text>  {/* Exibe o nome do usuário */}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/horarios')}>
          <Text style={styles.buttonText}>Calendário</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/meushorarios')}>
          <Text style={styles.buttonText}>Horários</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/estoque')}>
          <Text style={styles.buttonText}>Estoque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/perfil')}>
          <Text style={styles.buttonText}>Perfil</Text>
        </TouchableOpacity>
      </View>
       <TouchableOpacity style={styles.ajudaButton} onPress={() => setModalVisible(true)}>
                  <Text>
                    <Text style={styles.ajudacinzaText}>Problemas? </Text> 
                    <Text style={styles.ajudaText}>Entre em contato!</Text>
                  </Text>
                </TouchableOpacity>
      
                <Modal
                 animationType={"fade"}
                 transparent={true}
                 visible={modalVisible}
                 onRequestClose={() => {
                   setModalVisible(false); // Close modal when back button is pressed (Android)
                  }}
                  >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.titleSAC}>SAC Automic Jr.</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${'32 9 9824 4970'}`)} style={{flexDirection: 'row', justifyContent:'space-between'}} >
                        <Text style={styles.SACText}>Teste1: </Text>              
                        <Text style={styles.SACTextClick}>(32 9 9824-4970)</Text>
                      </TouchableOpacity>              
      
                      <TouchableOpacity onPress={() => Linking.openURL('https://ig.me/m/jr.automic')} style={{flexDirection: 'row', justifyContent:'space-between'}} >
                        <Text style={styles.SACText}>Teste2: </Text>              
                        <Text style={styles.SACTextClick}>Instagram</Text>  
                      </TouchableOpacity>
      
                      <Text style={styles.SACText}>Teste3</Text>
                      
                      <Pressable
                          style={styles.closeButton}
                          onPress={() => setModalVisible(false)}
                        >
                        <Text style={styles.closeButtonText}>Fechar</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  greetingText: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',//Deixa o nome maiúsculo
  },
  buttonRow: {
    top:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '80%',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versaoText: {
    position: 'absolute',
    bottom:30,
    fontsize: 14,
    color: 'gray',
  },
  ajudaButton: {
    position: 'absolute',
    bottom:6,
    alignItems: 'center',
    width:250,
  },
  ajudaText:{
    fontsize: 14,
    textDecorationLine: 'underline',
    color: 'blue',  
  },
  ajudacinzaText:{
    fontsize: 14,
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  SACText:{
    color:'black',
    fontSize: 18,
    bottom: 30,
  },
  SACTextClick:{
    color:'blue',
    fontSize: 18,
    bottom: 30,
    textDecorationLine: 'underline',
  },
  titleSAC: {
    fontSize: 24,
    marginBottom: 40,
  },
});
