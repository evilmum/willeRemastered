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
				.addStringOption(option =>
					option.setName('titlejoin')
						.setDescription('The title of the Movie/Series')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription('List all groupwatches'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('complete')
				.setDescription('Set a groupwatch as completed')
				.addStringOption(option =>
					option.setName('titlecomplete')
						.setDescription('The title of the Movie/Series')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('progress')
				.setDescription('Set a groupwatch as completed')
				.addStringOption(option =>
					option.setName('titleprogress')
						.setDescription('The title of the Movie/Series')
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
						interaction.reply(`${interaction.options.getString('titlecreate')} wurde erfolgreich eingetragen!`);
					});
				}, function () {
					interaction.reply(`${interaction.options.getString('titlecreate')} ist bereits für einen Groupwatch eingetragen!`);
				});
			} else if (interaction.options.getSubcommand() === 'join') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE title="${interaction.options.getString('titlejoin')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Groupwatch mit Titel ${interaction.options.getString('titlejoin')} existiert nicht`);
						} else if (result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist bereits für diesen Groupwatch eingetragen`);
						} else if (result[0].completed == true) {
							reject(`Groupwatch mit Titel ${interaction.options.getString('titlejoin')} ist bereits beendet. L Bozo`);
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

					con.query(`UPDATE groupwatch SET audience = "${watcher}" WHERE title = "${result[0].title}"`, function (err, result, fields) {
						if (err) throw err;
					});
					interaction.reply(`${interaction.user.username} wurde für ${interaction.options.getString('titlejoin')} eingetragen!`)
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
						text += `Titel: ${result[i].title} \nEingetragen: ${audience} \nEpisoden geschaut: ${result[i].progress}\n${dattel}${divider}\n`
						audience = "";
					}
					interaction.reply(`${text}`)
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			} else if (interaction.options.getSubcommand() === 'complete') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE title = "${interaction.options.getString('titlecomplete')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Kein groupwatch mit diesem Namen eingetragen`);
						} else if (!result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist nicht für ${interaction.options.getString('titlecomplete')} eingetragen`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result) {
					con.query(`UPDATE groupwatch SET completed = true, finished_on = "${new Date().toJSON().slice(0, 10)}" WHERE title = "${result[0].title}"`, function (err, result, fields) {
						if (err) throw err;
						interaction.reply(`${interaction.options.getString('titlecomplete')} erfolgreich als beendet markiert`);
					});
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			} else if (interaction.options.getSubcommand() === 'progress') {
				let promise = new Promise(function (resolve, reject) {
					con.query(`SELECT * FROM groupwatch WHERE title = "${interaction.options.getString('titleprogress')}"`, function (err, result, fields) {
						if (err) throw err;
						if (result.length == 0) {
							reject(`Kein groupwatch mit diesem Namen eingetragen`);
						} else if (!result[0].audience.includes(interaction.user.username)) {
							reject(`${interaction.user.username} ist nicht für ${interaction.options.getString('titleprogress')} eingetragen`);
						} else {
							resolve(result);
						}
					});
				});
				promise.then(function (result) {
					con.query(`UPDATE groupwatch SET progress = ${result[0].progress + interaction.options.getInteger('episodes')} WHERE title = "${result[0].title}"`, function (err, result, fields) {
						if (err) throw err;
						interaction.reply(`Progress von ${interaction.options.getString('titleprogress')} um ${interaction.options.getInteger('episodes')} Episoden erhöht`);
					});
				}, function (reason) {
					interaction.reply(`${reason}`);
				});
			}
		});
	},
};
