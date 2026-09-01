import { StyleSheet, Text, View, Image, ScrollView, Alert, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { database } from './firebaseConfig';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullDatabase, setFullDatabase] = useState(null);
  const [error, setError] = useState(null); // Adiciona um estado para erros

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();

    const fetchFullDatabase = () => {
      const dbRef = ref(db);
      onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          setFullDatabase(snapshot.val());
        } else {
          console.log('No data found in the database.');
          setError('No data found in the database.');
        }
      }, (error) => {
        console.error("Error reading database:", error);
        setError('Error reading database: ' + error.message);
      });
    }

    const fetchUserData = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const userRef = ref(database, `/cadastros/${userId}`);
          get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              delete userData.senha;
              setUserProfile(userData);
            } else {
              Alert.alert('Erro', 'Não foi possível encontrar seus dados.');
              setError('User data not found.');
            }
          }).catch((error) => {
            console.error('Erro ao buscar dados do usuário:', error);
            Alert.alert('Erro', 'Houve um erro ao carregar seus dados.');
            setError('Error fetching user data: ' + error.message);
          }).finally(() => {
            setLoading(false);
          });
        } else {
          // Usuário não logado, pode redirecionar ou exibir mensagem
          Alert.alert('Erro', 'Usuário não logado');
          setError('User not logged in.');
          setLoading(false);
        }
      });
    };

    fetchFullDatabase();
    fetchUserData();
  }, []);

  const exportToExcel = async () => {
    if (!fullDatabase) {
      Alert.alert('Erro', 'Nenhum dado disponível para exportar.');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      const createSheet = (data, sheetName) => {
        if (!data || data.length === 0) {
          console.warn(`No data for sheet ${sheetName}`);
          return;
        }
        const sheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
      };

      // Dados para cada aba (substitua pelos seus dados reais)
      const alunosData = Object.entries(fullDatabase.cadastros || {}).map(([id, aluno]) => ({
        Nome: aluno.nome || '',
        Matrícula: aluno.matricula || '',
        Email: aluno.email || '',
        Orientador: aluno.orientador || '',
        'Nível de Formação': aluno.formacao || '',
        'Nível de Pesquisa': aluno.pesquisa || '',
        'Data de Defesa': aluno.data_defesa || '',
        'Projetos Relacionados': aluno.envolvido_projetos || '',
        'Outros Projetos': aluno.outros_projetos || '',
        'Alunos de Iniciação': aluno.alunos_iniciacao || '',
      }));

      const reagentesLiquidosData = Object.entries(fullDatabase.estoque?.reagentes_liquidos || {}).map(([nome, reagente]) => ({
        Nome: nome,
        Embalagem: reagente.embalagem || '',
        'Frascos Fechados': reagente.frasco_fechado || '',
        'Frascos Abertos': reagente.frascos_abertos || '',
        Validade: reagente.validade || '',
      }));

      const reagentesSolidosData = Object.entries(fullDatabase.estoque?.reagentes_solidos || {}).map(([nome, reagente]) => ({
        Nome: nome,
        Embalagem: reagente.embalagem || '',
        'Frascos Fechados': reagente.frasco_fechado || '',
        'Frascos Abertos': reagente.frascos_abertos || '',
        Validade: reagente.validade || '',
      }));

      const historicoData = Object.entries(fullDatabase.historico_horarios || {}).map(([id, historico]) => ({
        ID: id,
        Dia: historico.dia || '',
        Horário: historico.horario || '',
        Usuário: historico.nomeUsuario || '',
        Status: historico.status || '',
      }));

      // Criando as abas
      createSheet(alunosData, 'Alunos e Projetos');
      createSheet(reagentesLiquidosData, 'Reagentes Líquidos');
      createSheet(reagentesSolidosData, 'Reagentes Sólidos');
      createSheet(historicoData, 'Histórico de Horários');

      // Obter a data e hora atual
      const now = new Date();
      const dataAtual = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
      const horarioAtual = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');

      // Nome do arquivo da planilha
      const fileName = `AMB_LAB_${dataAtual}_${horarioAtual}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      await FileSystem.writeAsStringAsync(fileUri, excelBuffer, { encoding: FileSystem.EncodingType.Base64 });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartilhar Planilha',
        UTI: 'com.microsoft.excel.xlsx',
      });
      Alert.alert('Sucesso', 'Planilha gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar planilha:', error);
      Alert.alert('Erro', 'Falha ao gerar a planilha: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Carregando...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Nenhum dado encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton /> {/* Componente de voltar */}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Perfil</Text>

        {/* Cabeçalho do perfil */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userProfile.profileImage || 'default-image-url' }} // Imagem do perfil
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>{userProfile.nome || 'Nome não informado'}</Text>
            <Text style={styles.profileRegistration}>Matrícula: {userProfile.matricula || 'Não disponível'}</Text>
          </View>
        </View>

        {/* Informações do usuário */}
        <View style={styles.infoContainer}>
          {Object.entries(userProfile).map(([key, value]) => {
            // Filtra os campos relevantes e ignora `senha` e outros indesejados
            if (
              key === 'senha' ||
              key === 'profileImage' ||
              key === 'matricula' ||
              key === 'nome'
            ) {
              return null;
            }

            return (
              <View key={key} style={styles.infoBlock}>
                <Text style={styles.infoLabel}>{formatLabel(key)}</Text>
                <Text style={styles.infoValue}>{value || 'Não informado'}</Text>
              </View>
            );
          })}
        </View>
        <Text style={styles.title}>Exportar dados do APP</Text>
          <Button title="Exportar Planilha XLSX" onPress={exportToExcel} />
      </ScrollView>

    </View>
  );
};

// Função para formatar os rótulos (ex.: `data_defesa` -> `Data de Defesa`)
const formatLabel = (label) => {
  return label
    .replace(/_/g, ' ') // Substitui underscores por espaços
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitaliza as palavras
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize', //Deixa o nome maiúsculo
  },
  profileRegistration: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    marginTop: 20,
  },
  infoBlock: {
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});