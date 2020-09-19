const fs = require("fs");
const path = require("path");
const ignore = require("ignore");
const IGNOREFILES = [".gitignore", ".treeignore"];
/**
 * 从文件中获取忽略规则
 * @param {string} dir 所在目录
 * @param {array} files 文件列表
 */
function ignores_from_file(dir = "", files = []) {
  let ignores = [];
  files.forEach((v) => {
    const f_path = path.join(dir, v);
    const stat = fs.statSync(f_path);
    if (stat.isFile()) {
      let content = fs.readFileSync(f_path, "utf-8");
      let igs = content.split(/\r?\n/).map((v) => {
        return v.trim();
      });
      ignores = ignores.concat(igs);
    }
  });
  return ignore().add(ignores);
}
/**
 * 输出每一行的格式化内容
 * @param {string} name
 * @param {bool} isLast
 * @param {array} deep
 * @param {string} file_path
 */
function render(name, isLast, deep, file_path) {
  const line = deep.map((v) => `${v ? "│" : " "}  `).join("");
  const text = `${line}${isLast ? "└─" : "├─"} ${name}`;
  return {
    path: file_path,
    name: name,
    println: text,
  };
}

/**
 * 目录树解析器
 * @param {string} target
 * @param {array} deep
 */
function parser(target, deep = [], root) {
  let relative_path = path.relative(root, target);
  let branches = [];
  let children = fs.readdirSync(target);
  //  get ignore rules
  let ignore_files = children.filter((v) => {
    return IGNOREFILES.includes(v);
  });
  let ignore_rules = ignores_from_file(target, ignore_files);

  // get files and dirs igro
  let sub_dirs = [];
  let sub_files = [];
  children.forEach(function (v) {
    let dir = path.join(target, v);
    let stat = fs.statSync(dir);
    let ig_test = path.join(relative_path, dir);
    let flag = ignore_rules.ignores(ig_test);
    if (!flag) {
      if (stat.isFile()) {
        sub_files.push(v);
      } else {
        sub_dirs.push(v);
      }
    }
  });
  // get children
  sub_dirs.forEach(function (v, i) {
    let dir = path.join(target, v);
    let isLast = i === sub_dirs.length - 1 && sub_files.length === 0;
    branches.push(render(v, isLast, deep, dir));

    let sub_branches = parser(dir, [...deep, !isLast], target);
    branches = branches.concat(sub_branches);
  });
  // render children
  sub_files.forEach(function (v, i) {
    let file = path.join(target, v);
    let isLast = i === sub_files.length - 1;
    branches.push(render(v, isLast, deep, file));
  });

  branches.forEach((v) => {
    let rel = path.relative(target, v.path);
    v.rel = rel;
  });
  return branches.filter((v) => {
    return !ignore_rules.ignores(v.rel);
  });
}

/**
 * 目录树处理器
 * @param {string} dir 需要处理的目录
 */
function dir_tree_processor(dir) {
  let root = path.dirname(dir);
  let branches = [
    {
      name: path.basename(dir),
      println: "```" + path.basename(dir),
    },
    {
      name: path.basename(dir),
      println: path.basename(dir),
    },
  ];

  let sub_branches = parser(dir, [], root);
  branches = branches.concat(sub_branches);
  branches.push({
    name: "end",
    println: "```\r\n---",
  });
  return branches.map((v) => {
    let { name, println } = v;
    return { name, println };
  });
}

module.exports = dir_tree_processor;
