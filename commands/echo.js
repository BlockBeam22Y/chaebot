const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('El bot dirá la pendejada que quieras')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Ingresa el mensaje')
        .setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message')

    interaction.reply({ content: 'Enviado', ephemeral: true })

    interaction.channel.send(message)
  }
}