import type { Field } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function propertyMap(field: Field) {
	return `${field.name}${field.optional ? "?" : ""}: ${typeMap(
		field.fieldType,
	)} ${field.optional ? "| null" : ""}\n`;
}
