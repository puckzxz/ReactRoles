# ReactRoles ![Docker Build](https://img.shields.io/docker/cloud/build/puckzxz/reactroles?style=flat-square) ![GitHub License](https://img.shields.io/github/license/puckzxz/ReactRoles?style=flat-square)

Quicky setup Discord reaction roles with this easy to use bot.

## 🖥 Running Locally

Ensure you have both [Node](https://nodejs.org) and [TypeScript](https://www.typescriptlang.org/index.html) installed

A `config.ts` file in the `src` directory is **required**.

Take a look at [`src/config.template.ts`](src/config.template.ts) for the variables you need to supply.

Once you have your config ready, open a terminal and run `npm install && npm start`

## 🐳 Deploying with Docker

Deploy by running

`docker run -d --name reactroles -e TOKEN=mytoken -e PREFIX=myprefix puckzxz/reactroles`

To optionally mount the database to the local file system run

`docker run -d --name reactroles -e TOKEN=mytoken -e PREFIX=myprefix -v /my/path:/app/data puckzxz/reactroles`

## 🧠 Commands

* **add**<br>
    Adds a message to the database<br>
    `add <Channel ID> <Message ID> <Emoji> <Role>`<br>
    It can take more than one emoji and role<br>
    `add <Message ID> <Emoji 1> <Role 1> <Emoji 2> <Role 2>`

* **remove**<br>
    Removes a message from the database<br>
    `remove <Message ID>`

* **edit**<br>
    Replaces the role to be given of an existing message with a new role<br>
    `edit <Message ID> <MyOldRole> <MyNewRole>`

* **show**<br>
    Returns a message showing all the messages currently in the database<br>
    `show`

## 🏗 Built with
* [Discord.js](https://discord.js.org)
* [Discord.js-commando](https://github.com/discordjs/Commando)

## 📜 License
See [UNLICENSE](UNLICENSE) for more details