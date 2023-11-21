const { SlashCommandBuilder } = require('discord.js');
const { mysqluser, mysqlpw, mysqldb } = require('../../config.json');

// Ja moin, der Lukas. Table für diesen Test:  
// CREATE TABLE `test` (	`id` INT NOT NULL AUTO_INCREMENT,`text` VARCHAR(32) DEFAULT '',	PRIMARY KEY (`id`));
// Da dann einfach einen Eintrag reineumeln

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mysqltest')
		.setDescription('Test Mysql Connection'),
	async execute(interaction) {
		var mysql = require('mysql');

		var con = mysql.createConnection({
			host: "127.0.0.1",
			user: mysqluser,
			password: mysqlpw,
			database: mysqldb
		});


		con.connect(function(err) {
			if (err) throw err;
			let promise = new Promise(function(resolve, reject) {
				con.query(`SELECT * FROM test WHERE id = '1'`, function (err, result, fields) {
					if (err) throw err;
					if (result.length == 0) {
						reject();
					} else {
						resolve(result[0].text);
					}
				});
			});
			promise.then(function(nase){
				interaction.reply(`${nase}`);
			},function(){
				interaction.reply(`Something went wrong`);
			});
		});
	},
};
