#!/usr/bin/env node
"use strict";

const Configstore = require("configstore");
const chalk = require("chalk");
const pkg = require("./package.json");
const program = require("commander");
const inquirer = require("./lib/enquirer");
const fs_extra = require("fs-extra");
const simpleGit = require("simple-git/promise");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const CLI = require("clui"),
  Spinner = CLI.Spinner;

if (!pkg) {
  console.error(chalk.red("Invalid directory"));
  return;
}

const conf = new Configstore(pkg.name, null, {
  configPath: process.cwd() + "/publish.json"
});
// 删除旧配置
conf.delete("config");

(async () => {
  try {
    program
      .version(pkg.version)
      .option("-N, --sdk <sdkName>", "publish the specified sdk")
      .option("-U, --update [sdkName]", "add and modify configuration files")
      .option("-C, --clear [sdkName]", "clear the directory cache")
      .parse(process.argv);

    if (program.update) {
      const config = conf.get(program.update || null);
      if (!config) {
        console.log(chalk.red(`${program.update} does not exist！`));
        return;
      }
      const res = await inquirer.askSnippet(config);
      const newConfig = JSON.parse(res.snippet.result);
      conf.delete(config.sdkName);
      conf.set(newConfig.sdkName, newConfig);
    } else if (program.clear) {
      typeof program.clear === "String"
        ? conf.delete(program.clear)
        : conf.clear();
    } else if (!program.args.length || program.sdk) {
      await publish(await getConfig(program.sdk || null));
    }
  } catch (err) {
    throw err;
  } finally {
    process.exit(0);
  }
})();

async function publish(currentConfig) {
  const countdown = new Spinner("Please waiting...  ", [
    "⣾",
    "⣽",
    "⣻",
    "⢿",
    "⡿",
    "⣟",
    "⣯",
    "⣷"
  ]);
  try {
    const isExists = await await fs_extra.pathExists(
      `${process.cwd()}/${currentConfig.source}/package.json`
    );
    if (!isExists) {
      const { stdout } = await exec(currentConfig.script);
      console.log(stdout);
    } else {
      await fs_extra.remove(`${process.cwd()}/${currentConfig.source}/.git`);
    }
  } catch (err) {
    console.log(err.cmd);
    console.log(err.stdout);
    console.error(chalk.red(err.stderr));
    throw err;
  }

  try {
    const git = await simpleGit(`${process.cwd()}/${currentConfig.source}`);
    await git.init();
    await git.addRemote(
      "origin",
      `https://github.com/${currentConfig.username}/${
        currentConfig.sdkName
      }.git`
    );
    await git.add("./*");
    await git.commit("wt-publish Automatic submission");
    // , (Math.round(new Date().getTime()/1000)).toString()
    const tags = await git.listRemote(["--tags"]);
    const lastTag = tags
      .trim()
      .split("\n")
      .pop()
      .split("/")
      .pop()
      .toString();
    //   console.log("last tag:"+ lastTag);
    const { tag } = await inquirer.askCommitMsg(lastTag);
    if (tag != lastTag) {
      await git.addTag(tag);
    }
    // ask 当前操作将会覆盖 repo 仓库,是否继续？
    // const repositoryName = chalk.red(currentConfig.gitRepo.split("/").pop().replace('.git', ''));
    const { confirm } = await inquirer.askConfirm(
      chalk.red(currentConfig.sdkName)
    );
    if (!confirm) {
      await fs_extra.remove(`${process.cwd()}/${currentConfig.source}`);
      return;
    }
    countdown.start();
    await git.push("origin", "--tags");
    await git.push(["-f", "origin", "master"]);
    await fs_extra.remove(`${process.cwd()}/${currentConfig.source}`);
  } catch (e) {
    throw e;
  } finally {
    countdown.stop();
  }
  console.log(chalk.green("done!"));
}

async function getConfig(sdkName = null) {
  let currentConfig = conf.get(sdkName);
  const configKeys = Object.keys(currentConfig);
  if (!sdkName) {
    if (configKeys.length === 1) {
      currentConfig = currentConfig[configKeys.shift()];
    } else if (configKeys.length) {
      const { selected } = await inquirer.askSelect(configKeys);
      currentConfig = currentConfig[selected];
    } else {
      currentConfig = await inquirer.askRepositoryConfig();
      conf.set(currentConfig.sdkName, currentConfig);
    }
  } else if (sdkName && !configKeys.length) {
    currentConfig = await inquirer.askRepositoryConfig(sdkName);
    conf.set(currentConfig.sdkName, currentConfig);
  }
  return currentConfig;
}
