# Script simple para probar el sistema RAG
$ServerUrl = "http://localhost:3001"

# Funcion para probar una busqueda
function Test-RAGSearch {
    param(
        [string]$Query = "Que es NUVOS?"
    )
    
    try {
        Write-Host "Probando busqueda: $Query" -ForegroundColor Yellow
        
        $body = @{
            name = "knowledge_base"
            query = $Query
            limit = 3
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$ServerUrl/server/gemini/embeddings/search" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.results -and $response.results.Count -gt 0) {
            Write-Host "Encontrados $($response.results.Count) resultados:" -ForegroundColor Green
            
            for ($i = 0; $i -lt $response.results.Count; $i++) {
                $result = $response.results[$i]
                Write-Host "Resultado $($i + 1) (Score: $([math]::Round($result.score, 3)))" -ForegroundColor Cyan
                if ($result.meta) {
                    Write-Host "Metadata: $($result.meta | ConvertTo-Json -Compress)" -ForegroundColor Gray
                }
                if ($result.content -and $result.content.Length -gt 0) {
                    $contentPreview = $result.content.Substring(0, [Math]::Min(150, $result.content.Length))
                    Write-Host "Contenido: $contentPreview..." -ForegroundColor White
                } else {
                    Write-Host "Contenido: [Vacio]" -ForegroundColor Gray
                }
                Write-Host ""
            }
        } else {
            Write-Host "No se encontraron resultados" -ForegroundColor Red
        }
        
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Ejecutar prueba
Test-RAGSearch -Query "Como funciona el staking en NUVOS?"