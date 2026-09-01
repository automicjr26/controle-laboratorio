import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Dimensions,
    FlatList,
} from 'react-native';
import { database } from './firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import BackButton from '../components/BackButton';

const AgendaScreen = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedHour, setSelectedHour] = useState(null);
    const [userName, setUserName] = useState(null);
    const [appointments, setAppointments] = useState({});
    const router = useRouter();
    const [dayPickerVisible, setDayPickerVisible] = useState(false);
    const [hourPickerVisible, setHourPickerVisible] = useState(false);
    const [selectedHours, setSelectedHours] = useState([]); // Array para armazenar os horários selecionados

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || user.email || 'Usuário');
            } else {
                router.push('/login');
            }
        });

        const appointmentsRef = ref(database, 'horarios');
        const unsubscribeAppointments = onValue(appointmentsRef, (snapshot) => {
            setAppointments(snapshot.val() || {});
        });

        return () => {
            unsubscribeAuth();
            unsubscribeAppointments();
        };
    }, []);

    const changeMonth = (direction) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction));
    };

    const isPastDay = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isPastHour = (hour) => {
        if (!selectedDay) {
            return true; // Ou retorne true se quiser desabilitar todas as horas quando nenhum dia for selecionado
        }
        const now = new Date();
        const selectedDate = selectedDay ? selectedDay.date : new Date();
        const [hourPart, minutePart] = hour.split(':').map(Number);
        const selectedDateTime = new Date(selectedDate);
        selectedDateTime.setHours(hourPart, minutePart, 0, 0);
        return selectedDateTime < now;
    };

    const isHourBooked = (day, hour) => {
        if (!day || !hour) return false;
        const formattedDay = day.date.toLocaleDateString('pt-BR');
        const formattedKey = `${formattedDay.replace(/\//g, '_')}_${hour}`;
        return appointments[formattedKey];
    };

    const renderCalendarDays = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
        const calendarDays = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarDays.push({ id: `empty-${i}`, day: null, date: null });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            calendarDays.push({ id: day, day, date });
        }

        return calendarDays.map((item) => {
            const isPast = isPastDay(item.date);
            const isToday = item.date && item.date.toDateString() === today.toDateString();

            return (
                <View key={item.id} style={[styles.calendarDay, isPast && styles.pastDay, isToday && styles.today]}>
                    {item.day && (
                        <Text style={[styles.dayText, isPast && styles.pastDayText, isToday && styles.todayText]}>
                            {item.day}
                        </Text>
                    )}
                </View>
            );
        });
    };

    const generateHours = () => {
        const hours = [];
        for (let hour = 8; hour <= 22; hour++) {
            for (let minute = 0; minute <= 30; minute += 30) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                const timeString = `${formattedHour}:${formattedMinute}`;
                hours.push(timeString); // Adiciona todos os horários
            }
        }
        return hours;
    };

    const generateDays = () => {
        const days = [];
        const today = new Date();

        for (let i = 0; i < 31; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dayString = date.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            });

            days.push({ id: i, label: dayString, date });
        }

        return days;
    };

    const handleHourPress = (hour) => {
        if (isPastHour(hour) || (selectedDay && isHourBooked(selectedDay, hour))) {
            Alert.alert('Horário Indisponível', 'Este horário já passou ou foi agendado.');
            return;
        }


        if (selectedHours.includes(hour)) {
            setSelectedHours(selectedHours.filter((selectedHour) => selectedHour !== hour));
        } else {
            setSelectedHours([...selectedHours, hour]);
        }
    };


    const renderHourOptions = () => {
        const allHours = generateHours();

        return allHours.map((hour) => {
            const isPast = isPastHour(hour);
            const isBooked = selectedDay && isHourBooked(selectedDay, hour);
            const isDisabled = isPast || isBooked;
            const isSelected = selectedHours.includes(hour); // Verifica se o horário está no array selectedHours

            let statusMessage = null;
            if (isPast) {
                statusMessage = "Já passou";
            } else if (isBooked) {
                statusMessage = "Já agendado";
            }

            return (
                <TouchableOpacity
                    key={hour}
                    style={[
                        styles.pickerOption,
                        isDisabled && styles.disabledHour,
                        isSelected && styles.selectedHour,
                    ]}
                    onPress={() => handleHourPress(hour)} // Chama handleHourPress para adicionar/remover o horário
                >
                <Text style={[styles.pickerOptionText, isDisabled && styles.disabledHourText, isSelected && styles.selectedHourText]}>
                        {hour} {statusMessage ? `(${statusMessage})` : ''}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    const handleConfirmHours = async () => {
        if (!selectedDay || selectedHours.length === 0 || !userName) {
            Alert.alert('Erro', 'Por favor, selecione um dia, horário(s) e faça login.');
            return;
        }

        if (selectedHours.some(hour => isPastHour(hour))) {
            Alert.alert('Erro', 'Um ou mais horários selecionados já passaram.');
            return;
        }

        if (selectedHours.some(hour => isHourBooked(selectedDay, hour))) {
            Alert.alert('Erro', 'Um ou mais horários selecionados já foram agendados.');
            return;
        }

        const formattedDay = selectedDay.date.toLocaleDateString('pt-BR');
        const selectedHoursString = selectedHours.join(', '); // Formata os horários para exibição

        // Mostra a mensagem de confirmação *antes* de enviar para o banco de dados
        Alert.alert(
            'Confirmar Horários',
            `Deseja confirmar os seguintes horários para ${formattedDay}:\n${selectedHoursString}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Confirmar',
                    onPress: async () => { // Função assíncrona dentro do onPress
                        try {
                            const promises = selectedHours.map((hour) => {
                                const formattedKey = `${formattedDay.replace(/\//g, '_')}_${hour}`;
                                const horarioData = {
                                    dia: formattedDay,
                                    horario: hour,
                                    nomeUsuario: userName,
                                };
                                return set(ref(database, `horarios/${formattedKey}`), horarioData);
                            });

                            await Promise.all(promises);

                            Alert.alert('Sucesso!', 'Horários marcados com sucesso!');
                            setSelectedHours([]);
                            setSelectedDay(null);
                            setSelectedHour(null);
                            setHourPickerVisible(false);

                        } catch (error) {
                        console.error("Erro ao marcar horários:", error);
                            Alert.alert('Erro', 'Ocorreu um erro ao marcar os horários.');
                        }
                    },
                },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!selectedDay || !selectedHour || !userName) {
            Alert.alert('Erro', 'Por favor, selecione um dia, horário e faça login.');
            return;
        }

        if (isPastDay(selectedDay.date)) {
            Alert.alert('Erro', 'Este dia já passou.');
            return;
        }

        if (isHourBooked(selectedDay, selectedHour)) {
            Alert.alert('Erro', 'Este horário já foi agendado.');
            return;
        }

        const formattedDay = selectedDay.date.toLocaleDateString('pt-BR');
        const formattedKey = `${formattedDay.replace(/\//g, '_')}_${selectedHour}`;

        const horarioData = {
            dia: formattedDay,
            horario: selectedHour,
            nomeUsuario: userName,
        };

        try {
            await set(ref(database, `horarios/${formattedKey}`), horarioData);
            Alert.alert('Sucesso!', 'Horário marcado com sucesso!');
            setAppointments({ ...appointments, [formattedKey]: horarioData });
            setSelectedDay(null);
            setSelectedHour(null);
        } catch (error) {
            console.error("Erro ao marcar horário:", error);
            Alert.alert('Erro', 'Ocorreu um erro ao marcar o horário.');
        }
    }
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
            <BackButton onPress={() => router.back()} />
            <Text style={styles.title}>Agendamento</Text>
            <Text style={styles.subtitle}>Selecione o dia e o horário desejado</Text>

            {/* Calendário */}
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.weekdaysContainer}>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                        <Text key={day} style={styles.weekdayText}>{day}</Text>
                    ))}
                </View>
                <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
            </View>

            {/* Seleção de Dia */}
            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Dia:</Text>
                <TouchableOpacity
                    style={styles.botao_dias}
                    onPress={() => setDayPickerVisible(true)}
                >
                    <Text style={styles.pickerText}>
                        {selectedDay ? selectedDay.label : 'Selecione o dia'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Seleção de Horário */}
            <View style={styles.pickerContainer}> {/* Container para o picker de horário */}
                <Text style={styles.pickerLabel}>Horário:</Text>
                <TouchableOpacity style={styles.botao_dias} onPress={() => setHourPickerVisible(true)}>
                <Text style={styles.pickerText}>
                    {selectedHour || 'Selecione o horário'}
                </Text>
                </TouchableOpacity>
            </View>


            <Modal visible={hourPickerVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione o horário</Text>

                        <ScrollView style={styles.hourPickerScrollView}> {/* ScrollView para os horários */}
                            {renderHourOptions()}
                        </ScrollView>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setHourPickerVisible(false)}>
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmHours}>
                        <Text style={styles.confirmButtonText}>Confirmar Horários</Text> </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Confirmar Agendamento</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.goToMyHoursButton]}
                onPress={() => router.push('/meushorarios')}>
                <Text style={styles.buttonText}>Meus Horários</Text>
            </TouchableOpacity>


            <Modal visible={dayPickerVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.pickerLabel}>Selecione o dia</Text>
                        <ScrollView style={styles.pickerScroll}>
                            {generateDays().map((day) => (
                                <TouchableOpacity
                                    key={day.id}
                                    style={styles.pickerOption}
                                    onPress={() => {
                                        setSelectedDay(day);
                                        setDayPickerVisible(false);
                                    }}
                                >
                                    <Text style={styles.pickerOptionText}>{day.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setDayPickerVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    confirmButton: { // Estilo para o botão de confirmação
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20, // Adicione alguma margem superior
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedHour: {
        backgroundColor: '#4CAF50', // Cor de fundo para o horário selecionado
    },
    selectedHourText: {
        color: 'white', // Cor do texto para o horário selecionado
        fontWeight: 'bold',
    },
    hourPickerScrollView: {
        height: 200, // Altura fixa
        marginBottom: 15,
    },
    pickerContainer: { // Estilos para o container do picker
        marginBottom: 20,
    },
    modalTitle: { // Estilo para o título do modal
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },  
    hourPickerScrollView: { // Estilos para o ScrollView de horários
        maxHeight: 200,  // Define uma altura máxima para o ScrollView
        marginBottom: 15, // Adiciona margem inferior
    },
    container: {
        flex: 1,
        padding: 20,
        position: 'relative',
        backgroundColor: '#f5f5f5',
    },
    scrollViewContent: {
        flexGrow: 1, // Permite que o ScrollView funcione corretamente com o conteúdo
    },
    title: {
        alignSelf: 'center',
        top: 10,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        top: 10,
        fontSize: 18,
        color: '#777',
        marginBottom: 20,
    },
    calendarContainer: {
        marginBottom: 20,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    arrowButton: {
        padding: 10,
    },
    arrowText: {
        fontSize: 20,
    },
    monthText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    weekdaysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5,
    },
    weekdayText: {
        fontSize: 14,
        color: '#777', // Cor mais clara para os dias da semana
        width: Dimensions.get('window').width / 7 - 10, // Responsivo para dias da semana
        textAlign: 'center',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: Dimensions.get('window').width / 7 - 10, // Responsivo para os dias
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        margin: 2,
    },
    dayText: {
        fontSize: 16,
    },
    pastDay: {
        opacity: 0.5,
    },
    pastDayText: {
        color: '#aaa',
    },
    today: {
        backgroundColor: '#4D5CFF',
    },
    todayText: {
        color: 'white',
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerLabel: {
        fontSize: 18,
        marginBottom: 5,
    },
    botao_dias: {
        padding: 12, // Aumenta o padding para melhor usabilidade
        backgroundColor: '#eee',
        borderRadius: 5, // Adiciona um pequeno raio de borda
    },
    pickerText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    goToMyHoursButton: {
        backgroundColor: '#3f51b5',
    },


    // Estilos para os modais
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    pickerScroll: {
        maxHeight: 200,
    },
    pickerOption: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pickerOptionText: {
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#f44336', // Vermelho para o botão de fechar
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',

    },

    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledHour: {
        backgroundColor: '#f2f2f2',
    },
    disabledHourText: {
        color: '#aaa',
    },
});

export default AgendaScreen;
