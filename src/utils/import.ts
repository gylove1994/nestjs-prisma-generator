import { createdEnumMap } from "../generateEnum";

export function importFile(importName: string, useRelativePath = false) {
	if (
		createdEnumMap.has(importName) ||
		createdEnumMap.has(importName.toUpperCase())
	) {
		return `import { ${importName} } from "${useRelativePath ? "@entity/" : ""}${importName}Enum";\n`;
	}
	return `import { ${importName} } from "${useRelativePath ? "@entity/" : ""}${importName}Entity";\n`;
}

export function importApiProperty() {
	return `import { ApiProperty } from "@nestjs/swagger";\n`;
}

export function importJsonValue() {
	return `import { JsonValue } from "@prisma/client";\n`;
}

export function importPickType() {
	return `import { PickType } from "@nestjs/swagger";\n`;
}
