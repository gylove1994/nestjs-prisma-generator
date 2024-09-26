import type { Field, Func } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function propertyMap(field: Field) {
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}

export function isFunc(field: any): field is Func {
	return (
		typeof field === "object" &&
		field !== null &&
		"name" in field &&
		field.type === "function" &&
		"params" in field
	);
}

export function dtoPropertyMap(field: Field) {
	if (field.type === "field" && field.fieldType === "DateTime") {
		const isNow = field.attributes?.find(
			(v) =>
				v.name === "default" &&
				v.type === "attribute" &&
				v.args?.[0].type === "attributeArgument" &&
				isFunc(v.args?.[0].value) &&
				v.args?.[0].value.name === "now",
		);
		const isUpdatedAt = field.attributes?.find(
			(v) => v.type === "attribute" && v.name === "updatedAt",
		);
		if (isNow || isUpdatedAt) {
			return "";
		}
	}
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}
