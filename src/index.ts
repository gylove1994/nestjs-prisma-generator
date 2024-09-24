import { Argument, Command } from "commander";
import inquirer from "inquirer";
import { generateEntity, generateEntityFile } from "./generateEntity";
import { getSchema } from "@mrleebo/prisma-ast";
import fs from "fs-extra";
import { mkFile } from "./utils/mkFile";
import { generateEnum, generateEnumFile } from "./generateEnum";

const program = new Command();

interface Answers {
  type: string;
  prismaPath: string;
  outputPath: string;
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
        choices: ["entity", "enum", "module", "all"],
        default: "all",
      },
      {
        type: "input",
        name: "prismaPath",
        message: "What is the path to the prisma schema file?",
        default:
          "/Users/gylove1994/coding-space/nestjs-prisma-generator/test-playground/schema.prisma",
      },
      {
        type: "input",
        name: "outputPath",
        message: "What is the path to the output directory?",
        default:
          "/Users/gylove1994/coding-space/nestjs-prisma-generator/test-playground/src/generated",
      },
    ]);
    const schemaFile = await fs.readFile(answers.prismaPath, "utf-8");
    const prisma = getSchema(schemaFile);
    if (answers.type === "entity") {
    } else if (answers.type === "enum") {
      generateEnumFile(prisma, answers.outputPath);
    } else if (answers.type === "all") {
      generateEnumFile(prisma, answers.outputPath);
      generateEntityFile(prisma, answers.outputPath);
    }
  });

program
  .command("generate")
  .alias("g")
  .description("generate code")
  .addArgument(new Argument("type", "The type of the code to generate"));

program.parse(process.argv);
