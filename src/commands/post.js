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

async function createForumPost(interaction, vodTitle, vodType, vodLink) {
	const vodLibrary = await interaction.guild.channels.cache.get('1068608833729077308');
	if (!vodLibrary.isThread) return;

	await vodLibrary.threads.create({
		name: vodTitle,
		appliedTags: [`${vodType}`],
		message:  {
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
						.setDescription('The link for the VOD')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('type')
						.setDescription('Label which type of VOD this is')
						.setRequired(true)
						.addChoices(
							{ name: 'Watch Party', value: '1078028194894069782' },
							{ name: 'Coaching', value: '1078028217002229820' },
							{ name: 'Coach\'s Notes', value: '1078028249176752229' },
							{ name: 'Part-2 Breakdowns', value: '1081315836515598406' },
							{ name: 'VOD Review', value: '1081315937971605625' }))),
	async execute(interaction) {
		const vodLink = interaction.options.getString('link');

		const matchLinkResult = matchLinkValidity(vodLink);
		if (matchLinkResult === null) {
			return await interaction.reply({
				content: `${inlineCode(vodLink)}, is not valid, please submit another link.`,
				ephemeral: true,
			});
		}

		const vodLinkId = matchLinkResult[1];

		await updateAutoModRule(interaction, vodLinkId);

		const vodType = interaction.options.getString('type');

		const vodTitle = await getVideoTitle(vodLinkId, youTubeAPIKey);
		if (vodTitle === undefined) {
			return await interaction.reply({
				content: `Please un-private video: ${inlineCode(vodLink)} first!`,
				ephemeral: true,
			});
		}

		await createForumPost(interaction, vodTitle, vodType, vodLink)
			.then(interaction.reply(`Published: ${inlineCode(vodTitle)}`));
	},
};
