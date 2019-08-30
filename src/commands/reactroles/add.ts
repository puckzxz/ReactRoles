import { TextChannel } from "discord.js";
import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import db, { IReaction } from "../../util/db";
import { FormatReactionMessage } from "../../util/messages";

interface ICmdArgs {
    channelID: string;
    messageID: string;
    reactions: string[];
}

export default class AddCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    key: "channelID",
                    parse: (val: string) => {
                        console.log(val);
                        return val.slice(2, -1);
                    },
                    prompt: "What channel is the message in?",
                    type: "string",
                },
                {
                    key: "msgID",
                    prompt: "What message ID would you like to add?",
                    type: "string",
                },
                {
                    infinite: true,
                    key: "reactions",
                    prompt:
                        "What reactions and roles would you like to submit?",
                    type: "string",
                },
            ],
            description: "Adds a message to watch",
            group: "reactroles",
            memberName: "add",
            name: "add",
            // @ts-ignore Needed because typings are outdated.
            userPermissions: ["ADMINISTRATOR"],
        });
    }
    public async run(msg: CommandMessage, args: ICmdArgs) {
        if (args.reactions.length % 2 !== 0) {
            return msg.say(
                "[!] There must be an equal amount of emojis to roles",
            );
        }
        const reactObjs: IReaction[] = [];
        // FIXME: Check if the emote and role are in the right order
        while (args.reactions.length > 0) {
            const temp = args.reactions.splice(0, 2);
            reactObjs.push({ emoji: temp[0], role: temp[1] });
        }
        db.InsertMessage({ id: args.messageID, reactions: reactObjs });
        if (msg.channel.id === args.channelID) {
            const msgToReactTo = await msg.channel.fetchMessage(args.messageID);
            reactObjs.forEach((x: IReaction) => {
                msgToReactTo.react(x.emoji);
            });
        } else {
            const msgChannel: TextChannel = msg.guild.channels.get(
                args.channelID,
            )! as TextChannel;
            const msgToReactTo = await msgChannel.fetchMessage(args.messageID);
            reactObjs.forEach((x: IReaction) => {
                msgToReactTo.react(x.emoji);
            });
        }
        const entry = FormatReactionMessage(
            await db.GetMessage(args.messageID),
        );
        return msg.say(`I added this message...\n${entry}`);
    }
}
