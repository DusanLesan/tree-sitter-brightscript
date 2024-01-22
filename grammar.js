module.exports = grammar({
	name: 'brightscript',

	rules: {
		source_file: $ => repeat($._statement),

		_statement: $ => choice(
			$.sub_declaration,
			$.function_declaration,
			$.assignment_statement,
			$.comment,
		),

		sub_declaration: $ => seq(
			'sub',
			$.identifier,
			$.parameter_list,
			optional($.statements),
			'end',
			'sub'
		),

		function_declaration: $ => seq(
			'function',
			$.identifier,
			$.parameter_list,
			optional($.as_clause),
			optional($.statements),
			'end',
			'function'
		),

		parameter_list: $ => seq(
			'(',
			optional(commaSep($.parameter)),
			')'
		),

		parameter: $ => seq(
			field('parameterName', $.identifier),
			optional(seq('as', $.type_specifier))
		),

		as_clause: $ => seq('as', $.type_specifier),

		type_specifier: $ => choice('integer', 'boolean', 'string', 'dynamic'),

		assignment_statement: $ => seq(
			optional('var'),
			$.identifier,
			'=',
			$._expression
		),

		_expression: $ => choice(
			$.string_literal,
			$.number_literal,
			$.boolean_literal,
			$.identifier,
			$.binary_operation,
		),

		string_literal: $ => /"[^"]*"/,

	number_literal: $ => /\d+(\.\d+)?/,

	boolean_literal: $ => choice('true', 'false'),

	identifier: $ => /[a-zA-Z_]\w*/,

	binary_operation: $ => prec.left(1, seq(
		field('left', $._expression),
		field('operator', choice('+', '-', '*', '/')),
		field('right', $._expression),
	)),

	comment: $ => choice(
		$.single_quote_comment,
		$.rem_comment,
	),

	single_quote_comment: $ => /'.*/,

	rem_comment: $ => /rem.*/,

	statements: $ => repeat1($._statement),
},
});

function commaSep(rule) {
	return optional(seq(rule, repeat(seq(',', rule))));
}
