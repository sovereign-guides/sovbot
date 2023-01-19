import { EmbedBuilder, Events, hyperlink, Message, ThreadAutoArchiveDuration } from 'discord.js';

function isPatchNotes(patchDescription: string) {
	const regExp = new RegExp('Patch\\sNotes\\s([+-]?(?=\\.\\d|\\d)(?:\\d+)?\\.?\\d*)');
	return patchDescription?.match(regExp);
}

async function createForumPost(message: Message, title: string, body: string) {
	const channel = message.guild?.channels.cache.get('1047249775180927026');
	if (!channel || channel?.type !== 15) {
		return;
	}

	await channel.threads.create({
		name: title,
		message: { content: body },
		appliedTags: ['1047250886772138114'],
		autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
	}).then(async (post) => {
		const embed = new EmbedBuilder()
			.setColor('#2f3136')
			.setDescription(`Come and discuss this in ${hyperlink(post.name, post.url)}!`);

		await message.reply({ embeds: [embed] });
	});
}

module.exports = {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.channelId !== '988509424089956374') {
			return;
		}

		if (message.webhookId !== '988509810448273440') {
			return;
		}

		await message.fetch(true);

		if (message.embeds[0]?.author?.name !== 'VALORANT (@PlayVALORANT)') {
			return;
		}

		if (!message.embeds[0]?.description) {
			return;
		}

		const patchDescription = message.embeds[0].description;

		const patchNotesMatch = isPatchNotes(patchDescription);
		if (!patchNotesMatch || !patchNotesMatch[0]) {
			return;
		}

		const patchVersion = patchNotesMatch[0];

		await createForumPost(message, patchVersion, patchDescription);
	},
};
