import type { Model, Schema } from "@mrleebo/prisma-ast";
import { propertyMap } from "./utils/propertyMap";
import { swaggerMap } from "./utils/swaggerMap";
import { strings } from "@angular-devkit/core";
import { getRelation } from "./utils/getRelation";
import { importApiProperty, importEntity } from "./utils/import";
import { mkFile } from "./utils/mkFile";
import chalk from "chalk";

export function generateEntity(model: Model) {
  const propertiesContent = model.properties
    .filter((v) => v.type === "field")
    .map((prop) => {
      return swaggerMap(prop) + propertyMap(prop);
    })
    .join("\n");
  const imports = getRelation(model).map(importEntity).concat(importApiProperty()).join("");
  const content = `${imports}\nexport class ${strings.classify(
    model.name
  )} {\n${propertiesContent}}\n`;
  return {
    name: `${strings.classify(model.name)}Entity.ts`,
    content,
  };
}

export function generateEntityFile(prisma: Schema, outputPath: string) {
  const entityList = prisma.list.filter((item) => item.type === "model");
  for (const entity of entityList) {
    const { name, content } = generateEntity(entity);
    console.log(chalk.green("CREATE ") + chalk.blue(`${outputPath}/${name}`));
    mkFile(outputPath, name, content);
  }
}
