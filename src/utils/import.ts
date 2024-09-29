import { strings } from "@angular-devkit/core";
import { createdEnumMap } from "../generateEnum";

export function importFile(importName: string, useRelativePath = false) {
	if (importName === "JsonValue") {
		return `import { JsonValue } from "@prisma/client/runtime/library";\n`;
	}
	if (
		createdEnumMap.has(importName) ||
		createdEnumMap.has(importName.toUpperCase())
	) {
		return `import { ${importName} } from "${useRelativePath ? "@entity/" : "./"}${strings.camelize(importName)}Enum";\n`;
	}
	return `import { ${importName} } from "${useRelativePath ? "@entity/" : "./"}${strings.camelize(importName)}Entity";\n`;
}

export function importApiProperty() {
	return `import { ApiProperty } from "@nestjs/swagger";\n`;
}

export function importJsonValue() {
	return `import { JsonValue } from "@prisma/client/runtime/library";\n`;
}

export function importPickType() {
	return `import { PickType } from "@nestjs/swagger";\n`;
}
