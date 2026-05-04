'use client';

import { useSyncExternalStore } from 'react';

type AuthUser = {
  id: string;
  email: string;
  role: string;
  nombre?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
};

type Listener = () => void;

const listeners = new Set<Listener>();
let state: AuthState = {
  user: null,
  accessToken: null,
};

function emit() {
  for (const l of listeners) l();
}

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return state;
}

export function useAuthStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    user: snapshot.user,
    accessToken: snapshot.accessToken,
    setAuth: (user: AuthUser, accessToken: string) => setState({ user, accessToken }),
    clearAuth: () => setState({ user: null, accessToken: null }),
  };
}
