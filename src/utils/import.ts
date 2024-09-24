export function importEntity(entity: string) {
  return `import { ${entity} } from "./${entity}Entity";\n`;
}

export function importApiProperty() {
  return `import { ApiProperty } from "@nestjs/swagger";\n`;
}