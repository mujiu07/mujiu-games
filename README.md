# mujiu-games

> https://game.mujiu.net/ · 8 个纯前端小游戏 + 一个终端风格入口页

零依赖、零构建：每个游戏都是独立的单文件 HTML（内联 CSS + JS），直接扔进 nginx 静态目录就能跑。

## 入口页

根目录 `index.html` 是一个终端模拟器（提示符 `visitor@game.mujiu.net:~ $ `）：

- 打开即自动执行 `ls games/` 列出全部游戏，列表项可直接点击
- 支持命令：`ls`、`clear`、以及任意游戏名（输入 `snake` 回车直接跳转）
- `Tab` 补全（内置命令 + 游戏名），`↑` / `↓` 翻历史命令
- 页面上点击任意位置都会自动聚焦输入框

## 游戏清单

| 目录 | 名称 |
| --- | --- |
| `snake/` | 贪吃蛇 |
| `tetris/` | 俄罗斯方块 |
| `2048/` | 2048 |
| `flappy/` | Flappy Bird |
| `minesweeper/` | 扫雷 |
| `breakout/` | 打砖块 |
| `gobang/` | 五子棋 |
| `tictactoe/` | 井字棋 |

## 新增一个游戏

1. 建目录 `<名字>/index.html`（单文件、自包含，不引外部资源）
2. 在根 `index.html` 的 `games` 数组里加一行，顺序即显示顺序：

   ```js
   {name:"<名字>", label:"<显示名>", url:"/<名字>/"}
   ```

3. 部署（见下）

## 部署

静态站点，同步目录即可：

```bash
rsync -avz --delete --exclude='.DS_Store' ./ <server>:/var/www/game/
```

nginx 配置见 `deploy/nginx.conf`（站点根 `/var/www/game`）。

## License

个人项目，代码随意参考。
