# 🎁 NUVOS Airdrop System Documentation

## Overview

El sistema de airdrop de NUVOS está diseñado para distribuir tokens POL (Polygon) a usuarios registrados de forma automática y segura. El sistema utiliza un contrato inteligente como pool de tokens y permite reclamaciones individuales por parte de los usuarios.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Smart Contract (Pool)**: Contrato que almacena los tokens POL para distribución
2. **Frontend Components**: Interfaz para registro y reclamación
3. **Firebase Database**: Almacena registros de usuarios
4. **Distribution Scripts**: Scripts para administrar el airdrop

### Flujo del Usuario

1. **Registro** (Antes del 1 de agosto 2025)
   - Usuario conecta wallet
   - Completa formulario con nombre y email
   - Se registra en Firebase con estado 'pending'

2. **Período de Reclamación** (Después del 1 de agosto 2025)
   - Usuario regresa a la plataforma
   - Si está registrado, puede reclamar tokens
   - Interactúa directamente con el contrato inteligente

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas

```env
# Airdrop Contract
VITE_AIRDROP_ADDRESS=0x... # Dirección del contrato cuando se despliegue

# Para distribución (solo admin)
AIRDROP_PRIVATE_KEY=... # Clave privada del wallet administrador
AIRDROP_AMOUNT_PER_USER=10 # Cantidad de POL por usuario

# Firebase (ya configurado)
VITE_FIREBASE=...
VITE_FIREBASE_PROJECT_ID=...
# ... otras variables de Firebase
```

### Smart Contract Functions (Esperadas)

```solidity
// Funciones que el contrato debe tener
function fundAirdrop() external payable; // Fondear el contrato
function claimTokens() external; // Reclamar tokens (usuarios)
function checkUserEligibility(address user) external view returns (bool, bool, bool, uint256);
function isActive() external view returns (bool);
function getBalance() external view returns (uint256);
```

## 🚀 Scripts Disponibles

### 1. Exportar Wallets Registradas
```bash
npm run export:wallets
```
- Exporta todas las wallets registradas a CSV
- Útil para verificar registros antes de distribución

### 2. Distribución de Airdrop (Dry Run)
```bash
npm run distribute:airdrop-dry
```
- Simula la distribución sin ejecutar transacciones
- Muestra estadísticas y costos estimados
- **Usar siempre antes de distribución real**

### 3. Distribución Real
```bash
npm run distribute:airdrop
```
- **⚠️ SOLO USAR EN PRODUCCIÓN**
- Ejecuta la distribución real de tokens
- Actualiza estados en Firebase

## 🎯 Proceso de Despliegue

### Fase 1: Preparación (Antes del 1 de agosto)
1. ✅ Frontend preparado con sistema de registro
2. ✅ TimeCounter actualizado a fecha correcta
3. ⏳ Desplegar contrato inteligente
4. ⏳ Actualizar `VITE_AIRDROP_ADDRESS` en .env
5. ⏳ Fondear contrato con tokens POL

### Fase 2: Período de Registro (15 julio - 1 agosto)
1. Usuarios se registran a través del frontend
2. Monitorear registros con `npm run export:wallets`
3. Validar integridad de datos

### Fase 3: Distribución (1 de agosto en adelante)
1. Ejecutar dry run: `npm run distribute:airdrop-dry`
2. Verificar usuarios elegibles y costos
3. Ejecutar distribución real: `npm run distribute:airdrop`
4. Usuarios pueden reclamar tokens desde el frontend

## 📱 Componentes del Frontend

### ClaimTokensComponent
- **Ubicación**: `src/components/pages/AirdropDashboard/AirdropForm/ClaimTokensComponent.jsx`
- **Función**: Permite a usuarios registrados reclamar sus tokens
- **Estados**: checking, canClaim, claiming, claimed, error, waiting

### AirdropForm (Actualizado)
- **Nuevos pasos**:
  - Step 1-2: Registro (como antes)
  - Step 3: Éxito del registro
  - Step 4: Reclamación de tokens (después del 1 de agosto)

### TimeCounter (Actualizado)
- **Nueva fecha límite**: 1 de agosto 2025
- **Mensajes actualizados** para período de registro vs reclamación

## 🔍 Monitoreo y Troubleshooting

### Verificar Estado del Sistema
```javascript
// En la consola del navegador
const now = new Date();
const claimDate = new Date('2025-08-01T00:00:00');
console.log('Claim period started:', now >= claimDate);
```

### Estados de Usuario en Firebase
- `pending`: Registrado, esperando distribución
- `distributed`: Tokens distribuidos al contrato
- `claimed`: Usuario reclamó tokens
- `failed`: Error en distribución

### Logs Importantes
- **Frontend**: Errores de conexión con contrato
- **Scripts**: Logs de distribución y failures
- **Firebase**: Cambios de estado de usuarios

## ⚠️ Consideraciones de Seguridad

1. **Clave Privada**: Mantener `AIRDROP_PRIVATE_KEY` segura
2. **Dry Runs**: Siempre ejecutar antes de distribución real
3. **Gas Fees**: Monitorear costos de gas en Polygon
4. **Rate Limiting**: Scripts incluyen delays entre transacciones
5. **Backup**: Mantener backup de Firebase antes de distribución

## 📊 Métricas y Reporting

### Datos Exportados (CSV)
- Wallet address
- Nombre y email
- Estado de distribución
- Timestamp de registro
- Hash de transacción (si aplicable)

### Reports de Distribución
- Archivo JSON generado después de distribución
- Incluye éxitos, fallos y estadísticas
- Guardado automáticamente con timestamp

## 🎁 Información para Usuarios

### Requisitos para Reclamar
- Estar registrado antes del 1 de agosto 2025
- Tener wallet conectada (MetaMask, WalletConnect, etc.)
- Tener POL suficiente para gas fees (~0.01 POL)
- Período de reclamación: Después del 1 de agosto 2025

### Tokens Distribuidos
- **Cantidad**: 10 POL por wallet elegible
- **Red**: Polygon (mainnet)
- **Uso**: Tokens pueden ser inmediatamente utilizados para staking

## 🔄 Flujo Técnico Completo

```mermaid
graph TD
    A[Usuario Registra] --> B[Firebase: Status 'pending']
    B --> C[Admin: Verifica registros]
    C --> D[Admin: Despliegua contrato]
    D --> E[Admin: Fondea contrato]
    E --> F[1 Aug: Período de claim inicia]
    F --> G[Usuario: Ve botón claim]
    G --> H[Usuario: Ejecuta claimTokens()]
    H --> I[Contrato: Transfiere POL]
    I --> J[Frontend: Actualiza estado]
```

## 📞 Soporte

Para problemas técnicos durante el desarrollo o despliegue:
1. Verificar logs de consola del navegador
2. Revisar estado en Firebase
3. Ejecutar scripts en modo dry-run
4. Verificar balance del contrato
5. Comprobar configuración de red (Polygon mainnet)
