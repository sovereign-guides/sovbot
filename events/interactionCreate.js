const { italic, hyperlink } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			if (interaction.commandName === 'faq') {
				const focusedValue = interaction.options.getFocused();
				const choices = ['Personal: Name', 'Val: Rank', 'Val: ValoPlant'];
				const filtered = choices.filter(choice => choice.startsWith(focusedValue));
				await interaction.respond(
					filtered.map(choice => ({ name: choice, value: choice })),
				);
			}
		}

		else if (interaction.isChatInputCommand()) {
			if (interaction.commandName === 'faq') {
				const choice = interaction.options.getString('query');
				const target = interaction.options.getUser('target');

				// Handles whether a user was mentioned
				// eslint-disable-next-line no-inner-declarations
				async function whetherMention() {
					if (target) {
						return `${italic(`${choice} for ${target}`)}\n`;
					}
					else { return ''; }
				}

				if (choice === 'Val: Rank') {
					await interaction.reply(`${await whetherMention()}Airen is Immortal!`);
				}

				else if (choice === 'Val: ValoPlant') {
					await interaction.reply(`${await whetherMention()}The website Airen uses is: ${hyperlink('valoplant', 'https://valoplant.gg/sovereign')}!`);
				}

				else if (choice === 'Personal: Name') {
					await interaction.reply(`${await whetherMention()}Airen's name is Eric!`);
				}
			}
		}

	},
};
