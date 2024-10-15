import type { Field, Func } from "@mrleebo/prisma-ast";
import { classValidatorMap } from "./classValidatorMap";
import { getRelation, getRelationMap } from "./getRelation";
import { swaggerMap } from "./swaggerMap";
import { classValidatorTypeMap, typeMap } from "./typeMap";

export function propertyMap(field: Field) {
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)}${field.array ? "[]" : ""} ${field.optional ? "| null" : ""}\n`;
}

export function noRelationPropertyMap(field: Field) {
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)}NoRelation${field.array ? "[]" : ""} ${field.optional ? "| null" : ""}\n`;
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
		return `${swaggerMap(field, { setType: "String", setArray: true, setRequired: false, setDescription: `${field.name}Ids` })}@IsString({ each: true, message: "${field.name}Ids 类型错误，请传入 string[] 类型" })\n//@IsUUID("4", { each: true, message: "${field.name}Ids 类型错误，请传入 uuid[] 类型" })\n@IsOptional()\n${field.name}Ids${field.optional ? "?" : ""}: string[] | null\n`;
	}
	if (isRelation && hasRelationId) {
		return "";
	}
	return `${swaggerMap(field, { setRequired: !field.optional, setDescription: `${field.name}` })}${classValidatorMap(
		field,
	)}${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}

export function paginationDtoPropertyMap(field: Field, array: Field[]) {
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
			return `@IsDate({ each: true, message: "${field.name} 类型错误，请传入 Date[] 类型" })\n@Transform(({ value }) => Array.isArray(value) ? value.map((v) => new Date(v)).sort((a, b) => a.getTime() - b.getTime()) 	: new Date(value))\n@IsOptional()\n@ApiPropertyOptional({ type: [Date], description: "搜索条件：${field.name}，小的为开始时间，大的为结束时间" })\n${field.name}${field.optional ? "?" : ""}: Date[] | null\n`;
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
		return `${swaggerMap(field, { setType: "String", setArray: true, setRequired: false, setDescription: `搜索条件：${field.name}Ids，搜索模式为精确匹配，搜索包含所有Id的项目` })}@IsString({ each: true, message: "${field.name}Ids 类型错误，请传入 string[] 类型" })\n//@IsUUID("4", { each: true, message: "${field.name}Ids 类型错误，请传入 uuid[] 类型" })\n@IsOptional()\n${field.name}Ids${field.optional ? "?" : ""}: string[] | null\n`;
	}
	if (isRelation && hasRelationId) {
		return "";
	}
	return `${swaggerMap(field, { setRequired: false, setDescription: `搜索条件：${field.name}，搜索模式为模糊匹配` })}${classValidatorMap(
		field,
	)}${field.name}?: ${typeMap(field.fieldType)} | null\n`;
}
