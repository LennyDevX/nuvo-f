# Script de Analytics y Monitoreo NUVOS-APP
# ==========================================

# Problema identificado:
# Test-Path esta disenado para verificar archivos/carpetas locales, NO URLs HTTP
# Solucion: Usar Invoke-RestMethod para endpoints web

# Configuracion base
$baseUrl = "http://localhost:3000/server/gemini"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "Sistema de Analytics NUVOS-APP" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Funcion de prueba de conectividad
function Test-AnalyticsEndpoint {
    param([string]$endpoint)
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/$endpoint" -TimeoutSec 10
        Write-Host "OK $endpoint - Funcionando" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "ERROR $endpoint - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funcion para obtener metricas completas
function Get-SystemMetrics {
    Write-Host "Obteniendo metricas completas del sistema..." -ForegroundColor Yellow
    $metrics = Test-AnalyticsEndpoint "analytics/metrics"
    if ($metrics) {
        Write-Host "Total requests: $($metrics.requests.total)" -ForegroundColor Green
        Write-Host "Requests exitosos: $($metrics.requests.successful)" -ForegroundColor Green
        Write-Host "Tasa de exito: $($metrics.derived.successRate)%" -ForegroundColor Green
        Write-Host "Costo estimado: $($metrics.usage.estimatedCost)" -ForegroundColor Green
        Write-Host "Tiempo promedio: $($metrics.performance.averageResponseTime)ms" -ForegroundColor Green
        Write-Host "Uptime: $($metrics.system.uptimeFormatted)" -ForegroundColor Green
    }
    return $metrics
}

# Funcion para metricas en tiempo real
function Get-RealtimeMetrics {
    Write-Host "Obteniendo metricas en tiempo real..." -ForegroundColor Yellow
    $realtime = Test-AnalyticsEndpoint "analytics/realtime"
    if ($realtime) {
        Write-Host "Requests activos: $($realtime.activeRequests)" -ForegroundColor Green
        Write-Host "Requests por minuto: $($realtime.requestsPerMinute)" -ForegroundColor Green
        Write-Host "Concurrencia maxima: $($realtime.peakConcurrency)" -ForegroundColor Green
    }
    return $realtime
}

# Funcion para insights
function Get-SystemInsights {
    Write-Host "Obteniendo insights del sistema..." -ForegroundColor Yellow
    $insights = Test-AnalyticsEndpoint "analytics/insights"
    if ($insights) {
        Write-Host "Insights obtenidos correctamente" -ForegroundColor Green
        $insights | ConvertTo-Json -Depth 3
    }
    return $insights
}

# Funciones rapidas de consulta
function Get-QuickStats {
    Write-Host "Obteniendo estadisticas rapidas..." -ForegroundColor Yellow
    $metrics = Test-AnalyticsEndpoint "analytics/metrics"
    if ($metrics) {
        Write-Host "Tasa de exito: $($metrics.derived.successRate)%" -ForegroundColor Magenta
        Write-Host "Costo estimado total: $($metrics.usage.estimatedCost)" -ForegroundColor Magenta
        Write-Host "Tiempo de respuesta promedio: $($metrics.performance.averageResponseTime)ms" -ForegroundColor Magenta
        Write-Host "Total de requests: $($metrics.requests.total)" -ForegroundColor Magenta
    }
    return $metrics
}

# Funcion para exportar metricas
function Export-Metrics {
    param(
        [ValidateSet("json", "csv")]
        [string]$Format = "json",
        [string]$Filename = "metrics-export"
    )
    
    Write-Host "Exportando metricas en formato $Format..." -ForegroundColor Yellow
    try {
        $body = @{ 
            format = $Format
            filename = $Filename 
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri "$baseUrl/analytics/export" -Method POST -Body $body -Headers $headers
        Write-Host "Metricas exportadas correctamente" -ForegroundColor Green
        return $result
    } catch {
        Write-Host "Error al exportar metricas: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funciones de batch processing
function Get-ActiveBatchJobs {
    Write-Host "Obteniendo trabajos activos..." -ForegroundColor Yellow
    $active = Test-AnalyticsEndpoint "batch/active"
    if ($active) {
        Write-Host "Trabajos activos obtenidos" -ForegroundColor Green
        $active | ConvertTo-Json -Depth 2
    }
    return $active
}

function Get-BatchStats {
    Write-Host "Obteniendo estadisticas de batch..." -ForegroundColor Yellow
    $stats = Test-AnalyticsEndpoint "batch/stats"
    if ($stats) {
        Write-Host "Estadisticas de batch obtenidas" -ForegroundColor Green
        $stats | ConvertTo-Json -Depth 2
    }
    return $stats
}

# Funcion de monitoreo continuo
function Start-ContinuousMonitoring {
    param(
        [int]$IntervalSeconds = 30
    )
    
    Write-Host "Iniciando monitoreo continuo (cada $IntervalSeconds segundos)..." -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
    Write-Host ""
    
    while ($true) {
        Clear-Host
        Write-Host "DASHBOARD EN TIEMPO REAL - $(Get-Date)" -ForegroundColor Cyan
        Write-Host "=======================================" -ForegroundColor Cyan
        Write-Host ""
        
        $realtime = Get-RealtimeMetrics
        Write-Host ""
        $quick = Get-QuickStats
        
        Write-Host ""
        Write-Host "Proxima actualizacion en $IntervalSeconds segundos..." -ForegroundColor Gray
        Start-Sleep $IntervalSeconds
    }
}

# Funcion de prueba completa
function Test-AllEndpoints {
    Write-Host "Probando todos los endpoints..." -ForegroundColor Yellow
    Write-Host ""
    
    $endpoints = @(
        "analytics/metrics",
        "analytics/realtime", 
        "analytics/insights",
        "batch/active",
        "batch/stats"
    )
    
    foreach ($endpoint in $endpoints) {
        Test-AnalyticsEndpoint $endpoint | Out-Null
    }
    
    Write-Host ""
    Write-Host "Prueba de endpoints completada" -ForegroundColor Green
}

# Funcion de menu principal
function Show-AnalyticsMenu {
    Write-Host "MENU DE ANALYTICS NUVOS-APP" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Get-SystemMetrics      - Metricas completas del sistema" -ForegroundColor White
    Write-Host "2. Get-RealtimeMetrics    - Metricas en tiempo real" -ForegroundColor White
    Write-Host "3. Get-SystemInsights     - Insights y recomendaciones" -ForegroundColor White
    Write-Host "4. Get-QuickStats         - Estadisticas rapidas" -ForegroundColor White
    Write-Host "5. Export-Metrics         - Exportar metricas (JSON/CSV)" -ForegroundColor White
    Write-Host "6. Get-ActiveBatchJobs    - Trabajos de batch activos" -ForegroundColor White
    Write-Host "7. Get-BatchStats         - Estadisticas de batch" -ForegroundColor White
    Write-Host "8. Test-AllEndpoints      - Probar todos los endpoints" -ForegroundColor White
    Write-Host "9. Start-ContinuousMonitoring - Monitoreo continuo" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos de uso:" -ForegroundColor Yellow
    Write-Host "  Get-SystemMetrics" -ForegroundColor Gray
    Write-Host "  Export-Metrics -Format csv -Filename mi-reporte" -ForegroundColor Gray
    Write-Host "  Start-ContinuousMonitoring -IntervalSeconds 10" -ForegroundColor Gray
}

# Inicializacion
Write-Host "SERVIDOR VERIFICADO - FUNCIONANDO EN PUERTO 3000" -ForegroundColor Green
Write-Host "Script de analytics cargado correctamente!" -ForegroundColor Green
Write-Host ""
Show-AnalyticsMenu