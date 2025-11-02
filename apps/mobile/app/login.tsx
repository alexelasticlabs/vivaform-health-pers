import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { login } from "../src/api/auth";
import { useUserStore } from "../src/store/user-store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setSession, isAuthenticated } = useUserStore((state) => ({
  setSession: state.setSession,
  isAuthenticated: state.isAuthenticated
}));

  useEffect(() => {
  if (isAuthenticated) {
    router.replace("/");
  }
}, [isAuthenticated]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.tokens);
      router.replace("/");
    }
  });

  const handleSubmit = () => {
    mutation.mutate({ email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в VivaForm</Text>
      <Text style={styles.subtitle}>Следите за питанием и прогрессом из приложения</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={mutation.isPending}>
          <Text style={styles.buttonText}>{mutation.isPending ? "Входим…" : "Войти"}</Text>
        </TouchableOpacity>
        {mutation.isError ? (
          <Text style={styles.error}>Не удалось авторизоваться. Проверьте данные.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
    backgroundColor: "#F2FBF4"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0A2E23"
  },
  subtitle: {
    fontSize: 16,
    color: "#35524A"
  },
  form: {
    marginTop: 16,
    gap: 12
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#D5E9D9"
  },
  button: {
    backgroundColor: "#1FA97D",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16
  },
  error: {
    marginTop: 8,
    fontSize: 14,
    color: "#D64550"
  }
});