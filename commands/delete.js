const fs = require('node:fs')
const path = require('node:path')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const roleReactionsPath = path.join(__dirname, 'role-reactions.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Elimina un autorol del sistema')
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Selecciona un rol')
        .setRequired(true)),
  async execute(interaction) {
    const roleReactions = JSON.parse(fs.readFileSync(roleReactionsPath))
    const embed = new EmbedBuilder()

    if (roleReactions[interaction.options.getRole('role').id]) {
      embed
        .setColor(0x2dc937)
        .setTitle('Autorol eliminado')
        .addFields(
          { name: 'Rol', value: `<@&${interaction.options.getRole('role').id}>` },
          { name: 'Emoji', value: roleReactions[interaction.options.getRole('role').id] }
        )

      delete roleReactions[interaction.options.getRole('role').id]
      fs.writeFileSync(roleReactionsPath, JSON.stringify(roleReactions))
    } else {
      embed
        .setColor(0xcc3232)
        .setTitle('Error')
        .setDescription('No se encontró el rol solicitado')
    }

    interaction.reply({ embeds: [embed] })
  }
}