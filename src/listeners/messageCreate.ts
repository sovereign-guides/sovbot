import { Events, hyperlink } from 'discord.js';
import type { Message } from 'discord.js';
import regexMatch from '../util/context/regexMatch';
import contentExistenceCheck from '../util/context/contentExistenceCheck';

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        if (message.author.bot) {
            return;
        }

        const found = regexMatch(message);
        if (!found) {
            return;
        }

        const guildIdFromMessageLink = found[1];
        const currentGuild = message.guild;
        if (currentGuild?.id !== guildIdFromMessageLink) {
            return;
        }

        const channelIdFromMessageLink = found[2];
        const resolvedChannel = await currentGuild.channels.cache.get(channelIdFromMessageLink);
        if (resolvedChannel && resolvedChannel.isTextBased()) {
            const messageIdFromMessageLink = found[3];
            const resolvedMessage = await resolvedChannel.messages.fetch(messageIdFromMessageLink);

            if (resolvedMessage) {
                const messageSentDate = new Date(resolvedMessage.createdTimestamp).toUTCString();

                const resolvedMessageEmbed = {
                    color: 0x2f3136,
                    author: { name: `${resolvedMessage.author.tag}`, iconURL: resolvedMessage.author.displayAvatarURL() },
                    fields: [
                        { name: 'Channel', value: `${resolvedMessage.channel} ➡️  ${message.channel}`, inline: true },
                        { name: 'Jump', value: `${hyperlink('Go to message', resolvedMessage.url)}`, inline: true },
                        { name: 'Message', value: contentExistenceCheck(resolvedMessage.content) } ],
                    image: { url: resolvedMessage.attachments?.first()?.url || '' },
                    footer: { text: `Originally sent on: ${messageSentDate}` },
                };

                await message.reply({ embeds: [resolvedMessageEmbed], allowedMentions: { users: [] } });
            }
        }
    },
};
