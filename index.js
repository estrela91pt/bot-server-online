require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Gamedig = require('gamedig');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const SERVER_IP = '185.125.205.111';
const SERVER_PORT = 2303;

function getRandomFakeBoost(min = 0, max = 0) {
  return Math.floor(Math.random() * (max - min + 0)) + min;
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
  } catch (error) {
    client.user.setActivity('🔴 Server Offline', { type: 3 });
    console.log(`[ERROR] Server offline or unreachable.`);
  }
}

client.once('ready', () => {
  console.log(`Bot online as ${client.user.tag}`);
  updateStatus();
  setInterval(updateStatus, 5 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);

