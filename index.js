require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Gamedig = require('gamedig');
const express = require('express');
const app = express();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const SERVER_IP = '185.125.205.111';
const SERVER_PORT = 2303;

let wasServerOnline = false; // previous server status

const STATUS_CHANNEL_ID = '1400925423499477115'; // 👈 Replace with the ID of your Discord channel

function getRandomFakeBoost(min = 1, max = 2) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function updateStatus() {
  try {
    const state = await Gamedig.query({
      type: 'dayz',
      host: SERVER_IP,
      port: SERVER_PORT,
    });

    const realPlayers = state.players.length;
    const maxPlayers = state.maxplayers;
    const fakeBoost = getRandomFakeBoost();
    const displayedPlayers = Math.min(realPlayers + fakeBoost, maxPlayers);

    client.user.setActivity(`🟢 ${displayedPlayers}/${maxPlayers} Playing Contagion X`, {
      type: 0,
    });

    console.log(`[UPDATED] Real: ${realPlayers}, Fake: +${fakeBoost} → Displayed: ${displayedPlayers}/${maxPlayers}`);

    // ✅ Detect if the server was previously offline and is now online
    if (!wasServerOnline) {
      wasServerOnline = true;
      const channel = await client.channels.fetch(STATUS_CHANNEL_ID);
      if (channel) {
        channel.send(' <@&1392542033570173100>🟢 **Contagion X** server is now online!');
      }
    }
  } catch (error) {
    client.user.setActivity('🔴 Server Offline', { type: 3 });
    console.log(`[ERROR] Server offline or unreachable.`);
    wasServerOnline = false; // mark as offline so next online status triggers alert
  }
}

client.once('ready', () => {
  console.log(`Bot online as ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5 * 60 * 1000); // update every 5 minutes
});

client.login(process.env.DISCORD_TOKEN);

// Web server to keep the bot alive (for platforms like Render)
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server for keep-alive is running.');
});
