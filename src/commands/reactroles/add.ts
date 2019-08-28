import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import db, { IReaction } from "../../db";
import { FormatReactionMessage } from "../../util/messages";

interface ICmdArgs {
    msgID: string;
    reactions: string[];
}

export default class AddCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
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
        });
    }
    public async run(msg: CommandMessage, args: ICmdArgs) {
        if (args.reactions.length % 2 !== 0) {
            return msg.say("[!] There must be an equal amount of emojis to roles");
        }
        const reactObjs: IReaction[] = [];
        // FIXME: Check if the emote and role are in the right order
        while (args.reactions.length > 0) {
            const temp = args.reactions.splice(0, 2);
            reactObjs.push({ emoji: temp[0], role: temp[1] });
        }
        db.InsertMessage({ id: args.msgID, reactions: reactObjs });
        const msgToReactTo = await msg.channel.fetchMessage(args.msgID);
        reactObjs.forEach((x: IReaction) => {
            msgToReactTo.react(x.emoji);
        });
        const entry = FormatReactionMessage(await db.GetMessage(args.msgID));
        return msg.say(`I added this message...\n${entry}`);
    }
}
