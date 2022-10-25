import { Events } from 'discord.js';

module.exports = {
    name: Events.Error,
    once: true,
    async execute(error: Error) {
        console.log(error);
    },
};
