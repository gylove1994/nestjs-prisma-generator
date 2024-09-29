import type { Field, Model } from "@mrleebo/prisma-ast";
import { createdEnumMap } from "../generateEnum";
import { typeMap } from "./typeMap";

export function getRelation(model: Model | Field[], omitEnum = false) {
	const target = Array.isArray(model) ? model : model.properties;
	let relations = target
		.filter((v) => v.type === "field" && v.fieldType === typeMap(v.fieldType))
		.map((v: any) => v.fieldType);
	if (omitEnum) {
		relations = relations.filter((v) => !createdEnumMap.has(v));
	}
	return relations as string[];
}

export function getRelationMap(model: Model | Field[], omitEnum = false) {
	const target = Array.isArray(model) ? model : model.properties;
	let relations = target
		.filter((v) => v.type === "field" && v.fieldType === typeMap(v.fieldType))
		.map((v: any) => [v.fieldType, v.name] as [string, string]);
	if (omitEnum) {
		relations = relations.filter((v) => !createdEnumMap.has(v[0]));
	}
	const map = new Map<string, string>(relations);
	return map;
}
