@echo off
cd %~dp0src
set GOOS=wasip1
set GOARCH=wasm
echo Compiling (DEBUG)...
go build -o "..\build\Debug\hello-world.wasm" main