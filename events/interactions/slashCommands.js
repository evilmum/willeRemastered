const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "This command is outdated.",
        ephemeral: true,
      });

    if (command.developer && interaction.user.id == 10101010)
      return interaction.reply({
        content: "This command is only available to the developers.",
        ephemeral: true,
      });

    try {
      const subCommand = interaction.options.getSubcommand();
      if (subCommand) {
        const subCommandFile = client.subCommands.get(
          `${interaction.commandName}.${subCommand}`
        );
        if (!subCommandFile)
          return interaction.reply({
            content: "This subcommand is outdated",
            ephemeral: true,
          });
        subCommandFile.execute(interaction, client);
      }
    } catch (err) {
      command.execute(interaction, client);
    }
  },
};
