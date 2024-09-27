import type { Field, Model, Property } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function getRelation(model: Model | Field[]) {
	const target = Array.isArray(model) ? model : model.properties;
	const relations = target
		.filter((v) => v.type === "field" && v.fieldType === typeMap(v.fieldType))
		.map((v: any) => v.fieldType);
	return relations as string[];
}

export function getRelationMap(model: Model | Field[]) {
	const target = Array.isArray(model) ? model : model.properties;
	const relations = target
		.filter((v) => v.type === "field" && v.fieldType === typeMap(v.fieldType))
		.map((v: any) => [v.fieldType, v.name] as [string, string]);
	const map = new Map<string, string>(relations);
	return map;
}
