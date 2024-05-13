require('dotenv').config();
const { Client, Events, GatewayIntentBits, time, TimestampStyles } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent ] });
const strings = require("./strings.json");

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const banningChannel = client.channels.cache.get(strings.BANNING_CHANNEL);
    const nanoMessage = (await banningChannel.messages.fetch({ limit: 1 })).first();
    if(!nanoMessage || nanoMessage.author.id !== client.user.id) banningChannel.send(strings.CHANNEL_MESSAGE.replace("[USER_PING]", "no one").replace("[TIMESTAMP]", "yet"));

    const rulesChannel = client.channels.cache.get(strings.RULES_CHANNEL);
    const rulesMessage = await rulesChannel.messages.fetch(strings.RULES_MESSAGE);
    const collectorFilter = (reaction, user) => {
        console.log(reaction)
        return reaction.emoji.name === strings.TRAP_REACTION
    };
    const collector = rulesMessage.createReactionCollector({ filter: collectorFilter });
    collector.on("collect", (_reaction, user) => {
        treatUser(user, rulesChannel.guild, "REACTION")
    })
});

client.on("messageCreate", async (message) => {
    if (message.author.id === client.user.id) return;
    if (message.channel.id === strings.BANNING_CHANNEL) {
        await message.delete();
        if(message.author.bot) return;

        treatUser(message.author, message.guild, "MESSAGE")
    }
});

async function treatUser(user, guild, type) {
    const announcementChannel = client.channels.cache.get(strings.ANNOUNCEMENT_CHANNEL);
    const banningChannel = client.channels.cache.get(strings.BANNING_CHANNEL);

    const nanoMessage = (await banningChannel.messages.fetch({ limit: 1 })).first();
    if(!nanoMessage || nanoMessage.author.id !== client.user.id) {
        banningChannel.send(strings.CHANNEL_MESSAGE.replace("[USER_PING]", `<@${user.id}>`).replace("[TIMESTAMP]", time(new Date(), TimestampStyles.RelativeTime)));
    } else {
        nanoMessage.edit(strings.CHANNEL_MESSAGE.replace("[USER_PING]", `<@${user.id}>`).replace("[TIMESTAMP]", time(new Date(), TimestampStyles.RelativeTime)));
    }

    await user.send(strings.DIRECT_MESSAGE.replace("[SERVER_NAME]", guild.name))
    await guild.members.ban(user.id, {deleteMessageSeconds: type === "MESSAGE" ? 900 : 0, reason: strings[`GUILD_LOG_${type}`]})
    await guild.members.unban(user.id, strings[`GUILD_LOG_${type}`])

    await announcementChannel.send(strings[`ANNOUNCEMENT_${type}`].replace("[USER_PING]", `<@${user.id}>`))
}

client.login(process.env.DISCORD_TOKEN);