cmake_minimum_required(VERSION 3.7.2)
project(arrow)
include(CheckCCompilerFlag)

set(CMAKE_BUILD_TYPE "Release")
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

if(NOT DEFINED ARROW_WASM_CMAKE_MODULE_PATH)
	set(ARROW_WASM_CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/../../../cmake/")
endif()
set(CMAKE_MODULE_PATH "${ARROW_WASM_CMAKE_MODULE_PATH}/modules" ${CMAKE_MODULE_PATH})

if(${CMAKE_SYSTEM_NAME} MATCHES "Windows")
	set(WIN32 ON)
    set(MACOS OFF)
    set(LINUX OFF)
elseif(${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
    set(WIN32 OFF)
    set(MACOS ON)
    set(LINUX OFF)
else()
    set(WIN32 OFF)
    set(MACOS OFF)
    set(LINUX ON)
endif()

## Helper function
function(string_starts_with str search)
	string(FIND "${str}" "${search}" out)
	if("${out}" EQUAL 0)
		return(true)
	endif()
	return(false)
endfunction()

set(BUILD_MESSAGE "")
function (arrow_wasm_build_message message)
	set(BUILD_MESSAGE "${BUILD_MESSAGE}\n${message}")
endfunction()

###################################################
# Helper to grab dependencies from remote sources #
###################################################
function (arrow_wasm_build_dep name)
	if(EXISTS ${CMAKE_BINARY_DIR}/${name}-build)
		arrow_wasm_build_message("${Cyan}Dependency found - not rebuilding - ${CMAKE_BINARY_DIR}/${name}-build${ColorReset}")
	else()
		configure_file("${ARROW_WASM_CMAKE_MODULE_PATH}/${name}.txt.in"
				${name}-download/CMakeLists.txt)

		execute_process(COMMAND ${CMAKE_COMMAND} -G "${CMAKE_GENERATOR}" .
			RESULT_VARIABLE result
			WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/${name}-download )

		if(result)
			message(FATAL_ERROR "CMake step for ${name} failed: ${result}")
		endif()

		execute_process(COMMAND ${CMAKE_COMMAND} --build .
			RESULT_VARIABLE result
			WORKING_DIRECTORY ${CMAKE_BINARY_DIR}/${name}-download )

		if(result)
			message(FATAL_ERROR "Build step for ${name} failed: ${result}")
		endif()
	endif()

	if(${name} STREQUAL arrow)
		# Overwrite arrow's CMakeLists with our custom, minimal CMakeLists.
		configure_file(${ARROW_WASM_CMAKE_MODULE_PATH}/arrow/CMakeLists.txt ${CMAKE_BINARY_DIR}/arrow-src/cpp/ COPYONLY)
		configure_file(${ARROW_WASM_CMAKE_MODULE_PATH}/arrow/config.h ${CMAKE_BINARY_DIR}/arrow-src/cpp/src/arrow/util/ COPYONLY)
		add_subdirectory(${CMAKE_BINARY_DIR}/arrow-src/cpp/
			${CMAKE_BINARY_DIR}/arrow-build
			EXCLUDE_FROM_ALL)

		include_directories(${CMAKE_BINARY_DIR}/arrow-src/cpp/src/)
	elseif(${name} STREQUAL exprtk)
		# no cmakelists - just include the header
		include_directories(${CMAKE_BINARY_DIR}/${name}-src)
	else()
		add_subdirectory(${CMAKE_BINARY_DIR}/${name}-src
			${CMAKE_BINARY_DIR}/${name}-build
			EXCLUDE_FROM_ALL)

		include_directories(${CMAKE_BINARY_DIR}/${name}-src/extras/${name}/include)
		include_directories(${CMAKE_BINARY_DIR}/${name}-src/include)
		include_directories(${CMAKE_BINARY_DIR}/${name}-src)
	endif()
endfunction()
##############################


#######################
# BUILD CONFIGURATION #
#######################
find_package(Color)

option(CMAKE_BUILD_TYPE "Release/Debug build" RELEASE)

if(DEFINED ENV{ARROW_WASM_DEBUG})
	set(CMAKE_BUILD_TYPE DEBUG)
else()
	if (NOT DEFINED CMAKE_BUILD_TYPE)
		set(CMAKE_BUILD_TYPE RELEASE)
	endif()
endif()

set(BUILD_MESSAGE "${BUILD_MESSAGE}\n${Cyan}Building WASM binding${ColorReset}")

if(NOT DEFINED ARROW_WASM_CPP_SRC)
	set(ARROW_WASM_CPP_SRC "${CMAKE_SOURCE_DIR}")
endif()

string(TOLOWER "${CMAKE_BUILD_TYPE}" CMAKE_BUILD_TYPE_LOWER )

if(CMAKE_BUILD_TYPE_LOWER STREQUAL debug)
	set(BUILD_MESSAGE "${BUILD_MESSAGE}\n${Red}Building DEBUG${ColorReset}")
	add_definitions(-DARROW_WASM_DEBUG)
else()
	set(BUILD_MESSAGE "${BUILD_MESSAGE}\n${Cyan}Building RELEASE${ColorReset}")
endif()


#######################
include_directories("${CMAKE_SOURCE_DIR}/src/include")

if(NOT WIN32)
	set(CMAKE_CXX_FLAGS_RELEASE "-O3 -DNDEBUG")
	set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG")
endif()

####################
# EMSCRIPTEN BUILD #
####################
execute_process(COMMAND which emcc OUTPUT_VARIABLE EMCC)
execute_process(COMMAND which em++ OUTPUT_VARIABLE EMPP)
string(STRIP ${EMCC} EMCC)
string(STRIP ${EMPP} EMPP)
set(CMAKE_C_COMPILER ${EMCC})
set(CMAKE_CXX_COMPILER ${EMPP})
set(CMAKE_TOOLCHAIN_FILE "$ENV{EMSCRIPTEN_ROOT}/cmake/Modules/Platform/Emscripten.cmake")
set(CMAKE_AR emar)
set(CMAKE_RANLIB emranlib)
set(CMAKE_EXECUTABLE_SUFFIX ".js")
list(APPEND CMAKE_PREFIX_PATH /usr/local)

# Assumes that Boost includes will be in this folder.
include_directories("/usr/local/include" SYSTEM)

# Include this docker-only directory.
include_directories("/boost_includes")

set(EXTENDED_FLAGS " \
    --bind \
    --source-map-base ./build/ \
    --memory-init-file 0 \
    -Wall \
    -fcolor-diagnostics \
    ")

if(CMAKE_BUILD_TYPE_LOWER STREQUAL debug)
    set(OPT_FLAGS " \
        -O0 \
        -g3 \
        -gsource-map \
        --profiling \
        -Wcast-align \
        -Wover-aligned \
        ")
else()
    set(OPT_FLAGS " \
        -O3 \
        -g0 \
        ")

    # TODO: -flto
endif()

set(ASYNC_MODE_FLAGS "")

# Setup and build deps
# set arrow flags
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

arrow_wasm_build_dep(arrow)
arrow_wasm_build_dep(rapidjson)
#####################

set(CMAKE_C_FLAGS " \
	${CMAKE_C_FLAGS} \
	${EXTENDED_FLAGS} \
	${OPT_FLAGS} \
	")

if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=c++1y")
endif()

set (SOURCE_FILES
    ${ARROW_WASM_CPP_SRC}/src/cpp/base.cpp
)

if (WIN32)
	set(CMAKE_CXX_FLAGS " /EHsc /MP /bigobj")
else()
	set(CMAKE_CXX_FLAGS " ${CMAKE_CXX_FLAGS} ${CMAKE_C_FLAGS}")
endif()

message("${BUILD_MESSAGE}\n")


set(CMAKE_EXE_LINKER_FLAGS  "${CMAKE_EXE_LINKER_FLAGS} \
    -s EXPORT_ES6=1 \
    -s NO_EXIT_RUNTIME=1 \
    -s NO_FILESYSTEM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME=\"load_arrow_wasm\" \
    -s MAXIMUM_MEMORY=4gb \
    -s USE_ES6_IMPORT_META=0 \
    -s EXPORTED_FUNCTIONS=\"['_main']\" \
")

add_library(arrow_wasm ${SOURCE_FILES})
target_compile_definitions(arrow_wasm PRIVATE ARROW_WASM_ENABLE_WASM=1)
set_target_properties(arrow_wasm PROPERTIES COMPILE_FLAGS "")

# "esm/erspective.cpp.js" from CMAKE_EXECUTABLE_SYNTAX
add_executable(arrow_wasm_esm src/cpp/emscripten.cpp)
target_link_libraries(arrow_wasm_esm arrow_wasm)
target_link_options(arrow_wasm_esm PRIVATE -s ENVIRONMENT=worker)
target_compile_definitions(arrow_wasm_esm PRIVATE ARROW_WASM_ENABLE_WASM=1)
set_target_properties(arrow_wasm_esm PROPERTIES RUNTIME_OUTPUT_DIRECTORY "./esm/")
set_target_properties(arrow_wasm_esm PROPERTIES OUTPUT_NAME "arrow_wasm.cpp")

# "cjs/arrow_wasm.cpp.js" from CMAKE_EXECUTABLE_SYNTAX
add_executable(arrow_wasm_cjs src/cpp/emscripten.cpp)
target_link_libraries(arrow_wasm_cjs arrow_wasm)
target_link_options(arrow_wasm_cjs PRIVATE -s ENVIRONMENT=node)
target_compile_definitions(arrow_wasm_cjs PRIVATE ARROW_WASM_ENABLE_WASM=1)
set_target_properties(arrow_wasm_cjs PROPERTIES RUNTIME_OUTPUT_DIRECTORY "./cjs/")
set_target_properties(arrow_wasm_cjs PROPERTIES OUTPUT_NAME "arrow_wasm.cpp")
