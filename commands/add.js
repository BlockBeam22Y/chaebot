const fs = require('node:fs')
const path = require('node:path')
const { SlashCommandBuilder, EmbedBuilder, Events } = require('discord.js')
const roleReactionsPath = path.join(__dirname, 'role-reactions.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Asigna un emoji a un rol')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Selecciona un rol')
                .setRequired(true)),
    async execute(interaction) {
        const roleReactions = JSON.parse(fs.readFileSync(roleReactionsPath))
        const embedAwait = new EmbedBuilder()
            .setColor(0xe7b416)
            .setTitle('Esperando respuesta...')
            .setDescription('Reacciona a este mensaje con el emoji que deseas asignar')

        const message = await interaction.reply({ embeds: [embedAwait], fetchReply: true })
        const embedResult = new EmbedBuilder()

        let timeout = setTimeout(() => {
            embedResult
                .setColor(0xcc3232)
                .setTitle('Error')
                .setDescription('Se tardó mucho en responder\nIntenta de nuevo')
            interaction.channel.send({ embeds: [embedResult] })
            message.delete()
        }, 30000)

        interaction.client.once(Events.MessageReactionAdd, (messageReaction, user) => {
            clearTimeout(timeout)
            message.delete()
            const roleId = interaction.options.getRole('role').id

            if (messageReaction.emoji.id) {
                embedResult
                    .setColor(0xcc3232)
                    .setTitle('Error')
                    .setDescription('Lo sentimos\nNo se admite emojis personalizados')
            } else {
                for (let emoji of Object.values(roleReactions)) {
                    if (emoji === messageReaction.emoji.name) {
                        embedResult
                            .setColor(0xcc3232)
                            .setTitle('Error')
                            .setDescription('Este emoji ya está en uso\nPrueba con otro')

                        interaction.channel.send({ embeds: [embedResult] })
                        return
                    }
                }

                if (roleReactions[roleId]) {
                    embedResult
                    .setColor(0x2dc937)
                    .setTitle('Emoji reemplazado')
                    .addFields(
                        { name: 'Rol', value: `<@&${roleId}>` },
                        { name: 'Emoji anterior', value: roleReactions[roleId] },
                        { name: 'Emoji actual', value: messageReaction.emoji.name }
                    )
                } else {
                    embedResult
                    .setColor(0x2dc937)
                    .setTitle('Autorol añadido')
                    .addFields(
                        { name: 'Rol', value: `<@&${roleId}>` },
                        { name: 'Emoji', value: messageReaction.emoji.name }
                    )
                }

                roleReactions[roleId] = messageReaction.emoji.name
                fs.writeFileSync(roleReactionsPath, JSON.stringify(roleReactions))
            }

            interaction.channel.send({ embeds: [embedResult] })
        })
    }
}