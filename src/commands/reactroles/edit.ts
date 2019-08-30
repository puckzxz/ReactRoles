import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import db, { IReaction } from "../../util/db";
import { FormatReactionMessage } from "../../util/messages";

interface ICmdArgs {
    msgID: string;
    old: string;
    new: string;
}

export default class EditCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    key: "msgID",
                    prompt: "What message ID would you like to add?",
                    type: "string",
                },
                {
                    key: "old",
                    prompt: "What role would you like to replace?",
                    type: "string",
                },
                {
                    key: "new",
                    prompt: "What role would you like to replace it with?",
                    type: "string",
                },
            ],
            description:
                "Edits the role to be given of a message in the database",
            group: "reactroles",
            memberName: "edit",
            name: "edit",
            // @ts-ignore Needed because typings are outdated.
            userPermissions: ["ADMINISTRATOR"],
        });
    }
    public async run(msg: CommandMessage, args: ICmdArgs) {
        db.ReplaceValueInMessage(args.msgID, args.old, args.new);
        return msg.say(
            `I replaced the role **${args.old}** with **${args.new}**`,
        );
    }
}
