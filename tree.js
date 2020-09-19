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
      let igs = content
        .split(/\r?\n/)
        .map((v) => {
          return v.trim();
        })
        .filter((v) => !!v);
      ignores = ignores.concat(igs);
    }
  });
  if (!ignores.length) {
    return null;
  }
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
function parser(target, deep = [], rules = []) {
  let root = target; // path.dirname(target);
  let branches = [];
  let children = fs.readdirSync(target);
  //  get ignore rules
  let ignore_files = children.filter((v) => {
    return IGNOREFILES.includes(v);
  });
  let rule = ignores_from_file(target, ignore_files);
  if (rule) {
    rules.push({
      root,
      rule,
    });
  }

  // get files and dirs igro
  let folders = [];
  let files = [];
  children.forEach(function (v) {
    let dir = path.join(target, v);
    let is_ignore = false;
    for (let i = 0; i < rules.length; i++) {
      const { rule, root } = rules[i];
      let relative_path = path.relative(root, dir);
      let ig_test = path.join(relative_path, v);
      if (ig_test.startsWith("..")) {
        continue;
      }
      if (rule.ignores(ig_test)) {
        is_ignore = true;
        break;
      }
    }
    if (!is_ignore) {
      let stat = fs.statSync(dir);
      if (stat.isFile()) {
        files.push(v);
      } else {
        folders.push(v);
      }
    }
  });
  // get children
  folders.forEach(function (v, i) {
    let dir = path.join(target, v);
    let isLast = i === folders.length - 1 && files.length === 0;
    branches.push(render(v, isLast, deep, dir));

    let sub_branches = parser(dir, [...deep, !isLast], rules);
    branches = branches.concat(sub_branches);
  });
  // render children
  files.forEach(function (v, i) {
    let file = path.join(target, v);
    let isLast = i === files.length - 1;
    branches.push(render(v, isLast, deep, file));
  });
  // ignore filter
  branches.forEach((v) => {
    let rel = path.relative(target, v.path);
    v.rel = rel;
  });
  return branches;
}

/**
 * 目录树处理器
 * @param {string} dir 需要处理的目录
 */
function dir_tree_processor(dir, IGNORERULES = []) {
  let branches = [
    {
      name: path.basename(dir),
      println: path.basename(dir),
    },
  ];
  let rules = [];
  if (IGNORERULES.length) {
    rules = [
      {
        root: dir,
        rule: ignore().add(IGNORERULES),
      },
    ];
  }
  let sub_branches = parser(dir, [], rules);
  branches = branches.concat(sub_branches);
  return branches.map((v) => {
    let { name, println } = v;
    return { name, println };
  });
}

module.exports = dir_tree_processor;
