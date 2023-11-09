const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hp')
		.setDescription('Generates HP for a DnD character while rerolling ones')
		.addIntegerOption(option =>
			option.setName('level')
				.setDescription('The level of your character')
				.setMinValue(1)
				.setMaxValue(20)
				.setRequired(true))
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
		let tex = 'Rolled: ' + interaction.options.getInteger('hitdie') + ' ';
		hp = hp + interaction.options.getInteger('hitdie');
		for (let i = 0; i < (interaction.options.getInteger('level') - 1); i++) {
			roll = Math.floor((Math.random() * interaction.options.getInteger('hitdie')) + 1);
			if (roll > 1 && (roll + 1 <= interaction.options.getInteger('hitdie'))) {
				roll++;
			}
			if (roll == 1) {
				i--;
				tex = tex + '~~' + roll + '~~' + ' ';
			}
			else {
				tex = tex + roll + ' ';
				hp = hp + parseInt(roll);
			}
		}
		msg = ''.concat(tex, '\n', hp);
		msg = 'WILL NUR WISSEN OB GIT LÄUFT';
		await interaction.reply(msg);
	},
};