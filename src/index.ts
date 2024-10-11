import { getSchema } from "@mrleebo/prisma-ast";
import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import fs from "fs-extra";
import inquirer from "inquirer";
import { generateEntityFile, generatePickEntityFile } from "./generateEntity";
import { generateEnumFile } from "./generateEnum";
import { generateNestControllerFile } from "./generateNestController";
import { generateNestDtoFile } from "./generateNestDto";
import { generateNestModuleFile } from "./generateNestModule";
import { generateNestTypesFile } from "./generateNestTypes";
import { generateResultDataVoFile } from "./generateResultDataVo";
import { generateServiceFile } from "./generateService";
import { mkFileCount } from "./utils/mkFile";

dotenv.configDotenv({ path: ".env" });

const program = new Command();

interface Answers {
	type: string;
	prismaPath: string;
	outputPath: string;
	dryRun: boolean;
}

program
	.name("npg")
	.description("A command line tool for nestjs-prisma code generation")
	.version("1.0.0")
	.action(async () => {
		const answers = await inquirer.prompt<Answers>([
			{
				type: "list",
				name: "type",
				message: "What type of code do you want to generate?",
				choices: ["entity", "entity-with-pick", "nestModule", "all"],
				default: process.env.NPG_LIST_DEFAULT || "all",
			},
			{
				type: "input",
				name: "prismaPath",
				message: "What is the path to the prisma schema file?",
				default:
					process.env.NPG_PRISMA_PATH_DEFAULT || "./prisma/schema.prisma",
			},
			{
				type: "input",
				name: "outputPath",
				message: "What is the path to the output directory?",
				default: process.env.NPG_OUTPUT_PATH_DEFAULT || "./src/__generated",
			},
			{
				type: "confirm",
				name: "dryRun",
				message: "Do you want to run in dry run mode?",
				default: true,
			},
		]);
		const schemaFile = await fs.readFile(answers.prismaPath, "utf-8");
		const prisma = getSchema(schemaFile);
		if (answers.type === "entity-with-pick") {
			generateEnumFile(prisma, answers.outputPath, answers.dryRun);
			generateEntityFile(prisma, answers.outputPath, answers.dryRun);
			generatePickEntityFile(prisma, answers.outputPath, answers.dryRun);
		} else if (answers.type === "entity") {
			generateEnumFile(prisma, answers.outputPath, answers.dryRun);
			generateEntityFile(prisma, answers.outputPath, answers.dryRun);
		} else if (answers.type === "nestModule") {
			const ans = await inquirer.prompt({
				type: "confirm",
				name: "useResultDataVo",
				message: "Do you want to use ResultDataVo?",
				default: true,
			});
			if (ans.useResultDataVo) {
				generateResultDataVoFile(answers.outputPath, answers.dryRun);
			}
			generateEnumFile(prisma, answers.outputPath, true, true);
			generateNestModuleFile(prisma, answers.outputPath, answers.dryRun);
			generateNestControllerFile(
				prisma,
				answers.outputPath,
				answers.dryRun,
				ans.useResultDataVo,
			);
			generateNestDtoFile(prisma, answers.outputPath, answers.dryRun);
			generateNestTypesFile(prisma, answers.outputPath, answers.dryRun);
			generateServiceFile(
				prisma,
				answers.outputPath,
				answers.dryRun,
				ans.useResultDataVo,
			);
		} else if (answers.type === "all") {
			const ans = await inquirer.prompt({
				type: "confirm",
				name: "useResultDataVo",
				message: "Do you want to use ResultDataVo?",
				default: true,
			});
			if (ans.useResultDataVo) {
				generateResultDataVoFile(answers.outputPath, answers.dryRun);
			}
			generateEnumFile(prisma, answers.outputPath, answers.dryRun);
			generateEntityFile(prisma, answers.outputPath, answers.dryRun);
			generateNestModuleFile(prisma, answers.outputPath, answers.dryRun);
			generateNestControllerFile(
				prisma,
				answers.outputPath,
				answers.dryRun,
				ans.useResultDataVo,
			);
			generateNestDtoFile(prisma, answers.outputPath, answers.dryRun);
			generateNestTypesFile(prisma, answers.outputPath, answers.dryRun);
			generateServiceFile(
				prisma,
				answers.outputPath,
				answers.dryRun,
				ans.useResultDataVo,
			);
		}
		console.log(`${chalk.green("SUCCESS")} ${mkFileCount} files created 🔥`);
	});

program
	.command("generate")
	.alias("g")
	.description("generate code")
	.argument("type", "The type of the code to generate")
	.argument("prismaPath", "The path to the prisma schema file")
	.argument("outputPath", "The path to the output directory")
	.argument("dryRun", "Whether to run in dry run mode")
	.option("-r, --resultDataVo", "Whether to use ResultDataVo")
	.action(async (type, prismaPath, outputPath, dryRun, resultDataVo) => {
		const schemaFile = await fs.readFile(prismaPath, "utf-8");
		const prisma = getSchema(schemaFile);
		if (type === "entity-with-pick") {
			generateEnumFile(prisma, outputPath, dryRun);
			generateEntityFile(prisma, outputPath, dryRun);
			generatePickEntityFile(prisma, outputPath, dryRun);
		} else if (type === "entity") {
			generateEnumFile(prisma, outputPath, dryRun);
			generateEntityFile(prisma, outputPath, dryRun);
		} else if (type === "nestModule") {
			generateNestModuleFile(prisma, outputPath, dryRun);
			generateNestControllerFile(prisma, outputPath, dryRun, resultDataVo);
			generateNestDtoFile(prisma, outputPath, dryRun);
			generateNestTypesFile(prisma, outputPath, dryRun);
			generateServiceFile(prisma, outputPath, dryRun, resultDataVo);
		} else if (type === "all") {
			generateEnumFile(prisma, outputPath, dryRun);
			generateEntityFile(prisma, outputPath, dryRun);
			generatePickEntityFile(prisma, outputPath, dryRun);
			generateNestModuleFile(prisma, outputPath, dryRun);
			generateNestControllerFile(prisma, outputPath, dryRun, resultDataVo);
			generateNestDtoFile(prisma, outputPath, dryRun);
			generateNestTypesFile(prisma, outputPath, dryRun);
			generateServiceFile(prisma, outputPath, dryRun, resultDataVo);
		}
		console.log(`${chalk.green("SUCCESS")} ${mkFileCount} files created 🔥`);
	});

program.parse(process.argv);
