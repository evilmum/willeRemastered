const { SlashCommandBuilder } = require('discord.js');
const { mysqluser, mysqlpw, mysqldb } = require('../../config.json');


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


		con.connect(function (err) {
			var deinemudda = false;
			if (err) throw err;

			if (interaction.options.getSubcommand() === 'register') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM Wichteln WHERE id = "${interaction.user.id}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							reject();
						} else {
							resolve();
						}
					});
				});
				promise.then(function () {
					con.query(`INSERT INTO Wichteln VALUES (${interaction.user.id},"${interaction.options.getString('realname')}", false,false)`, function (err, result) {
						if (err) throw err;
						interaction.reply(`${interaction.user.username} wurde erfolgreich registriert!`);
					});
				}, function () {
					interaction.reply(`${interaction.user.username} ist bereits registriert!`);
				});
			} else if (interaction.options.getSubcommand('pull')) {
				let promise = new Promise(function (resolve, reject) {

					/* con.query(`SELECT * FROM Wichteln WHERE id = "${interaction.user.id}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							resolve();
						} else if (result[0].has_pulled == true){
							reject(`Du hast schon einen Partner!`);
						} else {
							reject(`Du bist nicht Teil der Wichtelgruppe!`);
						}
					}); */

					con.query(`SELECT * FROM Wichteln WHERE id = "0"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							reject(`Das ziehen eines Partners ist noch nicht freigegeben. Aktuell ist noch Phase des Eintragens. Der Admin wird sie darauf hinweisen, sobald es freigegeben ist.`);
						} else {
							resolve();
						}
					});
				});
				promise.then(function () {
					let partner = "";

					let promise = new Promise(function (resolve, reject) {
						con.query(`SELECT * FROM Wichteln WHERE been_pulled = false`, function (err, result, fields) {
							if (err) throw err;
							if (result.length == 2 && (result[0].name == "Alina" || result[1].name == "Alina")) {
								resolve(result);
							} else {
								reject();
							}
						});
					});
					promise.then(function () {
						partner = "Alina";
						con.query(`UPDATE Wichteln SET been_pulled = true WHERE name = "${partner}"`, function (err, result) {
							if (err) throw err;
						});
						con.query(`UPDATE Wichteln SET has_pulled = true WHERE id = "${interaction.user.id}"`, function (err, result) {
							if (err) throw err;
						});

					}, async function () {
						con.query(`SELECT * FROM Wichteln WHERE id != "${interaction.user.id}" AND been_pulled = false`, function (err, result, fields) {
							if (err) throw err;
							partner = result[Math.floor((Math.random() * result.length))].name;
						});
						con.query(`UPDATE Wichteln SET been_pulled = true WHERE name = "${partner}"`, function (err, result) {
							if (err) throw err;
						});
						con.query(`UPDATE Wichteln SET has_pulled = true WHERE id = "${interaction.user.id}"`, function (err, result) {
							if (err) throw err;
						});
						await interaction.reply({ content: `Der Partner für ${interaction.user.username} ist ${partner}!`, ephemeral: true });
					});
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			}
		});
	},
};
