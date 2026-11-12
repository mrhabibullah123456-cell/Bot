console.log("🔄 Starting VAISH Bot...");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType,
  PresenceUpdateStatus,
} = require("discord.js");
const { readdirSync } = require("fs");
const path = require("path");
const Database = require("./utils/database");

const TaskScheduler = require("./utils/scheduler");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// 🚀 Create VAISH - Ultra Modern Discord Bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences, // For advanced user tracking
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember,
  ],
});

// 💎 Bot Configuration
client.commands = new Collection();
client.cooldowns = new Collection();

// 🎨 VAISH Brand Colors - Ultra Modern Design
client.colors = {
  primary: "#6366F1", // Indigo-500 - Modern primary
  secondary: "#8B5CF6", // Violet-500 - Rich secondary
  success: "#10B981", // Emerald-500 - Clean success
  error: "#EF4444", // Red-500 - Clear error
  warning: "#F59E0B", // Amber-500 - Attention warning
  info: "#3B82F6", // Blue-500 - Information
  dark: "#1F2937", // Gray-800 - Dark theme
  light: "#F9FAFB", // Gray-50 - Light theme
  accent: "#EC4899", // Pink-500 - Accent color
  gradient: {
    primary: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    error: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
  },
};

// 🤖 VAISH Bot Profile
client.profile = {
  name: "VAISH",
  version: "2.0.0",
  description: "Ultra-modern AI-powered Discord bot with advanced features",
  author: "VAISH Development Team",
  website: "https://VAISH-bot.com",
  github: "https://github.com/VAISH-bot/discord-bot",
  support: "https://discord.gg/VAISH-support",
  features: [
    "🤖 Advanced AI Assistant (Google Gemini)",
    "💎 Points & Rewards System",
    "📊 XP & Leveling with Role Rewards",
    "🎫 Professional Ticket System",
    "🛡️ Smart Moderation & Anti-Raid",
    "🎮 Interactive Games & Entertainment",
    "📈 Analytics & Server Insights",
    "⚡ Lightning-fast Performance",
  ],
  stats: {
    commands: 58,
    categories: 10,
    uptime: 0,
    servers: 0,
    users: 0,
  },
};

// 🗃️ Database singleton
let db;
let scheduler;

// 🔄 Dynamic Activity Status for VAISH
const activities = [
  { name: "🤖 AI Assistant | /aiassistant", type: ActivityType.Playing },
  { name: "💎 Points & Rewards | /points", type: ActivityType.Watching },
  { name: "🎫 Ticket Support | /ticket", type: ActivityType.Listening },
  { name: "📊 Server Analytics | /serverinfo", type: ActivityType.Watching },
  { name: "🎮 Fun Games | /8ball", type: ActivityType.Playing },
  { name: "🛡️ Smart Moderation | /antiraid", type: ActivityType.Watching },
  { name: "⚡ 58 Commands Available | /help", type: ActivityType.Playing },
];

let currentActivity = 0;

// 🎯 Initialize Database Connection
async function initializeDatabase() {
  try {
    db = await Database.getInstance();
    console.log("🗃️ VAISH Database initialized successfully");

    // Update bot stats
    client.profile.stats.uptime = Date.now();

    return db;
  } catch (error) {
    console.error("❌ VAISH Database initialization failed:", error);
    process.exit(1);
  }
}

// 📁 Dynamic Command Loader
function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");

  function loadCommandsFromDir(dir) {
    const items = readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        loadCommandsFromDir(itemPath);
      } else if (item.name.endsWith(".js")) {
        try {
          const command = require(itemPath);

          if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ VAISH loaded: /${command.data.name}`);
          } else {
            console.log(`⚠️ Invalid command structure: ${itemPath}`);
          }
        } catch (error) {
          console.error(`❌ Failed to load command: ${itemPath}`, error);
        }
      }
    }
  }

  loadCommandsFromDir(commandsPath);
  console.log(`🎯 VAISH loaded ${client.commands.size} commands successfully`);
}

// 🎭 Dynamic Event Loader
function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = readdirSync(eventsPath).filter(
    (file) =>
      file.endsWith(".js") && !["helpInteraction.js", "modalCreate.js"].includes(file)
  );

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);

    try {
      const event = require(filePath);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`🎪 VAISH event loaded: ${event.name}`);
    } catch (error) {
      console.error(`❌ Failed to load event: ${filePath}`, error);
    }
  }
}

// 🚀 VAISH Startup Sequence
client.once("ready", async () => {
  updateBotActivity();

  console.log("⏳ Connecting to MongoDB...");
  await initializeDatabase();

  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                    🤖 VAISH BOT ONLINE 🤖                     ║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  Name: ${client.user.tag.padEnd(49)} ║
  ║  ID: ${client.user.id.padEnd(51)} ║  
  ║  Servers: ${client.guilds.cache.size.toString().padEnd(47)} ║
  ║  Users: ${client.guilds.cache
    .reduce((a, g) => a + g.memberCount, 0)
    .toString()
    .padEnd(49)} ║
  ║  Commands: ${client.commands.size.toString().padEnd(46)} ║
  ║  Latency: ${client.ws.ping.toString().padEnd(47)} ms║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  🚀 Ultra-Modern AI-Powered Discord Bot                      ║
  ║  💎 Advanced Features • ⚡ Lightning Fast • 🛡️ Secure        ║
  ║  🌟 Open Source • 📊 Analytics • 🎮 Entertainment            ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);

  // Initialize core systems
  if (!scheduler) {
    scheduler = new TaskScheduler(client);
    console.log("⏰ VAISH Task Scheduler initialized");
  }

  // Update bot stats
  client.profile.stats.servers = client.guilds.cache.size;
  client.profile.stats.users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

  // Rotate activity status every 30 seconds
  setInterval(updateBotActivity, 30000);

  console.log("🎯 VAISH is fully operational and ready to serve!");
});

// 🔄 Update Bot Activity Status
function updateBotActivity() {
  const activity = activities[currentActivity];

  client.user.setPresence({
    activities: [activity],
    status: PresenceUpdateStatus.DoNotDisturb,
  });

  currentActivity = (currentActivity + 1) % activities.length;
}

// 🛡️ Advanced Error Handling
process.on("unhandledRejection", (error, promise) => {
  console.error("❌ Unhandled Promise Rejection:", error);
  console.error("Promise:", promise);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  console.error("Stack:", error.stack);

  // Graceful shutdown
  setTimeout(() => {
    console.log("🔄 VAISH is restarting due to critical error...");
    process.exit(1);
  }, 5000);
});

// 🎯 Graceful Shutdown Handler
process.on("SIGINT", async () => {
  console.log("\n🛑 VAISH shutdown initiated...");

  try {
    if (db) {
      await db.close();
      console.log("🗃️ Database connection closed");
    }

    client.destroy();
    console.log("🤖 VAISH client destroyed");

    console.log("✅ VAISH shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// 🚀 Initialize VAISH Bot
async function startVAISH() {
  try {
    const token = process.env.DISCORD_TOKEN?.trim();
    if (!token) {
      throw new Error(
        "DISCORD_TOKEN is missing. Create a .env file in the project folder and add your bot token."
      );
    }

    // Load commands and events
    loadCommands();
    loadEvents();

    // Login to Discord
    console.log("🔌 Connecting to Discord...");
    await client.login(token);
  } catch (error) {
    console.error("❌ Failed to start VAISH Bot:", error);
    console.log("🔑 Please check your DISCORD_TOKEN in the .env file");
    console.log("💡 Ensure your bot token is valid and has proper permissions");
    process.exit(1);
  }
}

// <<<<<<< HEAD
// =======

// >>>>>>> 32cde73
// // 🌐 Minimal Express server to keep Render web service alive
// const express = require("express");
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("🟢 VAISH is alive and running!");
// });

// app.listen(PORT, () => {
//   console.log(`🌐 Web server running on port ${PORT}`);
// });
// 🎬 Start the show!
startVAISH();
