[
	"as"
	"if"
	"then"
	"else"
	"else if"
	"for"
	"in"
	"to"
	"step"
	"exit"
	"return"
	"end"
] @keyword

(identifier) @variable.parameter

(function_specifier) @type
(method_declaration
	name: (identifier) @function.method)
(function_end) @type

(method_invocation
	name: (identifier) @function.method)
parameterName: (identifier) @variable.parameter
(type_specifier) @type
(type_specifier) @type

(comment) @comment
(number_literal) @number
(string_literal) @string

;(keywords) @keyword
(constant_invalid) @constant
