const PREC = {
	OR: 1,
	AND: 2,
	COMP: 3,
	ADD: 9,
	MULT: 10,
	UNARY: 11,
};

const WHITESPACE = /\s/;
const DECIMAL_DIGIT = /[0-9]/;
const HEXADECIMAL_DIGIT = /[0-9a-fA-F]/;

const _numeral = (digit) => choice(
	repeat1(digit),
	seq(repeat1(digit), '.', repeat(digit)),
	seq(repeat(digit), '.', repeat1(digit)),
);

const _list = (rule, separator) => seq(rule, repeat(seq(separator, rule)));

module.exports = grammar({
	name: 'brightscript',

	rules: {
		source_file: $ => $._block,

		_block: $ => choice(
			seq(repeat1($.statement), optional($.return_statement)),
			seq(repeat($.statement), $.return_statement)
		),

		statement: $ => choice(
			$.assignment_statement,
			$.function_call,
			$.goto_statement,
			$.exit_statement,
			$.do_statement,
			$.while_statement,
			$.if_statement,
			$.for_numeric_statement,
			$.for_each_statement,
			$.function_declaration,
		),

		function_declaration: $ => seq(
			choice('sub', 'function'),
			field( 'name', $.identifier),
			'(', optional(field('parameters', optional(commaSep($.parameter)))), ')',
			optional(seq('as', $.type)),
			optional(field('body', $._block)),
			choice('end sub', 'end function')
		),

		parameter: $ => seq(
			field('parameterName', $.expression),
			optional(seq('as', $.type))
		),

		type: $ => choice(
			'boolean',
			'bool',
			'integer',
			'longInteger',
			'long',
			'float',
			'double',
			'string',
			'object',
			'interface',
			'dynamic'
		),

		assignment_statement: $ => seq(
			$.variable,
			'=',
			$.expression_list
		),

		function_call: $ => seq(
			field('name', choice(
				$._prefix_expression,
				alias($._table_method_variable, $.variable),
			)),
			field('arguments', $.argument_list),
		),

		_table_method_variable: $ => seq(field('table', $.prefix_expression), $._method_identifier),
		_method_identifier: $ => seq(':', field('method', $.identifier)),

		argument_list: $ => choice(
			seq(
				'(',
				optional($.expression_list),
				')'
			),
			$.associative_array,
			$.string
		),

		for_each_statement: $ => seq(
			'for each',
			field('left', $.identifier),
			'in',
			field('right', $.expression),
			optional(field('body', $._block)),
			'end', 'for',
		),

		for_numeric_statement: $ => seq(
			'for',
			field('name', $.identifier),
			'=',
			field('start', $.expression),
			'to',
			field('end', $.expression),
			optional(seq(',', field('step', $.expression))),
			optional(field('body', $._block)),
			'end', 'for',
		),

		if_statement: $ => seq(
			'if',
			field('condition', $.expression),
			optional('then'),
			optional(field('consequence', $._block)),
			repeat(field('alternative', $.else_if_statement)),
			optional(field('alternative', $.else_statement)),
			'end', 'if'
		),
		else_if_statement: $ => seq(
			'else if',
			field('condition', $.expression),
			optional('then'),
			optional(field('consequence', $._block))
		),
		else_statement: $ => seq(
			'else',
			optional(field('consequence', $._block))
		),

		while_statement: $ => seq(
			'while',
			field('condition', $.expression),
			'do',
			optional(field('body', $._block)),
			'end', 'while',
		),

		do_statement: $ => seq('do', optional(field('body', $._block)), 'end'),
		exit_statement: () => seq('exit', choice('for','while')),
		goto_statement: $ => seq('goto', field('name', $.identifier)),
		return_statement: $ => prec.left(1, seq('return', optional($.expression_list))),

		expression: $ => choice(
			$.invalid,
			$.false,
			$.true,
			$.number,
			$.string,
			$.variable,
			$.prefix_expression,
			$.associative_array,
			$.unary_expression,
			$.binary_expression,
		),

		expression_list: $ => _list($.expression, ','),
		prefix_expression: $ => choice($.variable, $.function_call, $.parenthesized_expression),
		_prefix_expression: $ => prec(1, $.prefix_expression),

		variable: $ => choice($.identifier, $.bracket_index_expression, $.dot_index_expression),

		bracket_index_expression: $ => seq(
			field('table', $._prefix_expression),
			'[',
			field('field', $.expression),
			']'
		),

		dot_index_expression: $ => seq(
			field('table', $._prefix_expression),
			choice('.', field('optional_chain', $.optional_chain)),
			field('field', $.identifier)
		),

		binary_expression: $ => choice(
			...[
				['or', PREC.OR],
				['and', PREC.AND],
				['=', PREC.COMP],
				['<>', PREC.COMP],
				['<', PREC.COMP],
				['>', PREC.COMP],
				['<=', PREC.COMP],
				['>=', PREC.COMP],
				['+', PREC.ADD],
				['-', PREC.ADD],
				['*', PREC.MULT],
				['/', PREC.MULT],
				['mod', PREC.MULT],
			].map(([operator, priority]) => prec.left(priority,
				seq(
					field('left', $.expression),
					field('operator', operator),
					field('right', $.expression),
				),
			)),
		),

		unary_expression: $ => choice(
			...['not', '#', '-', '~'].map((operator) =>
				prec.left(
					PREC.UNARY,
					seq(field('operator', operator), field('argument', $.expression)),
				),
			),
		),

		associative_array: $ => seq('{', optional($.field_list), '}'),
		field_list: $ => seq(_list($.field, $.field_separator), optional($.field_separator)),
		field: $ => seq(field('value', $.expression)),
		field_separator: () => ',',
		optional_chain: _ => '?.',

		parenthesized_expression: $ => seq('(', $.expression, ')'),

		number: $ => token(seq(
			optional('-'),
			_numeral(DECIMAL_DIGIT)
		)),

		identifier: (_) => {
			const identifier_start =
				/[^\p{Control}\s+\-*/%^#&~|<>=(){}\[\];:,.?\\'"\d]/;
			const identifier_continue =
				/[^\p{Control}\s+\-*/%^#&~|<>=(){}\[\];:,.?\\'"]*/;
			return token(seq(identifier_start, identifier_continue));
		},

		true: () => 'true',
		false: () => 'false',
		invalid: () => 'invalid',
		comment: $ => seq("'", optional(/.*/), /\n/),
		string: $ => /"[^"]*"/,
	},

	extras: $ => [WHITESPACE, $.comment],
	inline: $ => [$.prefix_expression, $.field_separator],
	supertypes: $ => [$.statement, $.expression, $.variable],
	word: $ => $.identifier,
});

function commaSep(rule) {
	return optional(seq(rule, repeat(seq(',', rule))));
}
