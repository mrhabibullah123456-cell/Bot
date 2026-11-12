const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const token = process.env.DISCORD_TOKEN?.trim();
const clientId = process.env.CLIENT_ID?.trim();
const guildId = process.env.GUILD_ID?.trim();

if (!token || /^(your_|<.*>)$/i.test(token)) {
  console.error(
    "❌ DISCORD_TOKEN is missing or still a placeholder. Add your bot token to the .env file."
  );
  process.exit(1);
}

if (!clientId || !/^\d+$/.test(clientId)) {
  console.error(
    "❌ CLIENT_ID is missing or invalid. Add your numeric Discord application ID to the .env file."
  );
  process.exit(1);
}

if (guildId && !/^\d+$/.test(guildId)) {
  console.error(
    "❌ GUILD_ID is invalid. Set it to your numeric server ID or leave it empty to deploy globally."
  );
  process.exit(1);
}

// 🚀 Initialize commands array
const commands = [];

// 📁 Load all command files
const commandsPath = path.join(__dirname, "commands");

console.log("🔄 Loading commands...");

// Function to recursively load commands from folders
function loadCommandsFromDirectory(dirPath) {
  const items = readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      // Recursively load commands from subdirectories
      loadCommandsFromDirectory(fullPath);
    } else if (item.isFile() && item.name.endsWith(".js")) {
      // Load command file
      try {
        const command = require(fullPath);

        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());

          // Determine category from folder structure
          const relativePath = path.relative(commandsPath, fullPath);
          const category =
            path.dirname(relativePath) === "."
              ? "root"
              : path.dirname(relativePath);

          console.log(`✅ Loaded: ${command.data.name} (${category})`);
        } else {
          console.log(
            `⚠️ Skipped: ${fullPath} (missing "data" or "execute" property)`
          );
        }
      } catch (error) {
        console.error(`❌ Error loading command ${fullPath}:`, error.message);
      }
    }
  }
}

// Load all commands
loadCommandsFromDirectory(commandsPath);

// 🌐 Initialize REST client
const rest = new REST().setToken(token);

// 🚀 Deploy commands
(async () => {
  try {
    console.log(
      `\n🚀 Started refreshing ${commands.length} application (/) commands.`
    );

    // Register new commands
    const data = guildId
      ? await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        )
      : await rest.put(Routes.applicationCommands(clientId), {
          body: commands,
        });

    console.log(
      `✅ Successfully reloaded ${data.length} application (/) commands.`
    );
    console.log(
      `📍 Deployment: ${
        guildId
          ? "Guild-specific (Development)"
          : "Global (Production)"
      }`
    );

    // 📋 List deployed commands
    console.log("\n📋 Deployed commands:");
    commands.forEach((cmd, index) => {
      console.log(`${index + 1}. /${cmd.name} - ${cmd.description}`);
    });

    console.log("\n🎉 Command deployment completed successfully!");
  } catch (error) {
    console.error("❌ Error deploying commands:", error);
    process.exitCode = 1;
  }
})();
