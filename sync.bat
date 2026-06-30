@echo off
chcp 65001 > nul
title Đồng bộ code lên GitHub
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync.ps1"
