const fs = require('node:fs')
const path = require('node:path')
const { SlashCommandBuilder, EmbedBuilder, Events } = require('discord.js')
const roleReactionsPath = path.join(__dirname, 'role-reactions.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display')
        .setDescription('Envía el mensaje con los emojis respectivos')
        .addStringOption(option =>
            option
                .setName('header')
                .setDescription('Añade un encabezado')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('description')
                .setDescription('Añade una descripción')
                .setRequired(true)),
    async execute(interaction) {
        const roleReactions = JSON.parse(fs.readFileSync(roleReactionsPath))

        const embed = new EmbedBuilder()
            .setColor(0x224fb1)
            .setTitle(interaction.options.getString('header'))
            .setDescription(`${interaction.options.getString('description')}\n${
                Object.keys(roleReactions)
                    .map(roleId => `${roleReactions[roleId]} <@&${roleId}>`)
                    .join('\n')
            }`)

        const roleReactionsMessage = await interaction.reply({ embeds: [embed], fetchReply: true })

        for (let roleId in roleReactions) {
            roleReactionsMessage.react(roleReactions[roleId])
        }

        interaction.client.on(Events.MessageReactionAdd, (messageReaction, user) => {
            if (messageReaction.message.id !== roleReactionsMessage.id) return

            if (interaction.client.user === user) return

            for (let roleId in roleReactions) {
                if (roleReactions[roleId] === messageReaction.emoji.name) {
                    const reactionMember = interaction.guild.members.cache.find(member => member.user === user)
                    reactionMember.roles.add(roleId)

                    roleReactionsMessage.reactions.cache.forEach(reaction => {
                        if (reaction.emoji !== messageReaction.emoji) {
                            reaction.users.remove(user)
                        }
                    })                    

                    return
                }
            }

            messageReaction.remove()
        })

        interaction.client.on(Events.MessageReactionRemove, (messageReaction, user) => {
            if (messageReaction.message.id !== roleReactionsMessage.id) return

            for (let roleId in roleReactions) {
                if (roleReactions[roleId] === messageReaction.emoji.name) {
                    const reactionMember = interaction.guild.members.cache.find(member => member.user === user)
                    reactionMember.roles.remove(roleId)

                    return
                }
            }
        })
    }
}