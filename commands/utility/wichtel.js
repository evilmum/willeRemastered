const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const jsonFileStream = fs.createWriteStream("wichtel.json");
const { mysqluser, mysqlpw, mysqldb } = require('./config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wichtel')
		.setDescription('Register or pull for the wichteling')
		.addSubcommand(subcommand =>
			subcommand
				.setName('register')
				.setDescription('Register for the wichteling')
				.addStringOption(option => 
					option.setName('realname')
					.setDescription('your recognizable name')
					.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('pull')
				.setDescription('Pull from the wichteling to see your Partner!')),
	async execute(interaction) {
		var mysql = require('mysql');

		var con = mysql.createConnection({
			host: "localhost",
			user: mysqluser,
			password: mysqlpw,
			database: mysqldb
		});

		con.connect(function(err) {
			if (err) throw err;
			console.log("Connected!");

			if (interaction.options.getSubcommand() === 'register') {
				con.query(`SELECT * FROM Wichteln WHERE id = "${interaction.user.id}"`, function (err, result, fields) {
					if (err) throw err;
					if (result.length != 0) {
						interaction.reply(`${interaction.user.username} ist bereits registriert!`);
						return;
					}
				});
				con.query(`INSERT INTO Wichtel VALUES ("${interaction.user.id}", 
								"${interaction.options.getString('realname')}")`, function (err, result) {
					if (err) throw err;
					interaction.reply(`${interaction.user.username} wurde erfolgreich registriert!`);
				});
			} else if (interaction.options.getSubcommand('pull')) {
				con.query(`SELECT * FROM Wichteln WHERE id = "0"`, function (err, result, fields) {
					if (err) throw err;
					if (result.length != 0) {
						interaction.reply(`Das ziehen eines Partners ist noch nicht Freigegeben. Aktuell ist noch Phase des Eintragens. Der Admin wird sie darauf hinweisen, sobald es Freigegeben ist.`);
						return;
					}
				});
				let partner = "";
				con.query(`SELECT * FROM Wichteln WHERE id != "${interaction.user.id}"`, function (err, result, fields) {
					if (err) throw err;
					if (result.length != 0) {
						partner = result[Math.floor((Math.random() * result.length))].name;
					}
				});
				con.query(`DELETE FROM Wichteln WHERE name = "${partner}"`, function (err, result) {
					if (err) throw err;
				});
				interaction.reply(`Der Partner für ${interaction.user.username} ist ${partner}!`)
			}
	});
	},
};