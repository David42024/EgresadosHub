'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface RegisterState {
  // User data
  email: string;
  password: string;
  role: string;
  
  // Egresado data
  nombres?: string;
  apellidos?: string;
  carrera?: string;
  anioEgreso?: number;
  codigoEstudiante?: string;
  telefono?: string;
  ubicacion?: string;
  redesSociales?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  resumenProfesional?: string;
  fotoUrl?: string;
  cvUrl?: string;
  habilidades?: Array<{
    nombre: string;
    nivel: number;
    categoria: string;
  }>;
  
  // Empresa data
  razonSocial?: string;
  ruc?: string;
  sector?: string;
  descripcion?: string;
  logoUrl?: string;
  sitioWeb?: string;
  
  // UI state
  currentStep: number;
  isRegistered: boolean;
  profileCreated: boolean;
  skippedSteps: number[];
}

export type RegisterAction =
  | { type: 'SET_CREDENTIALS'; payload: { email: string; password: string; role: string } }
  | { type: 'SET_EGRESADO_DATA'; payload: Partial<RegisterState> }
  | { type: 'SET_EMPRESA_DATA'; payload: Partial<RegisterState> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_REGISTERED'; payload: boolean }
  | { type: 'SET_PROFILE_CREATED'; payload: boolean }
  | { type: 'SKIP_STEP'; payload: number }
  | { type: 'RESET' };

const initialState: RegisterState = {
  email: '',
  password: '',
  role: 'EGRESADO',
  currentStep: 1,
  isRegistered: false,
  profileCreated: false,
  skippedSteps: [],
};

function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'SET_CREDENTIALS':
      return {
        ...state,
        email: action.payload.email,
        password: action.payload.password,
        role: action.payload.role,
      };
      
    case 'SET_EGRESADO_DATA':
      return {
        ...state,
        ...action.payload,
      };
      
    case 'SET_EMPRESA_DATA':
      return {
        ...state,
        ...action.payload,
      };
      
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
      
    case 'SET_REGISTERED':
      return {
        ...state,
        isRegistered: action.payload,
      };
      
    case 'SET_PROFILE_CREATED':
      return {
        ...state,
        profileCreated: action.payload,
      };
      
    case 'SKIP_STEP':
      return {
        ...state,
        skippedSteps: [...state.skippedSteps, action.payload],
      };
      
    case 'RESET':
      return initialState;
      
    default:
      return state;
  }
}

const RegisterContext = createContext<{
  state: RegisterState;
  dispatch: React.Dispatch<RegisterAction>;
} | null>(null);

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(registerReducer, initialState);

  return (
    <RegisterContext.Provider value={{ state, dispatch }}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegister must be used within a RegisterProvider');
  }
  return context;
}
