const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./handlers/eventHandler");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();
client.subCommands = new Collection();

loadEvents(client);

client.login(client.config.token);
