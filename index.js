const fs = require('node:fs')
const path = require('node:path')
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js')
const { token } = process.env

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
] })

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))
eventFiles.forEach(file => {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
})

const commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
commandFiles.forEach(file => {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)

    commands.set(command.data.name, command)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return

    const command = commands.get(interaction.commandName)

    if (!command) return
    
    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error executing this command', ephemeral: true })
    }
})

client.once(Events.ClientReady, () => {
    console.log(`Ready! Logged in as ${client.user.tag}`)
})

client.login(token)