import { strings } from "@angular-devkit/core";
import type { Enum, Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";
import chalk from "chalk";

export function generateEnum(enumModel: Enum) {
  const enumContent = enumModel.enumerators.filter(
    (v) => v.type === "enumerator"
  );
  const content = `export enum ${strings.classify(
    enumModel.name
  )} {\n${enumContent.map((v) => `${v.name} = "${v.name}"`).join(",\n")}\n}`;
  return {
    name: `${strings.classify(enumModel.name)}Enum.ts`,
    content,
  };
}

export function generateEnumFile(prisma: Schema, outputPath: string) {
  const enumList = prisma.list.filter((item) => item.type === "enum");
  for (const e of enumList) {
    const { name, content } = generateEnum(e);
    console.log(chalk.green("CREATE ") + chalk.blue(`${outputPath}/${name}`));
    mkFile(outputPath, name, content);
  }
}
