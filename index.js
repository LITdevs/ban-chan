require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] });
const strings = require("./strings.json");
const mongoose = require("mongoose");
let GuildMap = {};

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.content === "bc:here") {
        await message.delete();
        message.channel.send(strings.CHANNEL_MESSAGE.replace("[USER_PING]", "no one").replace("[TIMESTAMP", "yet"));
    } else {
        /*await message.delete();
        const nanoMessage = (await message.channel.messages.fetch({ limit: 1 })).first();*/
    }
});

mongoose.connect(process.env.MONGODB_URL);
client.login(process.env.DISCORD_TOKEN);