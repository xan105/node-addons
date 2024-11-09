@echo off
cargo build --target wasm32-wasi
if not exist "build\Debug\" mkdir build\Debug
MOVE /Y "target\wasm32-wasi\debug\*.wasm" "build\Debug\"