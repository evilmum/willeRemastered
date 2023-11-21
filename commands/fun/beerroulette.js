const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const { mysqluser, mysqlpw, mysqldb } = require('../../config.json');
const mysql = require('mysql');

const data = new SlashCommandBuilder()
    .setName('beerroulette')
    .setDescription('Provides a random beer you can order at Finkenkrug Duisburg.')
    .addBooleanOption(option => option.setName('fassbiere').setDescription('Fassbiere zur Auswahl hinzufügen?'))
    .addBooleanOption(option => option.setName('flaschenbiere').setDescription('Flaschenbiere zur Auswahl hinzufügen?'))
    .addBooleanOption(option => option.setName('dosenbiere').setDescription('Dosenbiere zur Auswahl hinzufügen?'))
    .addBooleanOption(option => option.setName('cider').setDescription('Cider zur Auswahl hinzufügen?'));

async function execute(interaction) {
    await interaction.reply('Probiere alle Biere...').catch(error => console.error(error));
    const reply = await interaction.fetchReply();
    const categories = [];

    if (interaction.options.getBoolean('flaschenbiere')) {
        categories.push("'Flaschenbiere'");
    }

    if (interaction.options.getBoolean('dosenbiere')) {
        categories.push("'Dosenbiere'");
    }

    if (interaction.options.getBoolean('cider')) {
        categories.push("'Cider'");
    }

    if (interaction.options.getBoolean('fassbiere') || categories.length === 0) {
        categories.push("'Fassbiere'");
    }

    const con = mysql.createConnection({
        host: "127.0.0.1",
        user: mysqluser,
        password: mysqlpw,
        database: mysqldb
    });

    con.connect(async (err) => {
        try {
            if (err) throw err;

            const beerList = await new Promise((resolve) => {
                con.query(`SELECT id, name, description FROM beer WHERE category IN (${categories.toString()})`, (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        resolve(result);
                    }
                });
            });

            const randomBeer = beerList[Math.floor(Math.random() * beerList.length)];

            const priceList = await new Promise((resolve) => {
                con.query(`SELECT amount, price FROM beer_price WHERE beer_id = ${randomBeer.id}`, (err, result) => {
                    if (err) {
                        throw err;
                    } else {
                        resolve(result);
                    }
                });
            });

            let response = `**${randomBeer.name}**\n\n${randomBeer.description}\n\n`;

            for (let price of priceList) {
                response += `*${price.amount}: ${price.price}*\n`;
            }

            await reply.edit(response);
        } catch (error) {
            reply.edit("Bin leider gerade zu besoffen...");
            console.log(error);
        }
    });
}

async function fetchBeers() {
    // REMEMBER TO ALWAYS SWITCH TO CORRECT OS!!!
    // const browser = await puppeteer.launch({ headless: 'new' }); // WINDOWS
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new', executablePath: '/usr/bin/chromium-browser' }); // LINUX
    
    const page = await browser.newPage();
    const categories = ['Fassbiere', 'Flaschenbiere', 'Dosenbiere', 'Cider'];

    console.log("Started fetching beers...");

    await page.goto('https://app.yamnam.com/menu/finkenkrug').catch((error) => console.log(error));

    const con = mysql.createConnection({
        host: "127.0.0.1",
        user: mysqluser,
        password: mysqlpw,
        database: mysqldb
    });

    con.connect(async (err) => {
        if (err) throw err;

        // Delete all beers
        await new Promise((resolve) => {
            con.query(`DELETE FROM beer;`, (err, result) => {
                resolve();
                if (err) throw err;
            });
        });

        for (let category of categories) {
            // Wait for category
            const htmlCategory = await page.waitForSelector(`#${category}`).catch((error) => console.log(error));
            const htmlBeerList = await htmlCategory.$$('sal-menu-item mat-card.item');

            // Extract each beer
            for (let htmlBeer of htmlBeerList) {
                //Expand beer
                const expandButton = await htmlBeer.waitForSelector('mat-icon.mat-icon');
                await expandButton.evaluate(el => el.click());
                await htmlBeer.waitForSelector('.body', { timeout: 5000 });

                const beerId = Math.floor(Math.random() * 10000000) + 10000000;
                const beerName = await htmlBeer.$eval('.dotted-description-content-wm', el => el.innerText.replaceAll("'", '"'));
                const beerDesc = await htmlBeer.$eval('.body .dotted-description-content', el => el.innerText.replaceAll("'", '"'));

                await new Promise((resolve) => {
                    con.query(`INSERT INTO beer VALUES(${beerId}, '${beerName}', '${beerDesc}', '${category}')`, (err, result) => {
                        resolve();
                        if (err) throw err;
                    });
                });

                const htmlPriceList = await htmlBeer.$$('.variant-container');
                const priceList = [];

                for (let htmlPrice of htmlPriceList) {
                    const amount = await htmlPrice.$eval('.variant-name', el => el.innerText.replaceAll("'", '"'));
                    const price = await htmlPrice.$eval('.variant-price', el => el.innerText.replaceAll("'", '"'));

                    await new Promise((resolve) => {
                        con.query(`INSERT INTO beer_price VALUES(${beerId}, '${amount}', '${price}')`, (err, result) => {
                            resolve();
                            if (err) throw err;
                        });
                    });
                }
            }
        }

        await browser.close();

        console.log('...fetched all beers!');
    });
}

module.exports = {
    data: data,
    execute,
    fetchBeers
};