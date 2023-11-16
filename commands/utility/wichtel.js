const { SlashCommandBuilder } = require('discord.js');
const { mysqluser, mysqlpw, mysqldb } = require('/home/discordbot/config.json');


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
			host: "127.0.0.1",
			user: mysqluser,
			password: mysqlpw,
			database: mysqldb
		});


		con.connect(function(err) {
			var deinemudda = false;
			if (err) throw err;

			if (interaction.options.getSubcommand() === 'register') {
				let promise = new Promise(function(resolve, reject) {
					con.query(`SELECT * FROM Wichteln WHERE id = "${interaction.user.id}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							reject();
						} else {
							resolve();
						}
					});
				});
				promise.then(function(){
					con.query(`INSERT INTO Wichteln VALUES (${interaction.user.id},"${interaction.options.getString('realname')}")`, function (err, result) {
						if (err) throw err;
						interaction.reply(`${interaction.user.username} wurde erfolgreich registriert!`);
					});
				},function(){
					interaction.reply(`${interaction.user.username} ist bereits registriert!`);
				});
			} else if (interaction.options.getSubcommand('pull')) {
				let promise = new Promise(function(resolve, reject) {
					con.query(`SELECT * FROM Wichteln WHERE id = "0"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							reject();
						} else {
							resolve();
						}
					});
				});
				promise.then(function() {
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
				}, function() {
							interaction.reply(`Das ziehen eines Partners ist noch nicht freigegeben. Aktuell ist noch Phase des Eintragens. Der Admin wird sie darauf hinweisen, sobald es freigegeben ist.`);
				});
			}
		
	});
	},
};
