import type { Field, Func } from "@mrleebo/prisma-ast";
import { getRelation } from "./getRelation";
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

export function dtoPropertyMap(field: Field, array: Field[]) {
	if (field.type === "field" && field.fieldType === "DateTime") {
		const isNow = field.attributes?.find(
			(v) =>
				v.name === "default" &&
				v.type === "attribute" &&
				v.args?.[0].type === "attributeArgument" &&
				isFunc(v.args?.[0].value) &&
				v.args?.[0].value.name === "now",
		);
		const isUpdatedAt = !!field.attributes?.find(
			(v) => v.type === "attribute" && v.name === "updatedAt",
		);
		if (isNow || isUpdatedAt) {
			return "";
		}
	}
	const isId = !!field.attributes?.find(
		(v) => v.type === "attribute" && v.name === "id",
	);
	if (isId) {
		return "";
	}
	const isRelation = getRelation(array).includes(field.fieldType as string);
	const hasRelationId =
		array.find((v) => {
			return v.name === `${field.name}Id`;
		}) ?? false;
	if (isRelation && field.array === true) {
		return `${field.name}Ids${field.optional ? "?" : ""}: string[] ${field.optional ? "| null" : ""}\n`;
	}
	if (isRelation && hasRelationId) {
		return "";
	}
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}
