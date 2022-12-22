import { EmbedBuilder, Events, hyperlink, Message, ThreadAutoArchiveDuration } from 'discord.js';
import { Client } from 'twitter-api-sdk';
import fetch from 'node-fetch';
import { twitterBearerToken } from '../config.json';

const twitterClient = new Client(twitterBearerToken);

function isPatchNotes(tweetContent: string) {
	/*
	RegEx looks for the keyword 'Patch Notes x.yz'
	and if present then assumes the tweet is about patch notes.
	 */
	const regExp = new RegExp('Patch\\sNotes\\s([+-]?(?=\\.\\d|\\d)(?:\\d+)?\\.?\\d*)(?:[eE]([+-]?\\d+))?\\shere:');
	return tweetContent?.match(regExp);
}

async function getTweetContent(client: Client, tweetId: string): Promise<string> {
	/*
	Troubles with embed description cache led to
	fetching content through twitter.
	 */
	const tweet = await client.tweets.findTweetById(tweetId);
	return tweet.data?.text || 'Unable to get Tweet';
}

async function transformShortURL(patchDescription: string): Promise<string> {
	/*
	Used to replace twitter's t.co URL with a full Riot domain.
	 */
	const regExp = new RegExp('https://t\\.co/[A-Za-z0-9]+');
	const match = patchDescription.match(regExp);

	let transformedString;
	if (match) {
		await fetch(match[0])
			.then(res => {
				if (res.status === 200) {
					transformedString = patchDescription.replace(regExp, res.url);
				}
				else {
					transformedString = match[0];
				}
			});
	}
	return transformedString || 'Unable to get Tweet';
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

		if (!twitterClient) {
			return;
		}

		const tweetId = message.content.substring(message.content.length - 19);
		const [tweetContent] = await Promise.all([getTweetContent(twitterClient, tweetId)]);

		const match = isPatchNotes(tweetContent);
		if (!match) {
			return;
		}

		const patchTitle: string = match[0];
		let patchDescription: string = tweetContent.slice(0, tweetContent.length - 23);
		patchDescription = await transformShortURL(patchDescription);

		await createForumPost(message, patchTitle, patchDescription);
	},
};
