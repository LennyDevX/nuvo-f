# 📊 Sistema de Analytics y Monitoreo NUVOS-APP

## 🎯 Descripción General

El sistema de analytics y monitoreo de NUVOS-APP proporciona métricas en tiempo real, análisis de rendimiento y capacidades de monitoreo continuo para el ecosistema blockchain. Incluye endpoints REST para analytics, procesamiento por lotes y exportación de datos.

## 🏗️ Arquitectura del Sistema

### Componentes Principales:
- **Analytics Service**: Recopila y procesa métricas del sistema
- **Batch Service**: Maneja procesamiento de trabajos por lotes
- **Real-time Monitoring**: Proporciona datos en tiempo real
- **Export System**: Permite exportar métricas en JSON/CSV

### Endpoints Disponibles:
- `/server/gemini/analytics/metrics` - Métricas completas del sistema
- `/server/gemini/analytics/realtime` - Datos en tiempo real
- `/server/gemini/analytics/insights` - Insights y recomendaciones
- `/server/gemini/analytics/export` - Exportación de métricas
- `/server/gemini/batch/active` - Trabajos de batch activos
- `/server/gemini/batch/stats` - Estadísticas de batch

## 🚀 Instalación y Configuración

### Prerrequisitos:
- Node.js ejecutándose en puerto 3000
- PowerShell 5.0 o superior
- Servidor NUVOS-APP activo

### Configuración Inicial:
```powershell
# 1. Navegar al directorio del proyecto
cd C:\Users\lenny\OneDrive\Documentos\GitHub\Nuvos-App

# 2. Cargar el script de analytics
. .\analytics-commands.ps1

# 3. Verificar conectividad
Test-AllEndpoints
```

## 📋 Lista Completa de Comandos

### 🔧 Comandos de Configuración

#### Cargar Script de Analytics
```powershell
# Cargar todas las funciones en la sesión actual
. .\analytics-commands.ps1
```

#### Verificar Conectividad
```powershell
# Probar todos los endpoints
Test-AllEndpoints

# Probar endpoint específico
Test-AnalyticsEndpoint "analytics/metrics"
```

### 📊 Comandos de Métricas

#### Métricas Completas del Sistema
```powershell
# Obtener métricas completas
Get-SystemMetrics

# Ejemplo de salida:
# Total requests: 1250
# Requests exitosos: 1180
# Tasa de éxito: 94.4%
# Costo estimado: $12.45
# Tiempo promedio: 245ms
# Uptime: 2d 14h 32m
```

#### Métricas en Tiempo Real
```powershell
# Obtener datos en tiempo real
Get-RealtimeMetrics

# Ejemplo de salida:
# Requests activos: 5
# Requests por minuto: 23
# Concurrencia máxima: 12
```

#### Estadísticas Rápidas
```powershell
# Obtener estadísticas clave
Get-QuickStats

# Ejemplo de salida:
# Tasa de éxito: 94.4%
# Costo estimado total: $12.45
# Tiempo de respuesta promedio: 245ms
# Total de requests: 1250
```

#### Insights y Recomendaciones
```powershell
# Obtener insights del sistema
Get-SystemInsights

# Retorna análisis detallado en formato JSON
```

### 📁 Comandos de Exportación

#### Exportar en Formato JSON
```powershell
# Exportación básica en JSON
Export-Metrics -Format json

# Exportación con nombre personalizado
Export-Metrics -Format json -Filename "reporte-$(Get-Date -Format 'yyyy-MM-dd')"
```

#### Exportar en Formato CSV
```powershell
# Exportación básica en CSV
Export-Metrics -Format csv

# Exportación con nombre personalizado
Export-Metrics -Format csv -Filename "metricas-mensuales"
```

### 🔄 Comandos de Batch Processing

#### Trabajos Activos
```powershell
# Ver trabajos de batch activos
Get-ActiveBatchJobs

# Retorna lista de trabajos en ejecución
```

#### Estadísticas de Batch
```powershell
# Obtener estadísticas de procesamiento por lotes
Get-BatchStats

# Retorna métricas de rendimiento de batch
```

### 🎯 Comandos de Monitoreo

#### Monitoreo Continuo
```powershell
# Monitoreo cada 30 segundos (por defecto)
Start-ContinuousMonitoring

# Monitoreo cada 10 segundos
Start-ContinuousMonitoring -IntervalSeconds 10

# Monitoreo cada 60 segundos
Start-ContinuousMonitoring -IntervalSeconds 60
```

## 📖 Guías Paso a Paso

### 🚀 Guía de Inicio Rápido

#### Paso 1: Verificar Servidor
```powershell
# Verificar que Node.js esté ejecutándose
Get-Process -Name node

# Verificar puerto 3000
netstat -an | findstr :3000
```

#### Paso 2: Cargar Script
```powershell
# Navegar al directorio
cd C:\Users\lenny\OneDrive\Documentos\GitHub\Nuvos-App

# Cargar funciones
. .\analytics-commands.ps1
```

#### Paso 3: Verificar Conectividad
```powershell
# Probar todos los endpoints
Test-AllEndpoints
```

#### Paso 4: Obtener Primeras Métricas
```powershell
# Ver estadísticas rápidas
Get-QuickStats

# Ver métricas completas
Get-SystemMetrics
```

### 📊 Guía de Monitoreo Diario

#### Rutina Matutina (5 minutos)
```powershell
# 1. Cargar script
. .\analytics-commands.ps1

# 2. Verificar estado general
Test-AllEndpoints

# 3. Revisar métricas clave
Get-QuickStats

# 4. Verificar trabajos activos
Get-ActiveBatchJobs
```

#### Análisis Semanal (15 minutos)
```powershell
# 1. Métricas completas
Get-SystemMetrics

# 2. Insights y recomendaciones
Get-SystemInsights

# 3. Estadísticas de batch
Get-BatchStats

# 4. Exportar reporte semanal
Export-Metrics -Format csv -Filename "reporte-semanal-$(Get-Date -Format 'yyyy-MM-dd')"
```

### 🔍 Guía de Troubleshooting

#### Problema: Funciones No Reconocidas
```powershell
# Solución: Recargar script con dot sourcing
. .\analytics-commands.ps1
```

#### Problema: Error de Conectividad
```powershell
# 1. Verificar servidor
Get-Process -Name node

# 2. Verificar puerto
netstat -an | findstr :3000

# 3. Probar endpoint específico
Test-AnalyticsEndpoint "analytics/metrics"
```

#### Problema: Datos Vacíos
```powershell
# Verificar que el servidor esté procesando requests
Get-RealtimeMetrics

# Si persiste, reiniciar servidor y volver a probar
```

## 🎛️ Configuración Avanzada

### Variables de Configuración
```powershell
# URL base del servidor
$baseUrl = "http://localhost:3000/server/gemini"

# Headers para requests
$headers = @{ "Content-Type" = "application/json" }

# Timeout para requests (segundos)
$timeoutSec = 10
```

### Personalización de Intervalos
```powershell
# Monitoreo ultra-rápido (cada 5 segundos)
Start-ContinuousMonitoring -IntervalSeconds 5

# Monitoreo relajado (cada 2 minutos)
Start-ContinuousMonitoring -IntervalSeconds 120
```

## 📈 Métricas Disponibles

### Métricas de Rendimiento
- **Total de Requests**: Número total de solicitudes procesadas
- **Requests Exitosos**: Solicitudes completadas sin errores
- **Tasa de Éxito**: Porcentaje de requests exitosos
- **Tiempo de Respuesta Promedio**: Latencia media en milisegundos
- **Tiempo de Actividad**: Uptime del sistema

### Métricas de Uso
- **Costo Estimado**: Costo acumulado de operaciones
- **Tokens Utilizados**: Consumo de tokens de IA
- **Cache Hit Rate**: Eficiencia del sistema de caché
- **Embeddings Generados**: Número de embeddings creados

### Métricas en Tiempo Real
- **Requests Activos**: Solicitudes en procesamiento
- **Requests por Minuto**: Tasa de solicitudes actual
- **Concurrencia Máxima**: Pico de requests simultáneos

## 🔧 Comandos de Utilidad

### Comandos de Sistema
```powershell
# Ver procesos Node.js
Get-Process -Name node

# Verificar puertos en uso
netstat -an | findstr :3000

# Limpiar pantalla
Clear-Host
```

### Comandos de Fecha y Hora
```powershell
# Fecha actual para nombres de archivo
Get-Date -Format 'yyyy-MM-dd-HHmm'

# Timestamp para logs
Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
```

## 🚨 Alertas y Notificaciones

### Configurar Alertas Básicas
```powershell
# Función personalizada para alertas
function Check-SystemHealth {
    $metrics = Get-SystemMetrics
    if ($metrics.derived.successRate -lt 90) {
        Write-Host "⚠️ ALERTA: Tasa de éxito baja: $($metrics.derived.successRate)%" -ForegroundColor Red
    }
    if ($metrics.performance.averageResponseTime -gt 1000) {
        Write-Host "⚠️ ALERTA: Tiempo de respuesta alto: $($metrics.performance.averageResponseTime)ms" -ForegroundColor Red
    }
}

# Ejecutar verificación
Check-SystemHealth
```

## 📚 Recursos Adicionales

### Archivos Relacionados
- `analytics-commands.ps1` - Script principal de comandos
- `BATCH_ANALYTICS_API.md` - Documentación de API de batch
- `server/services/analytics-service.js` - Servicio de analytics backend

### Enlaces Útiles
- Servidor local: http://localhost:3000
- Endpoint de métricas: http://localhost:3000/server/gemini/analytics/metrics
- Endpoint en tiempo real: http://localhost:3000/server/gemini/analytics/realtime

---

**Última actualización**: $(Get-Date -Format 'yyyy-MM-dd')
**Versión**: 1.0
**Mantenido por**: Equipo NUVOS-APP