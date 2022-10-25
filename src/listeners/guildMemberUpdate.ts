import type { GuildMember } from 'discord.js';
import { Events } from 'discord.js';
import welcomeMessageGenerator from '../util/verification/welcomeMessageGenerator';

module.exports = {
    name: Events.GuildMemberUpdate,
    once: false,
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        if (oldMember.pending && !newMember.pending) {
            // @Member: 985979444869070898
            await newMember.roles.add('985979444869070898', 'Successfully verified.');

            if (!newMember.guild.available) return;

            // #💬│general-chat: 797229760978747414
            const channel = await newMember.guild.channels.cache.get('797229760978747414');
            if (channel && channel.isTextBased()) {
                await channel.send({
                    content: `Welcome to the server ${newMember}! Want to break the ice? ${welcomeMessageGenerator()}`,
                    allowedMentions: { users: [newMember.user.id] },
                });
            }
        }
    },
};
