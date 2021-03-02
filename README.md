# arrow-wasm-cpp
Standalone Apache Arrow compiled to WebAssembly, extracted from https://github.com/finos/perspective


## Setup
Install dependencies
- flatbuffers
- boost


## Build

```bash
mkdir build
cd build/
cmake ..
cmake --build . -- -j8
```