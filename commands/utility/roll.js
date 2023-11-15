const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls x dice of your choice')
		.addStringOption(option =>
			option.setName('formula')
				.setDescription('The roll formula <amount>d<die> (e.g. "1d20")')),
	async execute(interaction) {
		const formula = interaction.options.getString('formula');
		const regex = /^\d*d\d*$/;

		let amount = 1;
		let die = 20;

		if (formula) {
			const stringAmount = /^\d+d/.exec(formula);
			const stringDie = /d\d+$/.exec(formula);

			if (stringAmount) {
				amount = Number(stringAmount[0].slice(0, -1));
			}
			if (stringDie) {
				die = Number(stringDie[0].slice(1));
			}
		}

		let tex = 'Rolling ' + amount + ' d' + die + ' : \n\n';
		let total = 0;
		for (let i = 0; i < amount; i++) {
			roll = Math.floor((Math.random() * die) + 1);
			tex = tex + roll + ' ';
			total += roll;
		}
		if (amount == 1) {
			await interaction.reply(tex);
		}else {
			msg = ''.concat(tex, '\n', 'Total: ' + total);
			await interaction.reply(msg);
		}
	},
};