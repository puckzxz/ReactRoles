import {Command, CommandMessage, CommandoClient} from "discord.js-commando";
import db, { IReaction, IReactionMessage } from "../../db";

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
        let formatted: string = ">>> ";
        messages.forEach((x: IReactionMessage) => {
            formatted += `${x.id}\n`;
            x.reactions.forEach((y: IReaction) => {
                formatted += `\t${y.emoji} - ${y.role}\n`;
            });
        });
        return msg.say(`${formatted}`);
    }
}
