import { getSchema } from "@mrleebo/prisma-ast";
import { Command } from "commander";
import dotenv from "dotenv";
import fs from "fs-extra";
import inquirer from "inquirer";
import { generateEntityFile, generatePickEntityFile } from "./generateEntity";
import { generateEnumFile } from "./generateEnum";
import { generateNestModuleFile } from "./generateNestModule";
import { mkFileCount } from "./utils/mkFile";
import chalk from "chalk";
import { generateNestControllerFile } from "./generateNestController";
import { generateNestDtoFile } from "./generateNestDto";
import { generateNestTypesFile } from "./generateNestTypes";
import { generateServiceFile } from "./generateService";

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
				choices: ["entity", "nestModule", "all"],
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
		if (answers.type === "entity") {
			generateEnumFile(prisma, answers.outputPath, answers.dryRun);
			generateEntityFile(prisma, answers.outputPath, answers.dryRun);
			generatePickEntityFile(prisma, answers.outputPath, answers.dryRun);
		} else if (answers.type === "nestModule") {
			generateNestModuleFile(prisma, answers.outputPath, answers.dryRun);
			generateNestControllerFile(prisma, answers.outputPath, answers.dryRun);
			generateNestDtoFile(prisma, answers.outputPath, answers.dryRun);
			generateNestTypesFile(prisma, answers.outputPath, answers.dryRun);
			generateServiceFile(prisma, answers.outputPath, answers.dryRun);
		} else if (answers.type === "all") {
			generateEnumFile(prisma, answers.outputPath, answers.dryRun);
			generateEntityFile(prisma, answers.outputPath, answers.dryRun);
			generatePickEntityFile(prisma, answers.outputPath, answers.dryRun);
			generateNestModuleFile(prisma, answers.outputPath, answers.dryRun);
			generateNestControllerFile(prisma, answers.outputPath, answers.dryRun);
			generateNestDtoFile(prisma, answers.outputPath, answers.dryRun);
			generateNestTypesFile(prisma, answers.outputPath, answers.dryRun);
			generateServiceFile(prisma, answers.outputPath, answers.dryRun);
		}
		console.log(`${chalk.green("SUCCESS")} ${mkFileCount} files created 🔥`);
	});

// program
// 	.command("generate")
// 	.alias("g")
// 	.description("generate code")
// 	.addArgument(new Argument("type", "The type of the code to generate"));

program.parse(process.argv);
