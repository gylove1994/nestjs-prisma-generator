import type { Field } from "@mrleebo/prisma-ast";
import { createdEnumMap } from "../generateEnum";
import { swaggerTypeMap, typeMap } from "./typeMap";

export type SwaggerMapOption = {
	isEnum?: boolean;
	setType?: string;
	setArray?: boolean;
	setRequired?: boolean;
	setDescription?: string;
};

export function swaggerMap(field: Field, setOption?: SwaggerMapOption) {
	if (typeof field.fieldType !== "string") {
		return "";
	}
	const type = typeMap(field.fieldType).toString();
	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
	if (createdEnumMap.has(type) || createdEnumMap.has(capitalizedType)) {
		return `@ApiProperty({ enum: ${capitalizedType}, description: "${
			setOption?.setDescription || field.comment || ""
		}", isArray: ${field.array || false}, required: ${
			setOption?.setRequired !== undefined
				? setOption.setRequired
				: field.optional !== undefined
					? field.optional === false
					: true
		} })\n`;
	}
	return `@ApiProperty({ ${setOption?.isEnum ? "enum: " : "type: "}${
		setOption?.setType !== undefined
			? setOption.setType
			: swaggerTypeMap(field.fieldType)
	}, description: "${setOption?.setDescription || field.comment || ""}", isArray: ${
		setOption?.setArray !== undefined
			? setOption.setArray
			: field.array !== undefined
				? field.array
				: false
	}, required: ${
		setOption?.setRequired !== undefined
			? setOption.setRequired
			: field.optional !== undefined
				? field.optional === false
				: true
	} })\n`;
}
