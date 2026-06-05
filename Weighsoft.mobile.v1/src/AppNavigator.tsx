/**
 * Task 19 — Navigation routes for the Certificates module
 *
 * Uses React Navigation v6 with full TypeScript typing.
 * AI usage: AI checked navigation typing and identified missing param types.
 *
 * Stack:
 *   CertificateList    (index)
 *   CertificateDetail  (id: string)
 *   NewCertificate     (step 1–4 wizard)
 *   EditCertificate    (id: string)
 *
 * Tab navigator sits above this and is also defined here.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ─── Route param types ────────────────────────────────────────────────────────
// AI note: every screen that accepts params must be listed here.
// Missing params cause runtime errors that TypeScript won't catch without this.

export type CertStackParamList = {
  CertificateList:   undefined;
  CertificateDetail: { certId: string };
  NewCertificate:    { step?: 1 | 2 | 3 | 4 };
  EditCertificate:   { certId: string };
};

export type RootTabParamList = {
  Certificates: undefined;
  Settings:     undefined;
};

// Typed screen props helpers — import these in each screen file
export type CertListProps    = NativeStackScreenProps<CertStackParamList, 'CertificateList'>;
export type CertDetailProps  = NativeStackScreenProps<CertStackParamList, 'CertificateDetail'>;
export type NewCertProps     = NativeStackScreenProps<CertStackParamList, 'NewCertificate'>;
export type EditCertProps    = NativeStackScreenProps<CertStackParamList, 'EditCertificate'>;

// ─── Placeholder screens (replace with real screen components) ────────────────

function CertificateListPlaceholder({ navigation }: CertListProps) {
  return null; // replace with <CertificateListScreen /> from Task 16
}

function CertificateDetailPlaceholder({ route }: CertDetailProps) {
  return null; // replace with real detail screen
}

function NewCertificatePlaceholder({ route }: NewCertProps) {
  return null; // replace with <NewCertificateForm /> from Task 14
}

function EditCertificatePlaceholder({ route }: EditCertProps) {
  return null; // replace with <EditCertificateForm /> from Task 18
}

function SettingsPlaceholder() {
  return null;
}

// ─── Certificate stack ────────────────────────────────────────────────────────

const CertStack = createNativeStackNavigator<CertStackParamList>();

export function CertificateStackNavigator() {
  return (
    <CertStack.Navigator
      initialRouteName="CertificateList"
      screenOptions={{
        headerStyle: { backgroundColor: '#1F3864' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitleVisible: false,
      }}
    >
      <CertStack.Screen
        name="CertificateList"
        component={CertificateListPlaceholder}
        options={({ navigation }) => ({
          title: 'Certificates',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('NewCertificate', { step: 1 })}
              accessibilityLabel="Create new certificate"
            >
              <Text style={styles.headerBtn}>＋ New</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <CertStack.Screen
        name="CertificateDetail"
        component={CertificateDetailPlaceholder}
        options={({ route, navigation }) => ({
          title: `Certificate`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EditCertificate', { certId: route.params.certId })
              }
              accessibilityLabel="Edit certificate"
            >
              <Text style={styles.headerBtn}>Edit</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <CertStack.Screen
        name="NewCertificate"
        component={NewCertificatePlaceholder}
        options={{ title: 'New Certificate', presentation: 'modal' }}
      />

      <CertStack.Screen
        name="EditCertificate"
        component={EditCertificatePlaceholder}
        options={{ title: 'Edit Certificate', presentation: 'modal' }}
      />
    </CertStack.Navigator>
  );
}

// ─── Root tab navigator ───────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1F3864',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E7EB' },
      }}
    >
      <Tab.Screen
        name="Certificates"
        component={CertificateStackNavigator}
        options={{ tabBarLabel: 'Certificates' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsPlaceholder}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// ─── Typed navigation hook helpers ───────────────────────────────────────────
// Import and use these in screen components for type-safe navigation calls.

import { useNavigation, NavigationProp } from '@react-navigation/native';

export function useCertNavigation() {
  return useNavigation<NavigationProp<CertStackParamList>>();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerBtn: {
    color: '#FFFFFF', fontSize: 15, fontWeight: '600', paddingHorizontal: 4,
  },
});
