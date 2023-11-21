const { SlashCommandBuilder } = require('discord.js');
const { mysqluser, mysqlpw, mysqldb } = require('../../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('groupwatch')
		.setDescription('join, complete, list or create Groupwatches')
		.addSubcommand(subcommand =>
			subcommand
				.setName('create')
				.setDescription('Create a groupwatch')
				.addStringOption(option =>
					option.setName('titlecreate')
						.setDescription('The title of the Movie/Series')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('join')
				.setDescription('Join a listed groupwatch')
				.addIntegerOption(option =>
					option.setName('idjoin')
						.setDescription('The id of the Movie/Series')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all groupwatches'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('complete')
				.setDescription('Set a groupwatch as completed')
				.addIntegerOption(option =>
					option.setName('idcomplete')
						.setDescription('The id of the Movie/Series')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('progress')
				.setDescription('Set a groupwatch as completed')
				.addIntegerOption(option =>
					option.setName('idprogress')
						.setDescription('The id of the Movie/Series')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('episodes')
						.setDescription('How many episodes have you progressed?')
						.setRequired(true))),

	async execute(interaction) {
		var mysql = require('mysql');

		var con = mysql.createConnection({
			host: "127.0.0.1",
			user: mysqluser,
			password: mysqlpw,
			database: mysqldb
		});


		con.connect(function (err) {
			if (err) throw err;

			if (interaction.options.getSubcommand() === 'create') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE title="${interaction.options.getString('titlecreate')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length != 0) {
							reject();
						} else {
							resolve();
						}
					});
				});
				promise.then(function () {
					con.query(`INSERT INTO groupwatch (title, progress, completed) VALUES ("${interaction.options.getString('titlecreate')}", 0, false )`, function (err, result) {
						if (err) throw err;
						interaction.reply(`${interaction.options.getString('titlecreate')} wurde erfolgreich mit ID ${result.insertId} eingetragen!`);
					});
				}, function () {
					interaction.reply(`${interaction.options.getString('titlecreate')} ist bereits für einen Groupwatch eingetragen!`);
				});
			} else if (interaction.options.getSubcommand() === 'join') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE id="${interaction.options.getInteger('idjoin')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Groupwatch mit id ${interaction.options.getInteger('idjoin')} existiert nicht`);
						} else if (result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist bereits für diesen Groupwatch eingetragen`);
						} else if (result[0].completed == true) {
							reject(`Groupwatch mit Titel ${interaction.options.getString('titleid')} ist bereits beendet. L Bozo`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result) {
					let watcher = "";
					if (result[0].audience == "") {
						watcher = interaction.user.username;
					} else {
						watcher = result[0].audience + "," + interaction.user.username;
					}

					con.query(`UPDATE groupwatch SET audience = "${watcher}" WHERE id = ${result[0].id}`, function (err, result, fields) {
						if (err) throw err;
					});
					interaction.reply(`${interaction.user.username} wurde für ${result[0].title} eingetragen!`)
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			} else if (interaction.options.getSubcommand() === 'list') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Aktuell sind keine offenen groupwatches eingetragen`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result) {
					let divider = "------------------------";
					let text = "";
					let audience = "";
					let dattel;
					for (let i = 0; i < result.length; i++) {
						if (result[i].finished_on == null) {
							dattel = "";
						} else {
							dattel = `Beendet am: ${result[i].finished_on}\n`;
						}
						let toSort = result[i].audience.split(",");
						for (let j = 0; j < toSort.length; j++) {
							audience += `${toSort[j]} `;
						}
						text += `ID: ${result[i].id} \nTitel: ${result[i].title} \nEingetragen: ${audience} \nEpisoden geschaut: ${result[i].progress}\n${dattel}${divider}\n`
						audience = "";
					}
					interaction.reply(`${text}`)
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			} else if (interaction.options.getSubcommand() === 'complete') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE id = "${interaction.options.getInteger('idcomplete')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Kein groupwatch mit dieser ID eingetragen`);
						} else if (!result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist nicht für ${result[0].title} eingetragen`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result2) {
					con.query(`UPDATE groupwatch SET completed = true, finished_on = "${new Date().toJSON().slice(0, 10)}" WHERE id = ${result2[0].id}`, function (err, result, fields) {
						if (err) throw err;
						interaction.reply(`${result2[0].title} erfolgreich als beendet markiert`);
					});
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			} else if (interaction.options.getSubcommand() === 'progress') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE id = "${interaction.options.getInteger('idprogress')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Kein groupwatch mit dieser ID eingetragen`);
						} else if (!result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist nicht für ${result[0].title} eingetragen`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result2) {
					con.query(`UPDATE groupwatch SET progress = ${result2[0].progress + interaction.options.getInteger('episodes')} WHERE id = ${result2[0].id}`, function (err, result, fields) {
						if (err) throw err;
						interaction.reply(`Progress von ${result2[0].title} um ${interaction.options.getInteger('episodes')} Episoden erhöht`);
					});
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			}
		});
	},
};
