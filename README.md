# ReactRoles ![Docker Build](https://img.shields.io/docker/cloud/build/puckzxz/reactroles?style=flat-square) ![GitHub License](https://img.shields.io/github/license/puckzxz/ReactRoles?style=flat-square)

Quickly setup Discord reaction roles with this easy to use bot.

## 🐳 Deploying with Docker

Deploy by running

`docker run -d --name reactroles -e TOKEN=mytoken -e PREFIX=myprefix puckzxz/reactroles`

## 🧠 Commands

* **add**<br>
    Adds a message to the database<br>
    `add <#Channel> <Message ID> <Emoji> <Role>`<br>
    It can take more than one emoji and role<br>
    `add <#Channel> <Message ID> <Emoji 1> <Role 1> <Emoji 2> <Role 2>`

* **remove**<br>
    Removes a message from the database<br>
    `remove <Message ID>`

* **show**<br>
    Returns a message showing all the messages currently in the database<br>
    `show`

## 🏗 Built with
* [Disgord](https://github.com/andersfylling/disgord)
* [Bow](https://github.com/zippoxer/bow)

## 📜 License
See [UNLICENSE](UNLICENSE) for more details