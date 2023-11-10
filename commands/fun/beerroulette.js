const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('beerroulette')
        .setDescription('Provides a random beer you can order at Finkenkrug Duisburg.'),
    async execute(interaction) {

        await interaction.reply('Probiere alle Biere...').catch(error => console.error(error));
        const reply = await interaction.fetchReply();

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto('https://app.yamnam.com/menu/finkenkrug');

        // Wait for category "Fassbiere"
        const category = await page.waitForSelector('#Fassbiere');
        const htmlBeerList = await category.$$('sal-menu-item.ng-tns-c233-0');
        const beerList = [];

        // Extract each beer
        for (let htmlBeer of htmlBeerList) {
            //Expand beer
            const expandButton = await htmlBeer.waitForSelector('mat-icon.mat-icon');
            await expandButton.evaluate(el => el.click());
            await htmlBeer.waitForSelector('.body');

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

        await browser.close();

        const rnd = Math.floor(Math.random() * beerList.length);
        const beer = beerList[rnd];

        let response = `**${beer.name}**\n\n${beer.desc}\n\n`;

        for (let price of beer.priceList) {
            response += `*${price.amount}: ${price.price}*\n`;
        }

        await reply.edit(response).catch(error => console.error(error));
    }
};