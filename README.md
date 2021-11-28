# arrow-wasm-cpp
Standalone Apache Arrow compiled to WebAssembly, extracted from https://github.com/finos/perspective

Currently builds Apache Arrow version `5.0.0`.

[![Build Status](https://github.com/timkpaine/arrow-wasm-cpp/workflows/Build%20Status/badge.svg?branch=main)](https://github.com/timkpaine/arrow-wasm-cpp/actions?query=workflow%3A%22Build+Status%22)
[![License](https://img.shields.io/github/license/timkpaine/arrow-wasm-cpp.svg)](https://github.com/timkpaine/arrow-wasm-cpp/)
[![npm](https://img.shields.io/npm/v/apache-arrow-wasm)](https://www.npmjs.com/package/apache-arrow-wasm)


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