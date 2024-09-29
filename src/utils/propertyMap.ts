import type { Field, Func } from "@mrleebo/prisma-ast";
import { classValidatorMap } from "./classValidatorMap";
import { getRelation } from "./getRelation";
import { classValidatorTypeMap, typeMap } from "./typeMap";

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
		return `@IsString({ each: true, message: "${field.name}Ids 类型错误，请传入 string[] 类型" })\n//@IsUUID("4", { each: true, message: "${field.name}Ids 类型错误，请传入 uuid[] 类型" })\n@IsOptional()\n${field.name}Ids${field.optional ? "?" : ""}: string[] ${field.optional ? "| null" : ""}\n`;
	}
	if (isRelation && hasRelationId) {
		return "";
	}
	return `${classValidatorMap(field)}${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}
