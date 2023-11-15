const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('beerroulette')
        .setDescription('Provides a random beer you can order at Finkenkrug Duisburg.')
        .addBooleanOption(option => option.setName('fassbiere').setDescription('Fassbiere zur Auswahl hinzufügen?'))
        .addBooleanOption(option => option.setName('flaschenbiere').setDescription('Flaschenbiere zur Auswahl hinzufügen?'))
        .addBooleanOption(option => option.setName('dosenbiere').setDescription('Dosenbiere zur Auswahl hinzufügen?'))
        .addBooleanOption(option => option.setName('cider').setDescription('Cider zur Auswahl hinzufügen?')),
    async execute(interaction) {
        await interaction.reply('Probiere alle Biere...').catch(error => console.error(error));
        const reply = await interaction.fetchReply();

        try {
            const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: 'new', executablePath: '/usr/bin/chromium-browser' });
            const page = await browser.newPage();

            await page.goto('https://app.yamnam.com/menu/finkenkrug', { timeout: 5000 }).catch((error) => {
                throw {
                    custom: true,
                    message: 'Getränkekarte nicht erreichbar',
                    error: error
                };
            });

            const beerList = [];

            const fetchBeers = async (category) => {
                // Wait for category "Fassbiere"
                const htmlCategory = await page.waitForSelector(`#${category}`, { timeout: 5000 }).catch((error) => {
                    throw {
                        custom: true,
                        message: `Keine ${category} gefunden!`,
                        error: error
                    }
                });

                const htmlBeerList = await htmlCategory.$$('sal-menu-item mat-card.item');

                // Extract each beer
                for (let htmlBeer of htmlBeerList) {
                    //Expand beer
                    const expandButton = await htmlBeer.waitForSelector('mat-icon.mat-icon');
                    await expandButton.evaluate(el => el.click());
                    await htmlBeer.waitForSelector('.body', { timeout: 5000 });

                    const beerName = await htmlBeer.$eval('.dotted-description-content-wm', el => el.innerText);
                    const beerDesc = await htmlBeer.$eval('.body .dotted-description-content', el => el.innerText);

                    const htmlPriceList = await htmlBeer.$$('.variant-container');
                    const priceList = [];

                    for (let htmlPrice of htmlPriceList) {
                        const amount = await htmlPrice.$eval('.variant-name', el => el.innerText);
                        const price = await htmlPrice.$eval('.variant-price', el => el.innerText);

                        priceList.push({
                            amount: amount,
                            price: price
                        });
                    }

                    beerList.push({
                        name: beerName,
                        desc: beerDesc,
                        priceList: priceList
                    });
                }
            }

            if (interaction.options.getBoolean('flaschenbiere')) {
                await fetchBeers('Flaschenbiere');
            }

            if (interaction.options.getBoolean('dosenbiere')) {
                await fetchBeers('Dosenbiere');
            }

            if (interaction.options.getBoolean('cider')) {
                await fetchBeers('Cider');
            }

            if (interaction.options.getBoolean('fassbiere') || beerList.length === 0) {
                await fetchBeers('Fassbiere');
            }

            await browser.close();

            const rnd = Math.floor(Math.random() * beerList.length);
            const beer = beerList[rnd];

            let response = `**${beer.name}**\n\n${beer.desc}\n\n`;

            for (let price of beer.priceList) {
                response += `*${price.amount}: ${price.price}*\n`;
            }

            await reply.edit(response).catch(error => console.error(error));
        } catch (error) {
            let response = 'Es ist ein unbekannter Fehler aufgetreten';

            if (error.custom) {
                response = error.message;
            }

            reply.edit(response);
            console.log(error);
        }
    }
};