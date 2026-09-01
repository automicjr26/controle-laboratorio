import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { auth, database } from "./firebaseConfig"; // Certifique-se de que auth e database estão sendo exportados corretamente
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import BackButton from "../components/BackButton";

const Cadastro = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [orientador, setOrientador] = useState("");
  const [formacao, setFormacao] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [dataDefesa, setDataDefesa] = useState("");
  const [outrosProjetos, setOutrosProjetos] = useState("");
  const [envolvidoProjetos, setEnvolvidoProjetos] = useState("");
  const [alunosIniciacao, setAlunosIniciacao] = useState("");
  const [matricula, setMatricula] = useState(""); // Novo estado para a matrícula
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar a visibilidade da senha

  const isValidForm = () => {
    if (!nome || !email || !senha || !matricula) {
      Alert.alert(
        "Erro",
        "Os campos Nome, Email, Senha e Matrícula são obrigatórios."
      );
      return false;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    return true;
  };

  const handleCadastro = async () => {
    if (!isValidForm()) return;

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const userId = userCredential.user.uid;

      const userRef = ref(database, `/cadastros/${userId}`);
      await set(userRef, {
        nome,
        email,
        orientador,
        formacao,
        pesquisa,
        data_defesa: dataDefesa,
        outros_projetos: outrosProjetos,
        envolvido_projetos: envolvidoProjetos,
        alunos_iniciacao: alunosIniciacao,
        matricula, // Adicionado o campo matrícula ao banco de dados
      });

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");

      setNome("");
      setEmail("");
      setSenha("");
      setOrientador("");
      setFormacao("");
      setPesquisa("");
      setDataDefesa("");
      setOutrosProjetos("");
      setEnvolvidoProjetos("");
      setAlunosIniciacao("");
      setMatricula(""); // Limpar o campo matrícula
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Cadastro</Text>
      </View>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Digite seu email"
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!showPassword}
          placeholder="Digite sua senha"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Text>{showPassword ? "Ocultar" : "Mostrar"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Matrícula</Text>
      <TextInput
        style={styles.input}
        value={matricula}
        onChangeText={setMatricula}
        placeholder="Digite sua matrícula"
      />

      <Text style={styles.label}>Nome do orientador</Text>
      <TextInput
        style={styles.input}
        value={orientador}
        onChangeText={setOrientador}
        placeholder="Digite o nome do orientador"
      />

      <Text style={styles.label}>Nível de formação</Text>
      <TextInput
        style={styles.input}
        value={formacao}
        onChangeText={setFormacao}
        placeholder="Ex: Graduação, Mestrado..."
      />

      <Text style={styles.label}>Nível de pesquisa</Text>
      <TextInput
        style={styles.input}
        value={pesquisa}
        onChangeText={setPesquisa}
        placeholder="Ex: Básica, Aplicada..."
      />

      <Text style={styles.label}>Data de qualificação e defesa</Text>
      <TextInput
        style={styles.input}
        value={dataDefesa}
        onChangeText={setDataDefesa}
        placeholder="Ex: 01/01/2024"
      />

      <Text style={styles.label}>
        Lista de outros projetos relacionados ao projeto principal
      </Text>
      <TextInput
        style={styles.input}
        value={outrosProjetos}
        onChangeText={setOutrosProjetos}
        placeholder="Digite os projetos relacionados"
      />

      <Text style={styles.label}>
        Lista de outros projetos em que você está envolvido
      </Text>
      <TextInput
        style={styles.input}
        value={envolvidoProjetos}
        onChangeText={setEnvolvidoProjetos}
        placeholder="Digite os projetos"
      />

      <Text style={styles.label}>
        Informações sobre alunos de iniciação científica vinculados ao projeto
      </Text>
      <TextInput
        style={styles.input}
        value={alunosIniciacao}
        onChangeText={setAlunosIniciacao}
        placeholder="Digite informações sobre os alunos"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCadastro}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Cadastro;