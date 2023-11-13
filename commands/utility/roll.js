const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls x dice of your choice')
		.addIntegerOption(option =>
			option.setName('die')
				.setDescription('The amount of sides on the die to roll')
				.setMinValue(1)
				.setMaxValue(1000))
		.addIntegerOption(option =>
			option.setName('dieamount')
				.setDescription('the amount of dice to roll')
				.setMinValue(1)
				.setMaxValue(100)),
	async execute(interaction) {
		const die = interaction.options.getInteger('die') ?? 20;
		const dieamount = interaction.options.getInteger('dieamount') ?? 1;
		let tex = 'Rolling ' + dieamount + ' d' + die + ' : \n\n';
		let total = 0;
		for (let i = 0; i < dieamount; i++) {
			roll = Math.floor((Math.random() * die) + 1);
			tex = tex + roll + ' ';
			total += roll;
		}
		if (dieamount == 1) {
			await interaction.reply(tex);
		}else {
			msg = ''.concat(tex, '\n', 'Total: ' + total);
			await interaction.reply(msg);
		}
	},
};