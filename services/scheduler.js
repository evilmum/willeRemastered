//const { SlashCommandBuilder } = require('discord.js');
//const source = require('../../index.js');
//const { mysqluser, mysqlpw, mysqldb } = require('../../config.json');

const cron = require('node-cron');
const beerRoulette = require('../commands/fun/beerroulette.js');

// Beerroulette pull
cron.schedule('0 0 4 * * *', () => {
	try {
		beerRoulette.fetchBeers();
	} catch (error) {
		console.log(error);
	}
})