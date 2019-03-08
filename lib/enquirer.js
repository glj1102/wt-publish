const inquirer = require("enquirer");
const { Snippet } = require("enquirer");
const semver = require("semver");

module.exports = {
  askGithubCredentials: () => {
    const questions = [
      {
        name: "username",
        type: "input",
        message: "Enter your GitHub username or e-mail address:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your username or e-mail address.";
          }
        }
      },
      {
        name: "password",
        type: "password",
        message: "Enter your password:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your password.";
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askRepositoryConfig: (defaultName = "") => {
    const questions = [
      {
        name: "sdkName",
        type: "input",
        initial: defaultName,
        message: "Input sdk name:",
        validate: function(value) {
          return !!value.length || "Please enter sdk name.";
        }
      },
      {
        name: "script",
        type: "input",
        initial: "npm run build:sdk",
        message: "Input build sdk script:",
        validate: function(value) {
          return !!value.length || "Please enter build sdk script.";
        }
      },
      {
        name: "source",
        type: "input",
        initial: "sdk-build",
        message: "Input source folder path:",
        validate: function(value) {
          return !!value.length || "Please enter source folder path.";
        }
      },
      {
        name: "username",
        type: "input",
        message: "Input sdk repository username:",
        validate: function(value) {
          return !!value.length || "Please enter sdk repository username.";
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askSelect: keys => {
    const questions = [
      {
        type: "select",
        name: "selected",
        message: "Please select an SDK",
        choices: keys
      }
    ];
    return inquirer.prompt(questions);
  },
  askCommitMsg: (lastTag = "") => {
    const questions = [
      // {
      //     name: 'message',
      //     type: 'input',
      //     message: 'Input commit message:',
      //     validate: function( value ) {
      //         return !!value.length || 'Please enter commit message.';
      //     }
      // },
      {
        name: "tag",
        type: "input",
        message: "Input tag:",
        initial: lastTag,
        validate: function(value) {
          if (!value && !semver.valid(value)) {
            return prompt.styles.danger("version should be a valid value");
          }
          return true;
        }
      }
    ];
    return inquirer.prompt(questions);
  },
  askConfirm: (repo = "") => {
    const questions = [
      {
        name: "confirm",
        type: "confirm",
        message: `The current operation will cover the ${repo} repository.\n Do you want to continue?`
      }
    ];
    return inquirer.prompt(questions);
  },
  askSnippet: ({
    sdkName = "",
    script = "",
    username = "",
    source = ""
  } = {}) => {
    const prompt = new Snippet();
    const questions = [
      {
        name: "snippet",
        type: "snippet",
        message: `fill out the fields in publish.json`,
        required: true,
        fields: [
          {
            name: "sdkName",
            message: "sdk name",
            validate(value, state, item, index) {
              if (item && item.name === "sdkName" && !value) {
                return prompt.styles.danger("Please enter sdk name.");
              }
              return true;
            }
          },
          {
            name: "source",
            message: "source path",
            validate(value, state, item, index) {
              if (item && item.name === "source" && !value) {
                return prompt.styles.danger("Please enter source folder path.");
              }
              return true;
            }
          },
          {
            name: "username",
            message: "username",
            validate(value, state, item, index) {
              if (item && item.name === "username" && !value) {
                return prompt.styles.danger(
                  "Please enter GitHub username address."
                );
              }
              return true;
            }
          },
          {
            name: "script",
            message: "Build script",
            validate(value, state, item, index) {
              if (item && item.name === "script" && !value) {
                return prompt.styles.danger("Please enter build sdk script.");
              }
              return true;
            }
          }
        ],
        template: `{
              "sdkName": "\${sdkName:${sdkName}}",
              "script": "\${script:${script}}",
              "source": "\${source:${source}}",
              "username": "\${username:${username}}"
            }`
      }
    ];
    return inquirer.prompt(questions);
  }
};
