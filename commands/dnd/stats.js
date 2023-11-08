const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Generates a random stat array for DnD')
		.addIntegerOption(option =>
			option.setName('minstats')
				.setDescription('The minimum sum of all stats')
				.setMinValue(50)
				.setMaxValue(90)
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('maxstats')
				.setDescription('The maximum sum of all stats')
				.setMinValue(60)
				.setMaxValue(102)
				.setRequired(true)),
	async execute(interaction) {
		let done = false;
		const points = [];
		const stats = [];
		let sum = 0;
		let alls;
		let min;
		let total;

		while (!done) {
			sum = 0;

			for (let i = 0; i < 6; i++) {
				points[0] = Math.floor((Math.random() * 6) + 1);
				points[1] = Math.floor((Math.random() * 6) + 1);
				points[2] = Math.floor((Math.random() * 6) + 1);
				points[3] = Math.floor((Math.random() * 6) + 1);

				alls = points[0] + points[1] + points[2] + points[3];
				min = Math.min.apply(Math, points);
				total = alls - min;

				sum = sum + total;
				stats[i] = total;
			}
			if (sum > interaction.options.getInteger('minstats') && sum < interaction.options.getInteger('maxstats')) {
				done = true;
			}
		}
		const msg = ''.concat('1.  ', stats[0], '\n', '2.  ', stats[1], '\n', '3.  ', stats[2], '\n', '4.  ', stats[3], '\n', '5.  ', stats[4], '\n', '6.  ', stats[5], '\n\n', sum);
		await interaction.reply(msg);
	},
};