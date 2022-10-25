import { Events } from 'discord.js';

module.exports = {
    name: Events.Error,
    once: false,
    async execute(error: Error) {
        console.log(error);
    },
};
