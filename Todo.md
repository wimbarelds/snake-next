# Todo

This project is still being translated from a VueJS application (SPA) to a proper Next App (using app directory) with proper Server rendering and the like.
As a result, you'll find some code that isn't yet following the best practices for Next applications (ie: Server components, ISR).

Tasks include:

* Move more code under `/play` to server components (such as highscores)
* Move much of the code under `/edit` to server components
* Setup some type of authentication so `/edit` is actually functional again
* Add eslint, prettier and type-check to pipelines
* Start working in feature branches
* Update code for play and edit to properly hook into server actions and revalidation
* Make `/about` take content from Sanity
* Setup better project initialization
* Use tailwind CSS or other CSS solution (I don't like plain css modules)
* Improve things you can do in Sanity Studio
* Host Sanity Studio as NextJS application route
* Maybe adopt `Yarn` or `pnpm`
* Improve user experience relating bots
* Allow bot / human multiplayer
