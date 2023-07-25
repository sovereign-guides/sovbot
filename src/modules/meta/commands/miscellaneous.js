const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('miscellaneous')
		.setDescription('A series of misc commands that do not fit into any category.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommandGroup(subcommandGroup =>
			subcommandGroup.setName('role')
				.setDescription('Miscellaneous commands surrounding roles.')
				.addSubcommand(subcommand =>
					subcommand.setName('merge')
						.setDescription('Merge self-roles to decrease profile sizes.'),
				),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommandGroup() !== 'role') return;
		if (interaction.options.getSubcommand() !== 'merge') return;

		await interaction.deferReply();

		const roleTypes = {
			allAgents: '988134667515469834',
			controller: '1117127477542801418',
			duelist: '1117127398559850617',
			initiator: '1117127655523889304',
			sentinel: '1117127542411886675',
			allPronouns: '1011775338407264338',
			theyThemPronoun: '986382790994063450',
			sheHerPronoun: '986382725751648356',
			heHimPronoun: '986382654654013440',
		};

		const members = await interaction.guild.members.fetch();

		let agentRoleMerges = 0;
		let pronounRoleMerges = 0;

		for (const [, member] of members) {
			const memberRoles = member.roles.cache;

			if (memberRoles.has(roleTypes.controller)
				&& memberRoles.has(roleTypes.duelist)
				&& memberRoles.has(roleTypes.initiator)
				&& memberRoles.has(roleTypes.sentinel)) {
				await member.roles.add(roleTypes.allAgents);
				await member.roles.remove([
					roleTypes.controller,
					roleTypes.duelist,
					roleTypes.initiator,
					roleTypes.sentinel,
				]).then(() => agentRoleMerges++);
			}

			if (memberRoles.has(roleTypes.theyThemPronoun)
				&& memberRoles.has(roleTypes.sheHerPronoun)
				&& memberRoles.has(roleTypes.heHimPronoun)) {
				await member.roles.add(roleTypes.allPronouns);
				await member.roles.remove([
					roleTypes.theyThemPronoun,
					roleTypes.sheHerPronoun,
					roleTypes.heHimPronoun,
				]).then(() => pronounRoleMerges++);
			}
		}

		await interaction.followUp({
			content: `Successfully merged ${agentRoleMerges} agent roles.\nSuccessfully merged ${pronounRoleMerges} pronoun roles.`,
		});
	},
};
