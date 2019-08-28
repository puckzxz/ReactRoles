import {Command, CommandMessage, CommandoClient} from "discord.js-commando";
import db, { IReaction, IReactionMessage } from "../../db";
import { FormatReactionMessages } from "../../util/messages";

export default class ShowCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            description: "Retuns all messages in the database that are currently being watched",
            group: "reactroles",
            memberName: "show",
            name: "show",
        });
    }

    public async run(msg: CommandMessage) {
        const messages = await db.GetAll();
        if (!messages) {
            return msg.say("No messages in the database!");
        }
        return msg.say(`${FormatReactionMessages(messages)}`);
    }
}
