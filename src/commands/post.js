const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require('discord.js');
const axios = require('axios');
const { youTubeAPIKey } = require('../config.json');

function testLinkValidity(link) {
	const regex = new RegExp('(?:youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=)([^#\\&\\?]*)');
	return link.match(regex);
}

async function getVideoTitle(vodLinkId) {
	const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items(id, snippet(title))&id=${vodLinkId}&key=${youTubeAPIKey}`;

	let title;
	await axios.get(url)
		.then(function(res) {
			title = res.data.items[0].snippet.title;
		})
		.catch(function(e) {
			// TypeErrors are thrown when func cannot access .snippet,
			// these are handled by presence-checking title.
			if (!(e instanceof TypeError)) {
				console.log(e);
			}
		});

	return title;
}

async function updateAutoModRule(interaction, vodLinkId) {
	const blockPremiumVideosRule = await interaction.guild.autoModerationRules.fetch('1078256973558075453');

	const blockedWords = blockPremiumVideosRule.triggerMetadata.keywordFilter;
	blockedWords.push(`*${vodLinkId}*`);

	await blockPremiumVideosRule.edit({
		triggerMetadata: { keywordFilter: blockedWords },
	});
}

async function createForumPost(interaction, vodShelfId, vodTitle, vodLink) {
	const shelf = await interaction.guild.channels.cache.get(vodShelfId);
	await shelf.threads.create({
		name: vodTitle,
		message: {
			content: `${vodLink}`,
		},
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Send a message through SovBot')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand.setName('vod')
				.setDescription('Upload a VOD to the library!')
				.addStringOption(option =>
					option.setName('link')
						.setDescription('The YouTube link for the VOD')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('shelf')
						.setDescription('Which shelf should this go to?')
						.setRequired(true)
						.addChoices(
							{ name: '📼│coaching-vods', value: '1112568774219010070' },
							{ name: '📼│pro-vod-reviews', value: '1112568841248186449' },
							{ name: '📼│watch-party-vods', value: '1112550276113649705' },
						),
				),
		),
	async execute(interaction) {
		const vodLink = interaction.options.getString('link');
		const vodShelfId = interaction.options.getString('shelf');

		const valid = testLinkValidity(vodLink);
		if (!valid) {
			return await interaction.reply('Please check the provided link.');
		}

		const vodLinkId = valid[1];
		const vodTitle = await getVideoTitle(vodLinkId);
		if (vodTitle === undefined) {
			return await interaction.reply({
				content: `Please un-private video: ${inlineCode(vodLink)} first!`,
				ephemeral: true,
			});
		}

		await updateAutoModRule(interaction, vodLinkId);

		await createForumPost(interaction, vodShelfId, vodTitle, vodLink)
			.then(interaction.reply(`Published: ${inlineCode(vodTitle)}`));
	},
};
