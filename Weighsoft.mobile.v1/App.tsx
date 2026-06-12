import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';

const BLUE = '#1F3864';
// Change this to your computer's IP
const API = 'http://192.168.101.122:8000/api';

export default function App() {
  const [email, setEmail] = useState('admin@weighsoft.demo');
  const [password, setPassword] = useState('Password1!');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [hauliers, setHauliers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadHauliers = async (jwt: string) => {
    try {
      // No company_id filter — load all hauliers
      const res = await fetch(`${API}/haulier`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const json = await res.json();
      setHauliers(Array.isArray(json) ? json : []);
    } catch (e: any) {
      setError('Could not load hauliers: ' + e.message);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || json.message || 'Login failed');
        return;
      }
      setToken(json.token);
      setUser(json);
      await loadHauliers(json.token);
    } catch (e: any) {
      setError('Cannot reach server. Check your IP and that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await loadHauliers(token);
    setRefreshing(false);
  };

  // ── Hauliers screen ──────────────────────────────────────────────────────

  if (token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>WEIGHSOFT</Text>
            <Text style={styles.appSub}>
              {user?.firstname} {user?.lastname}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { setToken(null); setUser(null); setHauliers([]); }}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HAULIERS ({hauliers.length})</Text>
        </View>

        <FlatList
          data={hauliers}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BLUE} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No hauliers found</Text>
              <Text style={styles.emptyHint}>Pull down to refresh</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowAvatar}>
                <Text style={styles.rowAvatarText}>
                  {(item.code || 'H').charAt(0)}
                </Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowCode}>{item.code}</Text>
              </View>
              {item.company && (
                <Text style={styles.rowCompany}>{item.company}</Text>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    );
  }

  // ── Login screen ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE }}>
      <View style={styles.loginContainer}>
        <Text style={styles.logo}>WEIGHSOFT</Text>
        <Text style={styles.tagline}>Weighbridge Management</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

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
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Login
  loginContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#AABFDE', textAlign: 'center', marginBottom: 32, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },
  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { color: '#991B1B', fontSize: 13 },
  label: { fontSize: 13, color: '#374151', marginTop: 12, marginBottom: 6 },
  input: { height: 46, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, fontSize: 15 },
  button: { height: 48, backgroundColor: BLUE, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // App header
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 12 },
  appTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  appSub: { fontSize: 12, color: '#AABFDE', marginTop: 2 },
  signOutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#AABFDE', borderRadius: 6 },
  signOutText: { color: '#fff', fontSize: 13 },
  // List
  sectionHeader: { backgroundColor: '#E8EDF5', paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: BLUE, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14 },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8EDF5', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  rowAvatarText: { fontSize: 16, fontWeight: '700', color: BLUE },
  rowContent: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#111' },
  rowCode: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rowCompany: { fontSize: 12, color: '#9CA3AF' },
  separator: { height: 1, backgroundColor: '#F0F0F0' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyHint: { fontSize: 13, color: '#9CA3AF', marginTop: 6 },
});