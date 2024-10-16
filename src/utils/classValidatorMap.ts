import type { Field } from "@mrleebo/prisma-ast";
import { classValidatorTypeMap, typeMap } from "./typeMap";

export function classValidatorMap(
	field: Field,
	option?: { setOptional: boolean },
) {
	const type = classValidatorTypeMap(field.fieldType).toString();
	const optional = option?.setOptional ? true : field.optional;
	const res = `${
		type !== "@IsEnum"
			? `${type}({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)} 类型"${
					optional || field.array ? ", " : ""
				}${field.array ? "each: true" : ""}})\n${
					optional ? "@IsOptional()\n" : ""
				}${field.array ? `@IsArray({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)}[] 类型"})\n` : ""}`
			: `${type}(${field.fieldType},{message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)} 类型"})\n${optional ? "@IsOptional()\n" : ""}${field.array ? `@IsArray({message: "${field.name} 类型错误，请传入 ${typeMap(field.fieldType)}[] 类型"})\n` : ""}`
	}`;
	return res;
}
