import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, SectionList } from 'react-native';
import { database, auth } from './firebaseConfig';
import { ref, onValue, remove, push, serverTimestamp } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';

const TelaDeHorarios = () => {
    const [horariosData, setHorariosData] = useState([]);
    const [historicoHorarios, setHistoricoHorarios] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Função para autenticar e buscar email do usuário
    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
                setLoading(false);
            } else {
                router.push('/login');
            }
        });
        return () => authUnsubscribe();
    }, [router]);

    // Função para buscar horários e histórico
    useEffect(() => {
        if (userEmail) {
            const horariosRef = ref(database, 'horarios');
            const historicoRef = ref(database, 'historico_horarios');
    
            const now = new Date(); // Data e hora atuais
    
            const horariosListener = onValue(horariosRef, (snapshot) => {
                const data = snapshot.val();
                console.log("Dados recebidos do Firebase:", data); // Log para verificar a estrutura
            
                const horarios = data
                    ? Object.entries(data).map(([id, value]) => {
                        console.log(`Processando item: id=${id}, value=`, value);
                        if (!value) return null;
            
                        return { id, ...value }; // Adiciona id ao objeto
                    }).filter((horario) => {
                        if (!horario) return false;
                        if (horario.nomeUsuario !== userEmail) return false;
            
                        const horarioData = parseDateAndTime(horario.dia, horario.horario);
                        if (horarioData < new Date() && horario.status !== 'concluído') {
                            console.log("Movendo para histórico:", horario);
                            moveToHistorico(horario.id, horario); // Remove e adiciona ao histórico
                            return false; // Não exibe horários passados
                        }
                        return true;
                    })
                    : [];
                setHorariosData(horarios);
            });
            
            
    
            const historicoListener = onValue(historicoRef, (snapshot) => {
                const data = snapshot.val();
                const historico = data
                    ? Object.entries(data).map(([key, value]) => ({ id: key, ...value }))
                        .filter((horario) => horario.nomeUsuario === userEmail)
                    : [];
                setHistoricoHorarios(historico);
            });
    
            return () => {
                horariosListener();
                historicoListener();
            };
        }
    }, [userEmail]);
    
    // Converte dia e horário para um objeto Date
    const parseDateAndTime = (dia, horario) => {
    if (!dia || !horario) {
        console.error("Data ou horário inválido:", dia, horario);
        return new Date(); // Retorna data atual como fallback
    }
    const [day, month, year] = dia.split('/');
    return new Date(`${year}-${month}-${day}T${horario}:00`);
};

    
const moveToHistorico = async (id, horario) => {
    try {
        if (!id || !horario) {
            console.error("Horário ou ID inválido para mover ao histórico:", id, horario);
            return;
        }

        const historicoRef = ref(database, 'historico_horarios');

        // Verifica se o horário já está no histórico
        const historicoSnapshot = await onValue(historicoRef, (snapshot) => snapshot.val());
        const historicoExistente = historicoSnapshot
            ? Object.values(historicoSnapshot).some(
                  (item) => item.id === id && item.status === 'concluído'
              )
            : false;

        if (historicoExistente) {
            console.log(`Horário ${id} já está no histórico. Ignorando...`);
            return;
        }

        // Remove do nó de horários e adiciona ao histórico
        const horarioRef = ref(database, `horarios/${id}`);
        await remove(horarioRef);

        await push(historicoRef, { ...horario, timestamp: serverTimestamp(), status: 'concluído' });

        console.log(`Horário ${id} movido para o histórico com sucesso!`);
    } catch (error) {
        console.error('Erro ao mover horário para o histórico:', error);
    }
};

    
    

    // Função de confirmação e desmarcar horário
    const handleDesmarcar = (horario) => {
        Alert.alert(
            'Confirmação',
            'Você realmente deseja desmarcar este horário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desmarcar',
                    onPress: async () => {
                        try {
                            const nodePath = `horarios/${horario.id}`;
                            await removeHorarioNode(nodePath, horario);
                            setHorariosData((prev) => prev.filter((item) => item.id !== horario.id));
                            Alert.alert('Sucesso', 'Horário desmarcado com sucesso!');
                        } catch (error) {
                            console.error('Erro ao desmarcar horário:', error);
                            Alert.alert('Erro', 'Não foi possível desmarcar o horário.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    // Função para remover um horário e adicionar ao histórico
    const removeHorarioNode = async (nodePath, horario) => {
        try {
            const horarioRef = ref(database, nodePath);
            await remove(horarioRef);

            const historicoRef = ref(database, 'historico_horarios');
            await push(historicoRef, { ...horario, timestamp: serverTimestamp(), status: 'desmarcado' });

            console.log('Nó removido com sucesso e adicionado ao histórico!');
        } catch (error) {
            console.error('Erro ao remover o nó ou adicionar ao histórico:', error);
        }
    };

    // Renderização de itens de horários
    const renderItem = ({ item }) => (
        <View style={styles.horarioContainer}>
            <Text>{`${item.dia} - ${item.horario}`}</Text>
            <Button title="DESMARCAR" onPress={() => handleDesmarcar(item)} color="#FF6347" />
        </View>
    );

    // Renderização de itens de histórico
    const renderHistoricoItem = ({ item }) => (
        <View style={styles.historicoItem}>
            <Text>{`${item.dia} - ${item.horario} (${item.status})`}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <BackButton />
            <Text style={styles.title}>Meus Horários</Text>

            {loading ? (
                <Text>Carregando...</Text>
            ) : (
                <SectionList
                    sections={[
                        { title: 'Horários Marcados', data: horariosData },
                        { title: 'Histórico de Horários', data: historicoHorarios },
                    ]}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item, section }) => {
                        if (section.title === 'Horários Marcados') {
                            return renderItem({ item });
                        } else {
                            return renderHistoricoItem({ item });
                        }
                    }}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    ListEmptyComponent={<Text>Você não tem horários marcados.</Text>}
                    style={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    horarioContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
        elevation: 1,
    },
    historicoItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listContainer: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        padding: 10,
    },
});

export default TelaDeHorarios;
