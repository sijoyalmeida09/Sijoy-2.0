# Setup deploy secrets for Course-Enrollment-JSP and Library-Search-Struts
# Uses the same values as cross-page-posting.
#
# Usage (interactive):
#   .\setup-deploy-secrets.ps1
#
# Usage (with env vars - run in same terminal):
#   $env:JOSHOIT_HOST = "your-server.com"
#   $env:JOSHOIT_USER = "sshuser"
#   $env:JOSHOIT_PORT = "22"
#   $env:JOSHOIT_KEY_PATH = "C:\Users\You\.ssh\id_rsa"
#   .\setup-deploy-secrets.ps1

param(
    [string]$DeployHost,
    [string]$DeployUser,
    [string]$DeployPort = "22",
    [string]$DeployKey
)

$repos = @("sijoyalmeida09/Course-Enrollment-JSP", "sijoyalmeida09/Library-Search-Struts")

if (-not $DeployHost) { $DeployHost = $env:JOSHOIT_HOST }
if (-not $DeployUser) { $DeployUser = $env:JOSHOIT_USER }
if (-not $DeployPort) { $DeployPort = $env:JOSHOIT_PORT }
if (-not $DeployPort) { $DeployPort = "22" }

if ([string]::IsNullOrWhiteSpace($DeployKey)) {
    $keyPath = $env:JOSHOIT_KEY_PATH
    if ([string]::IsNullOrWhiteSpace($keyPath)) { $keyPath = Read-Host "Path to SSH private key file" }
    if (Test-Path $keyPath) {
        $DeployKey = Get-Content $keyPath -Raw
    } else {
        Write-Host "File not found. Paste key content (Ctrl+Z then Enter when done):" -ForegroundColor Yellow
        $DeployKey = [System.Console]::In.ReadToEnd()
    }
}

if ([string]::IsNullOrWhiteSpace($DeployHost)) { $DeployHost = Read-Host "HOST (same as cross-page-posting)" }
if ([string]::IsNullOrWhiteSpace($DeployUser)) { $DeployUser = Read-Host "USERNAME" }

foreach ($repo in $repos) {
    Write-Host "`nSetting secrets for $repo..." -ForegroundColor Cyan
    $DeployHost | gh secret set HOST --repo $repo
    $DeployUser | gh secret set USERNAME --repo $repo
    $DeployPort | gh secret set PORT --repo $repo
    $DeployKey | gh secret set SSH_KEY --repo $repo
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host "`nSecrets set. Triggering deploy..." -ForegroundColor Yellow
gh workflow run deploy.yml --repo sijoyalmeida09/Course-Enrollment-JSP
gh workflow run deploy.yml --repo sijoyalmeida09/Library-Search-Struts
Write-Host "`nDeploy triggered. Check: https://github.com/sijoyalmeida09/Course-Enrollment-JSP/actions" -ForegroundColor Green
