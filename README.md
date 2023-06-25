# About

This is the Nextjs version of [more-snake](https://github.com/wimbarelds/more-snake). The original more-snake was made
with VueJS between 2017 and 2019.

What's special about my version(s) of Snake? Quite a few unique features, like:

- Highscores
- Replays
- Highscore validation
- Multiplayer support
- Map editor
- AI Players

# Play

- [https://snake-next.cyclic.app/](https://snake-next.cyclic.app/)

# Tech

This repository uses:

- Nextjs
- Typescript
- Sanity CMS
- NPM
- eslint
- prettier

Hosting (SSR and server functions) is setup for free via [cyclic.sh](https://cyclic.sh/).

# Setup

## Install dependencies:

```bash
npm ci
```

## Env variables (local):

1. Create a [Sanity](https://www.sanity.io/) project
2. In [Sanity under API](https://www.sanity.io/manage/), Create an API token with editor role
3. Copy `.env.local.example`, name it `.env.local` and set the project id, dataset and token

## Run development:

```bash
npm run dev
```

## Run Sanity Studio (local)

```bash
npm run sanity:dev
```

## Studio URL

Sanity Studio (CMS) is available at `[yoururl]/studio`, ie: http://localhost:3000/studio

# Todo

- [Todo.md](Todo.md)
