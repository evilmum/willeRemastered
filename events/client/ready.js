const { Events } = require("discord.js");
const { loadCommands } = require("../../handlers/commandHandler");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    loadCommands(client);
  },
};
