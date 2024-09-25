import type { Func } from "@mrleebo/prisma-ast";

export function typeMap(type: string | Func) {
	switch (type) {
		case "String":
			return "string";
		case "Int":
			return "number";
		case "Float":
			return "number";
		case "Boolean":
			return "boolean";
		case "DateTime":
			return "Date";
		case "Json":
			return "JsonValue";
		default:
			return type;
	}
}

export function swaggerTypeMap(type: string | Func) {
	switch (type) {
		case "String":
			return "String";
		case "Int":
			return "Number";
		case "Float":
			return "Number";
		case "Boolean":
			return "Boolean";
		case "DateTime":
			return "Date";
		case "Json":
			return "Object";
		default:
			return type;
	}
}
