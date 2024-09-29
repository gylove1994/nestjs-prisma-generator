import type { Field } from "@mrleebo/prisma-ast";
import { classValidatorTypeMap, typeMap } from "./typeMap";

export function classValidatorMap(field: Field) {
	const type = classValidatorTypeMap(field.fieldType).toString();
	const res = `${
		type !== "@IsEnum"
			? `${type}({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)} 类型",${field.array ? "each: true" : ""}})\n${field.optional ? "@IsOptional()\n" : ""}${field.array ? `@IsArray({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)}[] 类型"})\n` : ""}`
			: `${type}({enum: ${field.fieldType} ,message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)} 类型"})\n${field.optional ? "@IsOptional()\n" : ""}${field.array ? `@IsArray({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)}[] 类型"})\n` : ""}`
	}`;
	console.log(res);
	return res;
}
