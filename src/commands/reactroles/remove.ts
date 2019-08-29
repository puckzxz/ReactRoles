import { Command, CommandMessage, CommandoClient } from "discord.js-commando";
import db from "../../util/db";

interface ICmdArgs {
    msgID: string;
}

export default class RemoveCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            args: [
                {
                    key: "msgID",
                    prompt: "What message ID would you like to remove?",
                    type: "string",
                },
            ],
            description: "Removes a message from being watched",
            group: "reactroles",
            memberName: "remove",
            name: "remove",
        });
    }

    public async run(msg: CommandMessage, args: ICmdArgs) {
        if (db.MessageExists(args.msgID)) {
            db.RemoveMessage(args.msgID);
            return msg.say(`I removed ${args.msgID} from the database.`);
        } else {
            return msg.say("ID was not found");
        }
    }
}
