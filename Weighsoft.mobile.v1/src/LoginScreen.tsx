import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from './AuthContext';

const BLUE = '#1F3864';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@weighsoft.demo');
  const [password, setPassword] = useState('Password1!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Invalid email or password.');
      } else if (err?.status === 0 || err?.message?.includes('reach')) {
        setError('Could not reach the server. Make sure the backend is running on ' + require('./apiClient').API_BASE_URL);
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>WEIGHSOFT</Text>
            <Text style={styles.tagline}>Weighbridge Management</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.co.za"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, isSubmitting && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.buttonText}>Sign In</Text>
              }
            </TouchableOpacity>

            <Text style={styles.hint}>
              Demo: admin@weighsoft.demo{'\n'}Password: Password1!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#AABFDE',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  button: {
    height: 50,
    backgroundColor: BLUE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});