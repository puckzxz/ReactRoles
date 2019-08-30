import chalk from "chalk";
import { Emoji, MessageReaction } from "discord.js";
import { CommandoClient } from "discord.js-commando";
import path from "path";
import db, { IReaction, IReactionMessage } from "./util/db";

const client = new CommandoClient({
    commandPrefix: process.env.PREFIX
        ? process.env.PREFIX
        : require("./config").PREFIX,
    owner: "135554522616561664", // puckzxz#2080
    unknownCommandResponse: false,
});

client
    .on("error", (err) => {
        console.log(chalk.red(err.message));
    })
    .on("warn", (wrn) => {
        console.log(chalk.yellow(wrn));
    })
    .on("ready", () => {
        console.log(
            chalk.green(
                `Client logged in as ${client.user.username}#${client.user.discriminator} - ${client.user.id}`,
            ),
        );
    })
    .on("disconnect", () => {
        console.log(chalk.yellow("Client disconnected!"));
    })
    .on("reconnecting", () => {
        console.log(chalk.yellow("Client attempting to reconnect..."));
    });

client.registry
    .registerGroup("reactroles", "ReactRoles")
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, "commands"));

const events: any = {
    MESSAGE_REACTION_ADD: "messageReactionAdd",
    MESSAGE_REACTION_REMOVE: "messageReactionRemove",
};

client.on("raw", async (event: any) => {
    if (!events.hasOwnProperty(event.t)) {
        return;
    }

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel: any =
        client.channels.get(data.channel_id) || (await user!.createDM());

    if (channel.messages.has(data.message_id)) {
        return;
    }

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = data.emoji.id
        ? `${data.emoji.name}:${data.emoji.id}`
        : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
        const emoji = new Emoji(client.guilds.get(data.guild_id)!, data.emoji);
        reaction = new MessageReaction(
            message,
            emoji,
            1,
            data.user_id === client.user.id,
        );
    }

    (client as any).emit(events[event.t], reaction, user);
});

client.on("messageReactionAdd", async (reaction, user) => {
    const guildUser = reaction.message.guild.member(user);
    if (guildUser.id === client.user.id) {
        return;
    }
    const reactObj: IReactionMessage = await db.GetMessage(reaction.message.id);
    if (!reactObj) {
        return;
    }
    const reactRole = reactObj.reactions.find(
        (x: IReaction) => x.emoji === reaction.emoji.name,
    );
    const role = reaction.message.guild.roles.find(
        (x) => x.name === reactRole!.role,
    );
    if (
        reaction.message.id === reactObj.id &&
        reaction.emoji.name === reactRole!.emoji
    ) {
        if (!guildUser.roles.has(role.id)) {
            guildUser.addRole(role);
            console.log(`Added ${guildUser.displayName} to ${role.name}`);
        }
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    const guildUser = reaction.message.guild.member(user);
    if (guildUser.id === client.user.id) {
        return;
    }
    const reactObj: IReactionMessage = await db.GetMessage(reaction.message.id);
    const reactRole = reactObj.reactions.find(
        (x: IReaction) => x.emoji === reaction.emoji.name,
    );
    const role = reaction.message.guild.roles.find(
        (x) => x.name === reactRole!.role,
    );
    if (
        reaction.message.id === reactObj.id &&
        reaction.emoji.name === reactRole!.emoji
    ) {
        if (guildUser.roles.has(role.id)) {
            guildUser.removeRole(role);
            console.log(`Removed ${guildUser.displayName} from ${role.name}`);
        }
    }
});

process.env.TOKEN
    ? client.login(process.env.TOKEN)
    : client.login(require("./config").TOKEN);
