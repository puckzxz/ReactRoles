import lowdb from "lowdb";
import { default as FileAsync } from "lowdb/adapters/FileAsync";

export interface IReactionMessage {
    id: string;
    reactions: IReaction[];
}

export interface IReaction {
    emoji: string;
    role: string;
}

class DB {
    private db!: lowdb.LowdbAsync<any>;

    constructor() {
        this.init();
    }

    public async GetMessage(ID: string): Promise<IReactionMessage> {
        return this.db
            .get("messages")
            .value()
            .find((x: IReactionMessage) => x.id === ID);
    }

    public RemoveMessage(ID: string): void {
        (this.db as any)
            .get("messages")
            .remove({ id: ID })
            .write();
    }

    public MessageExists(ID: string): boolean {
        return this.db
            .get("messages")
            .value()
            .find((x: IReactionMessage) => x.id === ID)
            ? true
            : false;
    }

    public InsertMessage(message: IReactionMessage): void {
        (this.db as any)
            .get("messages")
            .push({ id: message.id, reactions: message.reactions })
            .write();
    }

    public async GetAll(): Promise<IReactionMessage[]> {
        return this.db.get("messages").value();
    }

    public ReplaceValueInMessage(
        ID: string,
        oldValue: string,
        newValue: string,
    ): void {
        const oldMessage: IReactionMessage = (this.db as any)
            .get("messages")
            .value()
            .find((x: IReactionMessage) => x.id === ID);
        db.RemoveMessage(oldMessage.id);
        oldMessage.reactions.map((x: IReaction) => {
            if (x.role === oldValue) {
                x.role = newValue;
            }
        });
        db.InsertMessage(oldMessage);
    }

    private async init() {
        const adapter = new FileAsync("./data/db.json");
        this.db = await lowdb(adapter);
        this.db.defaults({ messages: [] }).write();
    }
}

const db = new DB();

export default db;
