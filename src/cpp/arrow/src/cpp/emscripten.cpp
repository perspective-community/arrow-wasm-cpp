/******************************************************************************
 *
 * Copyright (c) 2021, the arrow-wasm-cpp Authors.
 *
 * This file is part of the arrow-wasm-cpp library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

#include <exprtkjs/emscripten.h>
#include <emscripten/bind.h>
#include <cstdio>
#include <string>
#include <exprtk.hpp>

using namespace emscripten;

template <typename T>
void trig_function()
{
   typedef exprtk::symbol_table<T> symbol_table_t;
   typedef exprtk::expression<T>   expression_t;
   typedef exprtk::parser<T>       parser_t;

   const std::string expression_string =
                     "clamp(-1.0,sin(2 * pi * x) + cos(x / 2 * pi),+1.0)";

   T x;

   symbol_table_t symbol_table;
   symbol_table.add_variable("x",x);
   symbol_table.add_constants();

   expression_t expression;
   expression.register_symbol_table(symbol_table);

   parser_t parser;
   parser.compile(expression_string,expression);

   for (x = T(-5); x <= T(+5); x += T(0.001))
   {
      const T y = expression.value();
      printf("%19.15f\t%19.15f\n", x, y);
   }
}

int main()
{
   trig_function<double>();
   return 0;
}

/******************************************************************************
 *
 * Embind
 */

EMSCRIPTEN_BINDINGS(exprtk) {
    function("trig_function", &trig_function<double>);
}