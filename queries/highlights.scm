[
	"as"
	"if"
	"then"
	"else"
	"else if"
	"for"
	"for each"
	"in"
	"to"
	"exit"
	"return"
	"end"
] @keyword

[
	"sub"
	"function"
	"end sub"
	"end function"
] @type

(identifier) @variable.parameter

(function_declaration
	 name: (identifier) @function.method)

(function_call
	name: [
		(identifier) @function.call
		(dot_index_expression
			field: (identifier) @function.call)
	])

(comment) @comment
(number) @number
(string) @string
(type) @type
(invalid) @type
