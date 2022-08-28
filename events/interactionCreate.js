const { InteractionType, ModalBuilder, TextInputBuilder, ActionRowBuilder, EmbedBuilder, AttachmentBuilder,
	ChannelType, underscore,
} = require('discord.js');
const { channels: { utility: { feedbackChannelId } } } = require('../config.json');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction);
				console.log(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered ${interaction.commandName}`);
			}
			catch (error) {
				console.error(error);
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		}

		else if (interaction.isButton()) {
			if (interaction.customId !== 'feedback-button') return;

			const feedbackModal = new ModalBuilder()
				.setCustomId('feedback-modal')
				.setTitle('Give Feedback');

			const titleInput = new TextInputBuilder()
				.setCustomId('titleInput')
				.setLabel('🍃  Title')
				.setPlaceholder('Val Discussion: Automatic match announcer')
				.setRequired(true)
				.setMinLength(3)
				.setMaxLength(100)
				.setStyle(1);

			const feedbackInput = new TextInputBuilder()
				.setCustomId('feedbackInput')
				.setLabel('✏️ Description')
				.setPlaceholder('Within the Val channel, maybe add an automatic match announcer so that...')
				.setRequired(true)
				.setMinLength(20)
				.setMaxLength(1000)
				.setStyle(2);

			const imageInput = new TextInputBuilder()
				.setCustomId('imageInput')
				.setLabel('🖼️ Image URL')
				.setPlaceholder('https://i.imgur.com/XE5H26G.jpeg')
				.setRequired(false)
				.setMinLength(13)
				.setMaxLength(1000)
				.setStyle(1);

			const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
			const secondActionRow = new ActionRowBuilder().addComponents(feedbackInput);
			const thirdActionRow = new ActionRowBuilder().addComponents(imageInput);
			feedbackModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

			await interaction.showModal(feedbackModal);
		}

		else if (interaction.isModalSubmit()) {
			if (interaction.customId !== 'feedback-modal') return;

			const title = interaction.fields.getTextInputValue('titleInput');
			const feedback = interaction.fields.getTextInputValue('feedbackInput');

			const feedbackEmbed = new EmbedBuilder()
				.setColor(0x2f3136)
				.setAuthor({
					name: `${interaction.user.tag} (${interaction.user.id})`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTitle(title)
				.setDescription(feedback);

			if (interaction.fields.getTextInputValue('imageInput')) {
				const imageAttachment = new AttachmentBuilder(
					interaction.fields.getTextInputValue('imageInput'));

				await feedbackEmbed.setImage(imageAttachment.attachment);
			}

			const feedbackChannel = await interaction.guild.channels.cache.get(feedbackChannelId);

			// Remove old sticky message
			await feedbackChannel.messages.fetch({ limit: 2 })
				.then(messages => {
					messages.first().delete();
				});

			const feedbackMessage = await feedbackChannel.send({ embeds: [feedbackEmbed] });

			// Add user to their own thread
			await (await interaction.channel.threads.create({
				name: title,
				reason: `${interaction.user.tag} submitted feedback: ${title}`,
				type: ChannelType.GuildPrivateThread,
				autoArchiveDuration: 60 * 24 * 3,
				rateLimitPerUser: 0,
			})).members.add(interaction.user);

			// Adjust embed for the thread
			const embedForFeedbackThread = EmbedBuilder.from(feedbackEmbed).addFields({
				name: '\u200B',
				value: underscore(`[View original message](https://discord.com/channels/${feedbackMessage.guildId}/${feedbackMessage.channelId}/${feedbackMessage.id})`),
			});
			const feedbackThread = await interaction.channel.threads.cache.find(t => t.name === title)
				.send({ embeds: [embedForFeedbackThread] });

			// Adjust embed for the feedback channel
			const embedForFeedbackChannel = await EmbedBuilder.from(feedbackEmbed).addFields({
				name: '\u200B',
				value: underscore(`[View thread](https://discord.com/channels/${feedbackThread.guildId}/${feedbackThread.channelId})`),
			});
			await feedbackMessage.edit({ embeds: [embedForFeedbackChannel] });

			await feedbackMessage.react('☝️');
			await interaction.reply({
				content: `[Feedback submitted!](https://discord.com/channels/${feedbackMessage.guildId}/${feedbackMessage.channelId}/${feedbackMessage.id})`,
				ephemeral: true,
			});
		}
	},
};
