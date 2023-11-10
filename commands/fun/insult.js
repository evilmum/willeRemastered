const { SlashCommandBuilder } = require('discord.js');

const requestHandler = require('axios').default;
const axios = requestHandler.create({
  timeout: 2000,
});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('insult')
    .setDescription('Insults you or someone else.')
    .addUserOption(option => 
        option.setName('target')
        .setDescription('Person to insult.')
    )
    .addStringOption(option => 
        option.setName('language')
        .setDescription('Language of the insult.')
        .addChoices(
            {name: 'English', value: 'en'},
            {name: 'German', value: 'de'},
            {name: 'Spanish', value: 'es'}
        )
    ),
  async execute(interaction) {
    let lang = interaction.options.getString('language');
    if (!lang) lang = 'en';

    const urlSuffix = `lang=${lang}&type=json`;
    const url = `https://evilinsult.com/generate_insult.php?${urlSuffix}`;

    try {
      const response = await axios.get(url);
      sendInsult(interaction, response);
    } catch (error) {
      console.log(error);
      await interaction.reply('Service down!');
    }

    async function sendInsult(interaction, response) {
        const target = interaction.options.getUser('target');
        let insult = await response.data.insult;

        if (target) insult = `Hey ${target}! ${insult}`;

        await interaction.reply(insult);
    }
  },
};