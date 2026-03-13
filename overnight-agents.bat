@echo off
echo ═══════════════════════════════════════
echo  JOSHO OVERNIGHT AGENT SYSTEM v2.0
echo  Redirecting to josho-ops orchestrator
echo ═══════════════════════════════════════

:: The full pipeline now lives in josho-ops/
:: This wrapper exists for backward compatibility with Task Scheduler
cd /d C:\Sijoy_2.0\josho-ops
node agents\orchestrator.js

echo ═══════════════════════════════════════
echo  OVERNIGHT COMPLETE at %time%
echo  Check email for morning review
echo ═══════════════════════════════════════
