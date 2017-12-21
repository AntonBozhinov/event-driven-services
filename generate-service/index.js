#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const CHOICES = fs.readdirSync(`${__dirname}/templates`);
const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What service would you like to generate?',
    choices: CHOICES,
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate(input) {
      if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
      return 'Project name may only include letters, numbers, underscores and hashes.';
    },
  },
];

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS)
  .then((answers) => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];
    const templatePath = `${__dirname}/templates/${projectChoice}`;

    fs.copySync(templatePath, `${CURR_DIR}/${projectName}`);
    fs.ensureLinkSync(path.resolve(__dirname, '../modules'), `${CURR_DIR}/${projectName}/modules`)
  })
  .catch(err => {
    console.error(err);
  });