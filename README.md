# ReactRoles ![Docker Build](https://img.shields.io/docker/cloud/build/puckzxz/reactroles?style=flat-square) ![GitHub License](https://img.shields.io/github/license/puckzxz/ReactRoles?style=flat-square)

Easily setup Discord reaction roles with this easy to use bot.

## Running Locally

Ensure you have both [Node](https://nodejs.org) and [TypeScript](https://www.typescriptlang.org/index.html) installed

A `config.ts` file in the `src` directory is **required**.

Take a look at [`src/config.template.ts`](src/config.template.ts) for the variables you need to supply.

Once you have your config ready, open a terminal and run `npm install && npm start`

## Deploying

Deploy with Docker by running

`docker run -d --name reactroles -e TOKEN=mytoken -e PREFIX=myprefix puckzxz/reactroles`

To optionally mount the database to the local file system run

`docker run -d --name reactroles -e TOKEN=mytoken -e PREFIX=myprefix -v /my/path:/app/data puckzxz/reactroles`

## Built with
* [Discord.js](https://discord.js.org)
* [Discord.js-commando](https://github.com/discordjs/Commando)

## License
See [UNLICENSE](UNLICENSE) for more details