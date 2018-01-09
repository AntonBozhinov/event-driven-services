#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');

const CHOICES = fs.readdirSync(`${__dirname}/templates`);
const QUESTIONS = [
    {
        name: 'project-choice',
        type: 'list',
        message: 'What service would you like to generate?',
        choices: CHOICES,
    },
];

if (!process.argv[2]) {
    QUESTIONS.push({
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate(input) {
            if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
            return 'Project name may only include letters, numbers, underscores and hashes.';
        },
    });
}

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS)
    .then((answers) => {
        const cliArg = process.argv[2];
        const projectChoice = answers['project-choice'];
        const projectName = answers['project-name'];
        const templatePath = `${__dirname}/templates/${projectChoice}`;

        fs.copySync(templatePath, `${CURR_DIR}/${cliArg || projectName}`);
    })
    .catch((err) => {
        console.error(err); // eslint-disable-line
    });
