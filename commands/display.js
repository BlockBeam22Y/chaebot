const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display')
        .setDescription('...'),
    async execute(interaction) {
        await interaction.reply({ content: 'Test reply', ephemeral: true })
    }
}