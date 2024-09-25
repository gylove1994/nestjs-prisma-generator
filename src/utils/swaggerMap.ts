import type { Field } from "@mrleebo/prisma-ast";
import { swaggerTypeMap, typeMap } from "./typeMap";
import { createdEnumMap } from "../generateEnum";

export function swaggerMap(field: Field) {
	if (typeof field.fieldType !== "string") {
		return "";
	}
	const type = typeMap(field.fieldType).toString();
	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
	if (createdEnumMap.has(type) || createdEnumMap.has(capitalizedType)) {
		return `@ApiProperty({ enum: ${capitalizedType}, description: "${
			field.comment || ""
		}", isArray: ${field.array || false}, required: ${
			field.optional || true
		} })\n`;
	}
	return `@ApiProperty({ type: ${swaggerTypeMap(field.fieldType)}, description: "${
		field.comment || ""
	}", isArray: ${field.array || false}, required: ${
		field.optional || true
	} })\n`;
}
