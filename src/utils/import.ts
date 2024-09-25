import { createdEnumMap } from "../generateEnum";

export function importFile(importName: string) {
	if (createdEnumMap.has(importName) || createdEnumMap.has(importName.toUpperCase())) {
		return `import { ${importName} } from "./${importName}Enum";\n`;
	}
	return `import { ${importName} } from "./${importName}Entity";\n`;
}

export function importApiProperty() {
	return `import { ApiProperty } from "@nestjs/swagger";\n`;
}
