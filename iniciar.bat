@echo off
title Ciclo Concursos
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo.
  echo  O Python nao foi encontrado neste computador.
  echo  Instale em https://www.python.org/downloads/windows/
  echo  IMPORTANTE: marque a caixa "Add python.exe to PATH" durante a instalacao.
  echo.
  pause
  exit /b 1
)
python -m app
pause
