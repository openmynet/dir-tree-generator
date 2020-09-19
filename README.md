# dir-tree-generator

快速生成文件目录树的vscode插件

```dir-tree-generator  
dir-tree-generator     
├─ test                
│  └─ tree.test.js     
├─ CHANGELOG.md        
├─ extension.js        
├─ icon.png            
├─ jsconfig.json       
├─ LICENSE             
├─ package.json        
├─ README.md           
├─ tree.js             
└─ yarn.lock           
```
---               


## Features

* 使用 .gitignore 与 .treeignore 进行忽略
* 右键点击生成并复制到剪贴板
* .treeignore可以放置在任何目录下，并只对当前目录范围生效

## .treeignore
> 忽略所有以.开头的文件
```
.*
```
