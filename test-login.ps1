$body = @{
    email = "admin@dashboard.com"
    senha = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $body -ContentType "application/json"

Write-Host "Resposta do login:"
$response | ConvertTo-Json
