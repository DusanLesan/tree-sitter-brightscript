"function" @keyword
"sub" @keyword.control
"end" @keyword
"as" @keyword

(function_declaration
	(identifier) @entity.name.function
)

(type_specifier) @type
parameterName: (identifier) @variable.parameter
(comment) @comment
