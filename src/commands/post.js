const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require('discord.js');
const axios = require('axios');
const { youTubeAPIKey } = require('../config.json');

function matchLinkValidity(link) {
	const youtubeRegex = new RegExp('(?:youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=)([^#\\&\\?]*)');
	return link.match(youtubeRegex);
}

async function getVideoTitle(vodLinkId) {
	const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&fields=items(id, snippet(title))&id=${vodLinkId}&key=${youTubeAPIKey}`;

	let title;
	await axios.get(url)
		.then(function(res) {
			title = res.data.items[0].snippet.title;
		})
		.catch(function(e) {
			console.error(e);
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

async function createForumPost(interaction, vodTitle, vodShelfId, vodLink) {
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

		const matchLinkResult = matchLinkValidity(vodLink);
		if (matchLinkResult === null) {
			return await interaction.reply({
				content: `${inlineCode(vodLink)}, is not valid, please submit another link.`,
				ephemeral: true,
			});
		}

		const vodLinkId = matchLinkResult[1];

		await updateAutoModRule(interaction, vodLinkId);

		const vodTitle = await getVideoTitle(vodLinkId, youTubeAPIKey);
		if (vodTitle === undefined) {
			return await interaction.reply({
				content: `Please un-private video: ${inlineCode(vodLink)} first!`,
				ephemeral: true,
			});
		}

		await createForumPost(interaction, vodTitle, vodShelfId, vodLink)
			.then(interaction.reply(`Published: ${inlineCode(vodTitle)}`));
	},
};
