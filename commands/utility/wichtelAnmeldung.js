const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const jsonFileStream = fs.createWriteStream("wichtel.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wichtelanmeldung')
		.setDescription('Registers you for the pull')
		.addStringOption(option => 
			option.setName('realname')
			.setDescription('your recognizable name')
			.setRequired(true)
	),
	async execute(interaction) {

		let data = fs.readFileSync("wichtel.json");
		if(data.includes(interaction.user.id)){
			interaction.reply(`${interaction.user.username} ist bereits registriert!`);
			return;
		}

		const jsonObject = {table: [],}; 

		jsonObject.table.push({
			id: interaction.user.id,
			name: interaction.options.getString('realname')
		});

		jsonFileStream.write(JSON.stringify(jsonObject), function (err) {
			if (err) throw err;
			interaction.reply(`${interaction.user.username} wurde erfolgreich registriert!`);
		});
	},
};