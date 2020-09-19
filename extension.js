const vscode = require("vscode");
const dir_tree_processor = require("./tree");

function gettree(dir) {
  const branches = dir_tree_processor(dir);
  const nums = Math.max(...branches.map((v) => v.println.length));
  const tree = branches
    .map((v) => v.println + " ".repeat(nums - v.println.length + 2) + "\n")
    .join("");
  return tree;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(
    'Congratulations, your extension "dir-tree-generator" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "extension.generator",
    function (uri) {
      const str = gettree(uri.fsPath);
      vscode.env.clipboard.writeText(str);
      vscode.window.showInformationMessage(`目录树已复制到剪贴板!`);
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
