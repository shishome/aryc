@echo off

node --expose-gc --max-old-space-size=8192 "%~dp0\run" %*
