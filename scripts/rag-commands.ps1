# ========================================
# NUVOS-APP RAG Management Commands
# ========================================
# Script para gestionar la base de conocimiento y funcionalidades RAG

# Configuración
$ServerUrl = "http://localhost:3001"
$EmbeddingsEndpoint = "$ServerUrl/server/gemini/embeddings"

# Función para verificar si el servidor está disponible
function Test-NuvosServer {
    [CmdletBinding()]
    param()
    
    try {
        Write-Host "🔍 Verificando servidor NUVOS..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri "$ServerUrl/server/hello" -Method GET -TimeoutSec 10
        Write-Host "✅ Servidor NUVOS disponible en $ServerUrl" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error: Servidor no disponible en $ServerUrl" -ForegroundColor Red
        Write-Host "💡 Asegúrate de ejecutar 'npm run dev' primero" -ForegroundColor Yellow
        return $false
    }
}

# Función para inicializar la base de conocimiento
function Initialize-KnowledgeBase {
    [CmdletBinding()]
    param()
    
    Write-Host "🚀 Inicializando base de conocimiento..." -ForegroundColor Cyan
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    try {
        # Ejecutar el script de Node.js
        $scriptPath = Join-Path $PSScriptRoot "initialize-knowledge-base.js"
        
        if (Test-Path $scriptPath) {
            Write-Host "📦 Ejecutando inicializador..." -ForegroundColor Yellow
            node $scriptPath
            Write-Host "✅ Base de conocimiento inicializada" -ForegroundColor Green
        } else {
            Write-Host "❌ Error: No se encontró el script inicializador" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error inicializando base de conocimiento: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para buscar en la base de conocimiento
function Search-Knowledge {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Query,
        
        [Parameter()]
        [string]$IndexName = "knowledge_base",
        
        [Parameter()]
        [int]$TopK = 5
    )
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    try {
        Write-Host "🔍 Buscando: '$Query'" -ForegroundColor Yellow
        
        $body = @{
            name = $IndexName
            query = $Query
            topK = $TopK
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$EmbeddingsEndpoint/search" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.results -and $response.results.Count -gt 0) {
            Write-Host "✅ Encontrados $($response.results.Count) resultados:" -ForegroundColor Green
            
            for ($i = 0; $i -lt $response.results.Count; $i++) {
                $result = $response.results[$i]
                Write-Host "\n📄 Resultado $($i + 1) (Similitud: $([math]::Round($result.similarity, 3)))" -ForegroundColor Cyan
                Write-Host "Tipo: $($result.metadata.type) | Categoría: $($result.metadata.category)" -ForegroundColor Gray
                Write-Host "Contenido: $($result.content.Substring(0, [Math]::Min(200, $result.content.Length)))..." -ForegroundColor White
            }
        } else {
            Write-Host "❌ No se encontraron resultados para: '$Query'" -ForegroundColor Red
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Error en búsqueda: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para obtener estadísticas de índices
function Get-IndexStats {
    [CmdletBinding()]
    param(
        [Parameter()]
        [string]$IndexName = "knowledge_base"
    )
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    try {
        Write-Host "📊 Obteniendo estadísticas del índice '$IndexName'..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri "$EmbeddingsEndpoint/stats/$IndexName" -Method GET
        
        Write-Host "✅ Estadísticas del índice '$IndexName':" -ForegroundColor Green
        Write-Host "   📄 Documentos: $($response.documentCount)" -ForegroundColor White
        Write-Host "   🔢 Dimensiones: $($response.dimensions)" -ForegroundColor White
        Write-Host "   💾 Tamaño: $($response.sizeInMemory) bytes" -ForegroundColor White
        
        return $response
    }
    catch {
        Write-Host "❌ Error obteniendo estadísticas: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para limpiar un índice
function Clear-Index {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$IndexName
    )
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    try {
        Write-Host "🗑️ Limpiando índice '$IndexName'..." -ForegroundColor Yellow
        
        $response = Invoke-RestMethod -Uri "$EmbeddingsEndpoint/index/$IndexName" -Method DELETE
        
        Write-Host "✅ Índice '$IndexName' limpiado exitosamente" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Error limpiando índice: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Función para probar el sistema RAG completo
function Test-RAGSystem {
    [CmdletBinding()]
    param()
    
    Write-Host "🧪 Probando sistema RAG completo..." -ForegroundColor Cyan
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    # Preguntas de prueba
    $testQueries = @(
        "¿Cómo funciona el staking en NUVOS?",
        "¿Qué son los airdrops?",
        "¿Cómo conectar mi wallet?",
        "¿Cuáles son los riesgos del staking?",
        "¿Cómo reclamar tokens de airdrop?"
    )
    
    Write-Host "\n📝 Ejecutando $($testQueries.Count) consultas de prueba...\n" -ForegroundColor Yellow
    
    foreach ($query in $testQueries) {
        Write-Host "❓ Pregunta: $query" -ForegroundColor Cyan
        $result = Search-Knowledge -Query $query -TopK 2
        
        if ($result -and $result.results -and $result.results.Count -gt 0) {
            Write-Host "   ✅ Contexto encontrado" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Sin contexto" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    Write-Host "🎯 Prueba completada. Revisa los resultados arriba." -ForegroundColor Green
}

# Función para agregar contenido personalizado
function Add-CustomContent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Content,
        
        [Parameter(Mandatory=$true)]
        [string]$Type,
        
        [Parameter(Mandatory=$true)]
        [string]$Category,
        
        [Parameter()]
        [string]$Topic = "custom",
        
        [Parameter()]
        [string]$IndexName = "knowledge_base"
    )
    
    if (-not (Test-NuvosServer)) {
        return
    }
    
    try {
        Write-Host "📝 Agregando contenido personalizado..." -ForegroundColor Yellow
        
        $body = @{
            name = $IndexName
            documents = @(
                @{
                    content = $Content
                    metadata = @{
                        type = $Type
                        category = $Category
                        topic = $Topic
                        custom = $true
                        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
                    }
                }
            )
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$EmbeddingsEndpoint/index" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "✅ Contenido agregado exitosamente" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Error agregando contenido: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Función para mostrar el menú de comandos
function Show-RAGMenu {
    Write-Host "\n" -NoNewline
    Write-Host "🤖 NUVOS-APP RAG Management System" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   🚀 Initialize-KnowledgeBase" -ForegroundColor Green
    Write-Host "      Inicializa la base de conocimiento con datos de NUVOS"
    Write-Host ""
    Write-Host "   🔍 Search-Knowledge -Query 'tu pregunta'" -ForegroundColor Green
    Write-Host "      Busca información en la base de conocimiento"
    Write-Host ""
    Write-Host "   📊 Get-IndexStats [-IndexName 'nombre']" -ForegroundColor Green
    Write-Host "      Obtiene estadísticas de un índice"
    Write-Host ""
    Write-Host "   🧪 Test-RAGSystem" -ForegroundColor Green
    Write-Host "      Prueba el sistema completo con consultas de ejemplo"
    Write-Host ""
    Write-Host "   📝 Add-CustomContent -Content 'texto' -Type 'tipo' -Category 'categoría'" -ForegroundColor Green
    Write-Host "      Agrega contenido personalizado a la base de conocimiento"
    Write-Host ""
    Write-Host "   🗑️ Clear-Index -IndexName 'nombre'" -ForegroundColor Green
    Write-Host "      Limpia un índice específico"
    Write-Host ""
    Write-Host "   🔧 Test-NuvosServer" -ForegroundColor Green
    Write-Host "      Verifica el estado del servidor"
    Write-Host ""
    Write-Host "💡 Ejemplos de uso:" -ForegroundColor Yellow
    Write-Host "   Search-Knowledge -Query '¿Cómo hacer staking?'" -ForegroundColor Gray
    Write-Host "   Add-CustomContent -Content 'Nueva información' -Type 'info' -Category 'general'" -ForegroundColor Gray
    Write-Host ""
}

# Mostrar menú al cargar el script
Show-RAGMenu

# Exportar funciones
Export-ModuleMember -Function @(
    'Test-NuvosServer',
    'Initialize-KnowledgeBase',
    'Search-Knowledge',
    'Get-IndexStats',
    'Clear-Index',
    'Test-RAGSystem',
    'Add-CustomContent',
    'Show-RAGMenu'
)