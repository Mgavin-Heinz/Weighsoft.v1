# Task 19: Build a Navigation Route for a New Module

**File:** `Weighsoft.mobile.v1/src/AppNavigator.tsx`  
**AI usage:** AI used to check navigation typing.

---

## What I asked AI to help with

I asked AI to review my navigation param types and identify any missing or incorrectly typed parameters that TypeScript might not catch at compile time but would cause runtime errors.

## What AI identified

AI flagged three typing issues:

**Issue 1 — Screens without params were typed as `undefined` but not explicitly declared.**  
React Navigation requires every screen in the param list to be explicitly declared, even if it takes no params. AI pointed out that omitting a screen means TypeScript won't catch calls to `navigation.navigate('ScreenName')` that pass unexpected params.

**Issue 2 — The `step` param on `NewCertificate` could be typed more precisely.**  
My initial version used `step?: number`. AI suggested `step?: 1 | 2 | 3 | 4` as a union literal type, which makes it impossible to navigate to step 5 and gives better autocomplete.

**Issue 3 — The typed navigation hook was missing.**  
Without a `useCertNavigation()` hook that wraps `useNavigation<NavigationProp<CertStackParamList>>()`, every screen that needs to navigate would have to repeat the generic type. AI flagged that this is a common source of `any`-typed navigation in React Native projects.

## What I changed after reviewing

I applied all three fixes. The `step` param now uses a union literal type. I added `useCertNavigation()` as a typed hook export. All screens in both the stack and tab navigator are explicitly declared in their respective param lists even when they take no params.

## Implementation

### Param list types

```typescript
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
```

### Typed screen props

Each screen imports its own typed props helper rather than using the generic `NativeStackScreenProps`:

```typescript
export type CertListProps   = NativeStackScreenProps<CertStackParamList, 'CertificateList'>;
export type CertDetailProps = NativeStackScreenProps<CertStackParamList, 'CertificateDetail'>;
export type NewCertProps    = NativeStackScreenProps<CertStackParamList, 'NewCertificate'>;
export type EditCertProps   = NativeStackScreenProps<CertStackParamList, 'EditCertificate'>;
```

### Navigator structure

```
AppNavigator (NavigationContainer)
└── RootNavigator (BottomTabNavigator)
    ├── Certificates tab → CertificateStackNavigator
    │   ├── CertificateList    (default screen)
    │   ├── CertificateDetail  (pushed on row tap)
    │   ├── NewCertificate     (modal, from FAB or header button)
    │   └── EditCertificate    (modal, from detail header button)
    └── Settings tab → SettingsPlaceholder
```

### Header configuration

- All stack screens share a dark blue header (`#1F3864`) with white text
- `CertificateList` has a `+ New` button in the header right that navigates to `NewCertificate` with `step: 1`
- `CertificateDetail` has an `Edit` button that navigates to `EditCertificate` with the current `certId`
- `NewCertificate` and `EditCertificate` use `presentation: 'modal'` so they slide up from the bottom

### Typed navigation hook

```typescript
export function useCertNavigation() {
  return useNavigation<NavigationProp<CertStackParamList>>();
}
```

Import and call this in any screen that needs to navigate, instead of calling `useNavigation()` with manual generic types.

---

## AI usage reflection

The typed hook suggestion was the most practically useful thing AI identified — without it, every screen ends up with repeated generic boilerplate. The union literal type for `step` was a small but good catch that improves the developer experience when calling `navigate('NewCertificate', { step: 2 })`. I designed the overall navigator structure and modal presentation choices myself.
