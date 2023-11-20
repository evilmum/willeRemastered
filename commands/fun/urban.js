const { SlashCommandBuilder } = require('discord.js');

const requestHandler = require('axios').default;
const axios = requestHandler.create({
  timeout: 2000,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Explains an urban term.')
    .addStringOption(option =>
      option.setName('term')
        .setDescription('The term to be explained')
        .setRequired(true)
    ),
  async execute(interaction) {
    const term = interaction.options.getString('term');
    let urlSuffix = term.replace(/\s/, '%20');
    const autoCompleteUrl = `https://api.urbandictionary.com/v0/autocomplete-extra?term=${urlSuffix}`;

    try {
      const autoComplete = await axios.get(autoCompleteUrl);
      await editUrl(autoComplete, term);

      const definitionUrl = `https://api.urbandictionary.com/v0/define?term=${urlSuffix}`;
      const response = await axios.get(definitionUrl);
      sendReply(interaction, response, term);
    } catch (error) {
      console.log(error);
      await interaction.reply('Service down!');
    }

    async function editUrl(autoComplete, term) {
      const data = await autoComplete.data;

      if (data.results.length === 0) return;

      for (let i = 0; i < data.results.length; i++) {
        if (data.results[i].term.toLowerCase() === term.toLowerCase()) {
          urlSuffix = data.results[i].term.replace(/\s/, '%20');
          break;
        }
      }
    }

    async function sendReply(interaction, response, term) {
      const data = await response.data;
      let foundDefinition = false;
      let reply = `**${term}:**\nI have no idea what that is.`;

      if (data.list.length > 0) {
        let dataItem = {
          definition: '',
          thumbs_up: 0,
          word: '',
          example: '',
          thumbs_down: 0
        }

        let current;

        for (let i = 0; i < data.list.length; i++) {
          current = data.list[i];

          if (
            current.word.toLowerCase() === term.toLowerCase() &&
            (current.thumbs_up - current.thumbs_down) > (dataItem.thumbs_up - dataItem.thumbs_down)
          ) {
            dataItem = current;
            foundDefinition = true;
          }
        }

        if (foundDefinition) {
          reply = `**${dataItem.word}:**\n${dataItem.definition.replace(/(?<!\\)[\[\]]/g, "")}`;

          if (dataItem.example) {
            reply += `\n\n*${dataItem.example}*`;
          }

          reply = reply.replace(/(?<!\\)[\[\]]/g, "");
        }
      }

      await interaction.reply(reply);
    }
  }
}