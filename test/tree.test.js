const dir_tree_processor = require("../tree");

var assert = require("assert");
var { describe } = require("mocha");

describe("目录树测试", function () {
  describe("当前目录", function () {
    it("目录树中不包含.vscode与node_modules", function () {
      const branches = dir_tree_processor("./");
      // console.log(branches);
      const nums = Math.max(...branches.map((v) => v.println.length));
      const tree = branches
        .map((v) => v.println + " ".repeat(nums - v.println.length + 2) + "\n")
        .join("");
      assert.doesNotMatch(tree, /(\.vscode)|(node_modules)|(help\.md)/g);
      console.log(tree);
    });
  });
});
