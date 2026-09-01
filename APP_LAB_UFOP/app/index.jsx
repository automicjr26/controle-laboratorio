import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Pressable, Linking} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig'; // Ajuste o caminho conforme necessário
import { signInWithEmailAndPassword } from './firebaseConfig'; // Corrigido para importar a função

const index = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();

  // Função para validar o email
  const isValidEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Função para validar a senha (CPF)
  const isValidSenha = (senha) => {
    const re = /^\d{11}$/; // Validar apenas números e 11 dígitos (CPF)
    return re.test(senha);
  };

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
  
    if (!isValidSenha(senha)) {
      setError('A senha deve conter apenas números e ter no mínimo 6 dígitos.');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha); // Usando a função importada corretamente
      console.log('Usuário logado:', userCredential.user.uid);
      router.push('/telainicial');
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <>
          <Text style={styles.title}>Laboratório</Text>
          <TextInput
            style={styles.input}
            placeholder="LogIn(Email)"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha (CPF)"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Texto clicável para redirecionar para a tela de cadastro */}
          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.cadastrarText}>Cadastrar-se</Text>
          </TouchableOpacity>

          <Text style={styles.versaoText}>Versão do app: 1.0.0</Text> 
        
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
                <Text style={styles.title}>SAC Automic Jr.</Text>
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
        
          
        </>
      )}
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
  },
  buttonText: {
    fontSize: 24,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
  },
  cadastrarText: {
    justifyContent: "flex-start",
    marginTop: 20,
    color: 'black',
    fontSize: 16,
    textDecorationLine: 'underline',
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
});
