import type { GuildMember } from 'discord.js';
import { Events } from 'discord.js';

const welcomeMessagesArray: string[] = [
    'Tell us what your favorite skin line is!',
    'Tell us what team you support!',
    'Tell us which you prefer from Phantom or Vandal!',
];

function welcomeMessageGenerator(): string {
    return welcomeMessagesArray[Math.floor(Math.random() * welcomeMessagesArray.length)];
}

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember: GuildMember, newMember: GuildMember) {
        if (oldMember.pending && !newMember.pending) {

            await newMember.roles.add('985979444869070898');
            if (!newMember.guild.available) {
                return;
            }

            const channel = await newMember.guild.channels.cache.get('797229760978747414');
            if (!channel || !channel.isTextBased()) {
                return;
            }

            await channel.send({
                content: `Welcome to the server ${newMember}! Want to break the ice? ${welcomeMessageGenerator()}`,
                allowedMentions: { users: [newMember.user.id] },
            });
        }
    },
};
