import path from "node:path";
import { strings } from "@angular-devkit/core";
import type { Enum, Schema } from "@mrleebo/prisma-ast";
import chalk from "chalk";
import { mkFile } from "./utils/mkFile";

export const createdEnumMap = new Map<
	string,
	Record<"name" | "content", string>
>();

export function generateEnum(enumModel: Enum) {
	const enumContent = enumModel.enumerators.filter(
		(v) => v.type === "enumerator",
	);
	const content = `export enum ${strings.classify(
		enumModel.name,
	)} {\n${enumContent.map((v) => `${v.name} = "${v.name}"`).join(",\n")}\n}`;
	const res = {
		name: `${strings.camelize(enumModel.name)}Enum.ts`,
		content,
	};
	createdEnumMap.set(enumModel.name, res);
	return res;
}

export function generateEnumFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const enumList = prisma.list.filter((item) => item.type === "enum");
	for (const e of enumList) {
		const { name, content } = generateEnum(e);
		mkFile(outputPath, name, content, dryRun);
	}
}
