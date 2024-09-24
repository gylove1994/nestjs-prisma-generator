import type { Field } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function swaggerMap(field: Field) {
	if (typeof field.fieldType !== "string") {
		return "";
	}
	const type = typeMap(field.fieldType).toString();
	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
	return `@ApiProperty({ type: ${capitalizedType}, description: "${
		field.comment || ""
	}", isArray: ${field.array || false}, required: ${
		field.optional || true
	} })\n`;
}
