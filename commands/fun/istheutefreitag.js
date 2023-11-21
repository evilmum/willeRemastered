const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('istheutefreitag')
		.setDescription("Tells you if it's Friday today."),
	async execute(interaction) {
        const date = new Date();

        if (date.getDay() === 5) {
            await interaction.reply('Ja!');
        } else {
            await interaction.reply('Nein!');
        }
	}
};