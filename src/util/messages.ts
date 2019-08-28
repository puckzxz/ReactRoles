import { IReaction, IReactionMessage } from "../db";

/**
 *
 * @param messages The ReactionMessage array to format
 * @returns A formatted message to be sent in Discord
 */
export function FormatReactionMessages(messages: IReactionMessage[]): string {
    let formatted: string = "";
    messages.forEach((x: IReactionMessage) => {
        formatted += `Msg ID: *${x.id}*\n`;
        x.reactions.forEach((y: IReaction, i: number) => {
            formatted += `\t${i}. Emoji: ${y.emoji}\n\t\t- Role: **${y.role}**\n`;
        });
    });
    return formatted;
}

/**
 *
 * @param message The ReactionMessage to format
 * @returns A formatted message to be sent in Discord
 */
export function FormatReactionMessage(message: IReactionMessage): string {
    let formatted: string = "";
    formatted += `Msg ID: *${message.id}*\n`;
    message.reactions.forEach((y: IReaction, i: number) => {
        formatted += `\t${i}. Emoji: ${y.emoji}\n\t\t- Role: **${y.role}**\n`;
    });
    return formatted;
}
