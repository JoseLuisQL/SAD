# Script de prueba para endpoints de reportes
# Sistema de Archivo Digital DISA - PROMPT 026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing: Sistema de Reportes (Backend)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5001/api"

# 1. Login para obtener token
Write-Host "1. Autenticación..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"username":"admin","password":"admin123"}'
    
    $token = $loginResponse.data.token
    Write-Host "   ✓ Login exitoso" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
    }
} catch {
    Write-Host "   ✗ Error en login: $_" -ForegroundColor Red
    exit 1
}

# 2. Reporte de Documentos (JSON)
Write-Host "`n2. Obteniendo reporte de documentos..." -ForegroundColor Yellow
try {
    $documentsReport = Invoke-RestMethod -Uri "$baseUrl/reports/documents" `
        -Headers $headers
    
    Write-Host "   ✓ Reporte generado exitosamente" -ForegroundColor Green
    Write-Host "   Summary:" -ForegroundColor Cyan
    $documentsReport.data.summary | Format-List
    
    Write-Host "   Documentos por tipo (primeros 3):" -ForegroundColor Cyan
    $documentsReport.data.documentsByType | Select-Object -First 3 | Format-Table
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 3. Reporte de Actividad de Usuarios (JSON)
Write-Host "`n3. Obteniendo reporte de actividad de usuarios..." -ForegroundColor Yellow
try {
    $activityReport = Invoke-RestMethod -Uri "$baseUrl/reports/activity" `
        -Headers $headers
    
    Write-Host "   ✓ Reporte generado exitosamente" -ForegroundColor Green
    Write-Host "   Summary:" -ForegroundColor Cyan
    $activityReport.data.summary | Format-List
    
    Write-Host "   Usuarios más activos (top 5):" -ForegroundColor Cyan
    $activityReport.data.activityByUser | Select-Object -First 5 | Format-Table username, fullName, totalActions
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 4. Reporte de Firmas (JSON)
Write-Host "`n4. Obteniendo reporte de firmas..." -ForegroundColor Yellow
try {
    $signaturesReport = Invoke-RestMethod -Uri "$baseUrl/reports/signatures" `
        -Headers $headers
    
    Write-Host "   ✓ Reporte generado exitosamente" -ForegroundColor Green
    Write-Host "   Summary:" -ForegroundColor Cyan
    $signaturesReport.data.summary | Format-List
    
    Write-Host "   Firmantes más activos (top 5):" -ForegroundColor Cyan
    $signaturesReport.data.signaturesBySigner | Select-Object -First 5 | Format-Table signerName, username, count
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 5. Exportación a PDF
Write-Host "`n5. Exportando reporte de documentos a PDF..." -ForegroundColor Yellow
try {
    $pdfFile = "reporte-documentos-$(Get-Date -Format 'yyyyMMdd-HHmmss').pdf"
    Invoke-WebRequest -Uri "$baseUrl/reports/documents/export?format=pdf" `
        -Headers $headers `
        -OutFile $pdfFile
    
    $fileSize = (Get-Item $pdfFile).Length
    Write-Host "   ✓ PDF generado: $pdfFile ($fileSize bytes)" -ForegroundColor Green
    
    # Abrir el archivo
    Start-Process $pdfFile
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 6. Exportación a Excel
Write-Host "`n6. Exportando reporte de actividad a Excel..." -ForegroundColor Yellow
try {
    $xlsxFile = "reporte-actividad-$(Get-Date -Format 'yyyyMMdd-HHmmss').xlsx"
    Invoke-WebRequest -Uri "$baseUrl/reports/activity/export?format=xlsx" `
        -Headers $headers `
        -OutFile $xlsxFile
    
    $fileSize = (Get-Item $xlsxFile).Length
    Write-Host "   ✓ Excel generado: $xlsxFile ($fileSize bytes)" -ForegroundColor Green
    
    # Abrir el archivo
    Start-Process $xlsxFile
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 7. Exportación a CSV
Write-Host "`n7. Exportando reporte de firmas a CSV..." -ForegroundColor Yellow
try {
    $csvFile = "reporte-firmas-$(Get-Date -Format 'yyyyMMdd-HHmmss').csv"
    Invoke-WebRequest -Uri "$baseUrl/reports/signatures/export?format=csv" `
        -Headers $headers `
        -OutFile $csvFile
    
    $fileSize = (Get-Item $csvFile).Length
    Write-Host "   ✓ CSV generado: $csvFile ($fileSize bytes)" -ForegroundColor Green
    
    # Mostrar primeras líneas
    Write-Host "   Primeras líneas del CSV:" -ForegroundColor Cyan
    Get-Content $csvFile -First 10 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    # Abrir el archivo
    Start-Process $csvFile
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 8. Prueba con filtros
Write-Host "`n8. Probando filtros (reporte de documentos con rango de fechas)..." -ForegroundColor Yellow
try {
    $dateFrom = (Get-Date).AddMonths(-3).ToString("yyyy-MM-dd")
    $dateTo = (Get-Date).ToString("yyyy-MM-dd")
    
    $filteredReport = Invoke-RestMethod -Uri "$baseUrl/reports/documents?dateFrom=$dateFrom&dateTo=$dateTo" `
        -Headers $headers
    
    Write-Host "   ✓ Reporte filtrado generado exitosamente" -ForegroundColor Green
    Write-Host "   Período: $dateFrom a $dateTo" -ForegroundColor Cyan
    Write-Host "   Total documentos en período: $($filteredReport.data.summary.totalDocuments)" -ForegroundColor Cyan
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 9. Verificar auditoría
Write-Host "`n9. Verificando registros de auditoría..." -ForegroundColor Yellow
try {
    $auditLogs = Invoke-RestMethod -Uri "$baseUrl/audit?action=REPORT_GENERATED&limit=5" `
        -Headers $headers
    
    Write-Host "   ✓ Auditoría consultada exitosamente" -ForegroundColor Green
    Write-Host "   Últimos reportes generados:" -ForegroundColor Cyan
    $auditLogs.data.logs | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.action) por $($_.user.username) a las $($_.createdAt)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Error: $_" -ForegroundColor Red
}

# 10. Prueba de validación (formato inválido)
Write-Host "`n10. Probando validación de formato inválido..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "$baseUrl/reports/documents/export?format=invalid" `
        -Headers $headers `
        -OutFile "temp.bin" 2>&1 | Out-Null
    Write-Host "   ✗ No se validó formato inválido" -ForegroundColor Red
} catch {
    Write-Host "   ✓ Validación correcta: formato inválido rechazado" -ForegroundColor Green
}

# Resumen final
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing Completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nArchivos generados en el directorio actual:" -ForegroundColor Yellow
Get-ChildItem "reporte-*" | ForEach-Object {
    Write-Host "  - $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
}

Write-Host "`n✓ Todos los tests completados" -ForegroundColor Green
Write-Host "✓ Verificar que los archivos se abrieron correctamente" -ForegroundColor Green
Write-Host "✓ Revisar logs de auditoría en la base de datos" -ForegroundColor Green
