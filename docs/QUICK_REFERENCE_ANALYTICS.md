# ⚡ Guía de Referencia Rápida - Analytics NUVOS-APP

## 🚀 Comandos Esenciales

### Configuración Inicial
```powershell
# Cargar script (SIEMPRE PRIMERO)
. .\analytics-commands.ps1

# Verificar que todo funciona
Test-AllEndpoints
```

### Comandos Diarios (Top 5)
```powershell
# 1. Estadísticas rápidas
Get-QuickStats

# 2. Métricas completas
Get-SystemMetrics

# 3. Datos en tiempo real
Get-RealtimeMetrics

# 4. Trabajos activos
Get-ActiveBatchJobs

# 5. Exportar reporte
Export-Metrics -Format csv -Filename "reporte-$(Get-Date -Format 'yyyy-MM-dd')"
```

### Monitoreo Continuo
```powershell
# Monitoreo cada 30 segundos
Start-ContinuousMonitoring

# Monitoreo rápido (cada 10 segundos)
Start-ContinuousMonitoring -IntervalSeconds 10
```

### Troubleshooting Rápido
```powershell
# Si las funciones no se reconocen
. .\analytics-commands.ps1

# Si hay errores de conectividad
Get-Process -Name node
netstat -an | findstr :3000
Test-AllEndpoints
```

## 📊 Interpretación de Métricas

### Valores Normales
- **Tasa de éxito**: > 95%
- **Tiempo de respuesta**: < 500ms
- **Requests activos**: < 10

### Señales de Alerta
- **Tasa de éxito**: < 90% 🚨
- **Tiempo de respuesta**: > 1000ms 🚨
- **Requests activos**: > 20 🚨

## 🎯 Flujo de Trabajo Típico

1. **Inicio del día**:
   ```powershell
   . .\analytics-commands.ps1
   Get-QuickStats
   ```

2. **Revisión periódica**:
   ```powershell
   Get-RealtimeMetrics
   Get-ActiveBatchJobs
   ```

3. **Reporte semanal**:
   ```powershell
   Get-SystemMetrics
   Export-Metrics -Format csv -Filename "semanal-$(Get-Date -Format 'yyyy-MM-dd')"
   ```

## 🔧 Comandos de Una Línea

```powershell
# Todo en uno: cargar + verificar + métricas
. .\analytics-commands.ps1; Test-AllEndpoints; Get-QuickStats

# Reporte completo instantáneo
Get-SystemMetrics; Get-RealtimeMetrics; Get-BatchStats

# Exportar todo
Export-Metrics -Format json; Export-Metrics -Format csv
```

---
**💡 Tip**: Guarda esta página en favoritos para acceso rápido a los comandos más utilizados.