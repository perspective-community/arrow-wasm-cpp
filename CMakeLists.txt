cmake_minimum_required(VERSION 3.7.2)

set(CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake/modules" ${CMAKE_MODULE_PATH})

execute_process(COMMAND which emcc OUTPUT_VARIABLE EMCC)
execute_process(COMMAND which em++ OUTPUT_VARIABLE EMPP)
string(STRIP ${EMCC} EMCC)
string(STRIP ${EMPP} EMPP)

set(CMAKE_C_COMPILER ${EMCC})
set(CMAKE_CXX_COMPILER ${EMPP})
set(CMAKE_TOOLCHAIN_FILE "$ENV{EMSDK}/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake")

set(CMAKE_AR emar)
set(CMAKE_RANLIB emranlib)
set(CMAKE_EXECUTABLE_SUFFIX ".js")

set(CMAKE_CXX_FLAGS " \
    --bind \
    --source-map-base ./build/ \
    --memory-init-file 0 \
    -Wall \
    -s NO_EXIT_RUNTIME=1 \
    -fcolor-diagnostics \
    -s NO_FILESYSTEM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME=\"load_arrow\" \
    -s EXPORT_ES6=1 \
    -s USE_ES6_IMPORT_META=0 \
    ")

set(CMAKE_EXE_LINKER_FLAGS "")
set(CMAKE_C_LINK_FLAGS "")
set(CMAKE_CXX_LINK_FLAGS "")
set(HAVE_FLAG_SEARCH_PATHS_FIRST 0)

cmake_policy(SET CMP0077 NEW)

project(arrow)

set(CMAKE_BUILD_TYPE "Release")
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)


# set arrow flags
set(ARROW_BUILD_BENCHMARKS OFF)
set(ARROW_BUILD_EXAMPLES OFF)
set(ARROW_BUILD_INTEGRATION OFF)
set(ARROW_BUILD_TESTS OFF)
set(ARROW_CUDA OFF)
set(ARROW_DATASET OFF)
set(ARROW_FUZZING OFF)
set(ARROW_GANDIVA OFF)
set(ARROW_OPTIONAL_INSTALL OFF)
set(ARROW_PARQUET OFF)
set(ARROW_PYTHON OFF)
set(ARROW_JNI OFF)
set(ARROW_ORC OFF)
set(ARROW_ORC OFF)

set(ARROW_BUILD_STATIC ON)
set(ARROW_NO_DEPRECATED_API ON)

set(RAPIDJSON_BUILD_DOC OFF)
set(RAPIDJSON_BUILD_EXAMPLES OFF)
set(RAPIDJSON_BUILD_TESTS OFF)
set(RAPIDJSON_BUILD_THIRDPARTY_GTEST OFF)
set(RAPIDJSON_BUILD_CXX11 ON)
option(RAPIDJSON_ENABLE_INSTRUMENTATION_OPT OFF)

function (build_dep name)
    configure_file("${CMAKE_SOURCE_DIR}/cmake/${name}.txt.in"
                ${name}-download/CMakeLists.txt)

    execute_process(COMMAND ${CMAKE_COMMAND} -G "${CMAKE_GENERATOR}" .
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/${name}-download )

    execute_process(COMMAND ${CMAKE_COMMAND} --build .
    WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/${name}-download )

	if(${name} STREQUAL arrow)
        configure_file(${CMAKE_SOURCE_DIR}/cmake/arrow/CMakeLists.txt ${CMAKE_BINARY_DIR}/arrow-src/cpp/ COPYONLY)
        configure_file(${CMAKE_SOURCE_DIR}/cmake/arrow/config.h ${CMAKE_BINARY_DIR}/arrow-src/cpp/src/arrow/util/ COPYONLY)
        include_directories(${CMAKE_BINARY_DIR}/arrow-src/cpp/src/)
        add_subdirectory(${CMAKE_BINARY_DIR}/${name}-src/cpp
            ${CMAKE_BINARY_DIR}/${name}-build
            EXCLUDE_FROM_ALL)

    else()
        include_directories(${CMAKE_BINARY_DIR}/${name}-src/include)
        include_directories(${CMAKE_BINARY_DIR}/${name}-src)
        add_subdirectory(${CMAKE_BINARY_DIR}/${name}-src
            ${CMAKE_BINARY_DIR}/${name}-build
            EXCLUDE_FROM_ALL)
    endif()
endfunction()


build_dep(arrow)
build_dep(rapidjson)


add_executable(arrow_esm src/emscripten.cpp)
set_target_properties(arrow_esm PROPERTIES RUNTIME_OUTPUT_DIRECTORY "./esm/")
set_target_properties(arrow_esm PROPERTIES OUTPUT_NAME "arrow.cpp")
target_link_libraries(arrow_esm arrow)

add_executable(arrow_cjs src/emscripten.cpp)
set_target_properties(arrow_cjs PROPERTIES COMPILE_FLAGS "-s ENVIRONMENT=node")
set_target_properties(arrow_cjs PROPERTIES RUNTIME_OUTPUT_DIRECTORY "./cjs/")
set_target_properties(arrow_cjs PROPERTIES OUTPUT_NAME "arrow.cpp")
target_link_libraries(arrow_esm arrow)
