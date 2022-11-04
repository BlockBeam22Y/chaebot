const fs = require('node:fs')
const path = require('node:path')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const roleReactionsPath = path.join(__dirname, '../role-reactions.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Desplega la lista de autoroles'),
  async execute(interaction) {
    const roleReactions = JSON.parse(fs.readFileSync(roleReactionsPath))
    const embed = new EmbedBuilder()
      .setColor(0x224fb1)
      .setTitle('Lista de autoroles')
      .setDescription(Object.keys(roleReactions)
        .map(roleId => `${roleReactions[roleId]} <@&${roleId}>`)
        .join('\n'))

    interaction.reply({ embeds: [embed] })
  }
}