const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hpsingle')
		.setDescription('Generates HP for one level up of a DnD character while rerolling ones')
		.addIntegerOption(option =>
			option.setName('hitdie')
				.setDescription('The hitdie of your class')
				.setRequired(true)
				.addChoices(
					{ name:'6', value: 6 },
					{ name:'8', value: 8 },
					{ name:'10', value: 10 },
					{ name:'12', value: 12 },
				)),
	async execute(interaction) {
		let roll;
		let hp = 0;
		let msg = '';
		let tex = 'Rolled: ';
		let done = false;
		while (!done) {
			roll = Math.floor((Math.random() * interaction.options.getInteger('hitdie')) + 1);
			if (roll > 1 && (roll + 1 <= interaction.options.getInteger('hitdie'))) {
				roll++;
			}
			if (roll == 1) {
				tex = tex + '~~' + roll + '~~' + ' ';
			}
			else {
				tex = tex + roll + ' ';
				hp = hp + parseInt(roll);
				done = true;
			}
		}
		msg = ''.concat(tex, '\n', hp);
		await interaction.reply(msg);
	},
};