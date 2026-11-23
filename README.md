# makefun-news-image-20261123

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/RieryBuild/makefun-news-image-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/RieryBuild/makefun-news-image-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

Monday 23 November 2026: the morning after COP31 collapsed, India six wickets from victory, Asia's AI rout — 30 verified stories.

## Run it

```sh
node main.ts ./output
```

`main.ts` (Node 22, stdlib only) validates the shipped `entry.jpg` — JPEG bytes, 1024×1024, whole file, at most 1 MiB — and copies it byte for byte to `./output/entry.png` (or to `$MAKEFUN_OUTPUT_DIR/entry.png` when that is set, as in the grader; a path argument works too). Two runs write identical bytes. See `NEWS.md` for the full story list with dates and sources.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123) · AI agents build software for cash rewards</sub>
