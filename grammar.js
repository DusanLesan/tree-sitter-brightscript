const PREC = {
	COMMENT: 0,
	ASSIGN: 1,
	OR: 2,
	AND: 3,
	EQUALITY: 4,
	REL: 5,
	ADD: 6,
	MULT: 7
};

module.exports = grammar({
	name: 'brightscript',

	rules: {
		source_file: $ => repeat($._toplevel_statement),

		_toplevel_statement: $ => choice(
			$._statement,
			$.method_declaration,
			$.comment,
		),

		statements: $ => repeat1($._statement),

		_statement: $ => choice(
			$.if_statement,
			$.for_statement,
			// $.keywords,
			$.constant_invalid,
			$.if_statement,
			$.for_statement,
			$.asoc_array,
			$.return_statement,
			$.exit_statement,
			$.expression_statement,
		),

		expression_statement: $ => seq($.expression, /\n/),

		expression: $ => choice(
			$.string_literal,
			$.number_literal,
			$.boolean_literal,
			$.assignment_expression,
			$.binary_expression,
			$.primary_expression
		),

		primary_expression: $ => choice(
			$.identifier,
			$.field_access,
			$.array_access,
			$.method_invocation
		),

		function_specifier: $ => choice('sub', 'function'),
		function_end: $ => choice('end sub', 'end function'),

		method_declaration: $ => seq(
			$.function_specifier,
			field('name', $.identifier),
			optional($.parameter_list),
			optional(seq('as', $.type_specifier)),
			$.block,
			$.function_end
		),

		block: $ => seq(/\n/, repeat($._statement)),

		parameter_list: $ => seq('(', optional(commaSep($.parameter)), ')'),
		parameter: $ => seq(
			field('parameterName', $.expression),
			optional(seq('as', $.type_specifier))
		),

		field_access: $ => seq(field('object', $.expression), '.', field('field', $.identifier)),
		array_access: $ => seq(field('array', $.expression), '[',field('index', $.expression),']'),

		assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
			field('left', choice(
				$.identifier,
				$.field_access,
				$.array_access
			)),
			field('operator', choice('=', '+=', '-=', '*=', '/=', ':')),
			field('right', $.expression)
		)),

		method_invocation: $ => seq(
			choice(
				field('name', $.identifier),
				seq(
					field('object', $.expression),
					'.',
					field('name', $.identifier),
				)
			),
			field('arguments', $.parameter_list)
		),

		type_specifier: $ => choice(
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

		if_statement: $ => seq(
			'if',
			$.expression_statement,
			optional(field('then','then')),
			$.statements,
			repeat($.else_if_clause),
			optional(seq('else', $.statements)),
			'end',
			'if'
		),

		else_if_clause: $ => seq(
			'else if', $.expression,
			optional(seq('then', $.statements))
		),

		for_statement: $ => choice(
			seq(
				'for', $.identifier,'=', $.expression, 'to',
				$.expression, optional(seq('step', $.expression)), $.statements,
				'end', 'for'
			),
			seq(
				'for', 'each', $.identifier, 'in',
				$.expression, $.statements,
				'end', 'for'
			)
		),

		assignment_statement: $ => seq(
			$.identifier,
			'=',
			$.expression_statement
		),

		return_statement: $ => prec.left(1, seq('return', optional($.expression))),
		exit_statement: $ => prec.left(1, seq('exit', optional($.identifier))),

		number_literal: $ => /-?\d+(\.\d+)?/,

		boolean_literal: $ => choice('true', 'false'),

		asoc_array: $ => seq('{', repeat(seq($.expression_statement, optional(','))), '}'),

		constant_invalid: $ => /invalid/i,

		identifier: $ => /[\p{L}_$][\p{L}\p{Nd}\u00A2_$]*/,

		binary_expression: $ => choice(
			...[
				['>', PREC.REL],
				['<', PREC.REL],
				['>=', PREC.REL],
				['<=', PREC.REL],
				['=', PREC.EQUALITY],
				['<>', PREC.EQUALITY],
				['and', PREC.AND],
				['or', PREC.OR],
				['+', PREC.ADD],
				['-', PREC.ADD],
				['*', PREC.MULT],
				['/', PREC.MULT],
				['mod', PREC.MULT]
			].map(([operator, precedence]) =>
				prec.left(precedence, seq(
					field('left', $.expression),
					field('operator', operator),
					field('right', $.expression)
				))
			)),

		// keywords: $ => choice('if', 'then', 'else', 'for', 'while', 'each', 'in', 'to', 'step', 'exit', 'next', 'return', 'end'),

		comment: $ => token(prec.left(PREC.COMMENT, /'.*\n/)),
		string_literal: $ => /"[^"]*"/,
	}
});

function commaSep(rule) {
	return optional(seq(rule, repeat(seq(',', rule))));
}
