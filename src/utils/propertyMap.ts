import type { Field } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function propertyMap(field: Field) {
	return `${field.name}: ${typeMap(field.fieldType)}\n`;
}
