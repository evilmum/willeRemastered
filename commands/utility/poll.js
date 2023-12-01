const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('do a poll')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(options => options
			.setName("question")
			.setDescription("Provide the question")
			.setRequired(true)
			),
			/**
			 * 
			 * @param {ChatInputCommandInteraction} interaction 
			 */


	async execute(interaction) {
		const pollQuestion = interaction.options.getString("question");

		const pollEmbed = new EmbedBuilder()
			.setDescription("**Question**\n" + pollQuestion)
			.setImage("https://i.ibb.co/vxdBKFd/Untitled-1.gif")
			.addFields([
				{name: "Yes's", value: "0", inline: true},
				{name: "No's", value: "0", inline: true}
			])
			.setColor([104, 204, 156]);

			const replyObject = await interaction.reply({embeds: [pollEmbed], fetchReply: true});

			const pollButtons = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
					.setLabel("Yes")
					.setCustomId(`Poll-Yes-${replyObject.id}`)
					.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
					.setLabel("No")
					.setCustomId(`Poll-No-${replyObject.id}`)
					.setStyle(ButtonStyle.Danger)
				)

				interaction.editReply({components: [pollButtons]});
	},
};

// TODO: Call pollButtons on every button interaction!!!!
// TODO: Save set of voted users in DB to prevent mutliple votes after restart!!!