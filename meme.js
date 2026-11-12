const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("😂 Get a random meme to brighten your day")
    .addStringOption(option =>
      option
        .setName("subreddit")
        .setDescription("Subreddit to fetch meme from (optional)")
        .setRequired(false)
    ),
  cooldown: 5,

  async execute(interaction, client) {
    await interaction.deferReply();
    const subredditInput = interaction.options.getString("subreddit");
    let memeSources = [];

    if (subredditInput) {
      const safeSub = subredditInput.trim().replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      if (!safeSub) {
        return interaction.editReply("❌ Invalid subreddit name.");
      }
      memeSources.push(`https://www.reddit.com/r/${safeSub}/hot.json?limit=50`);
    } else {
      memeSources = [
        "https://www.reddit.com/r/memes/hot.json?limit=50",
        "https://www.reddit.com/r/wholesomememes/hot.json?limit=50",
        "https://www.reddit.com/r/dankmemes/hot.json?limit=50",
      ];
    }

    let memeData = null;

    for (const source of memeSources) {
      console.log(`Trying source: ${source}`);
      try {
        const response = await axios.get(source, {
          headers: { "User-Agent": "DiscordBot/1.0" },
          timeout: 5000,
        });

        if (
          response.data &&
          response.data.data &&
          response.data.data.children
        ) {
          const posts = response.data.data.children.filter(
            (post) =>
              !post.data.over_18 &&
              (post.data.url.endsWith(".jpg") ||
                post.data.url.endsWith(".png") ||
                post.data.url.endsWith(".gif"))
          );
          console.log(`📦 ${posts.length} meme(s) found in ${source}`);

          if (posts.length > 0) {
            memeData = posts[Math.floor(Math.random() * posts.length)].data;
            break;
          }
        }
      } catch (e) {
        console.log(`❌ Failed to fetch from ${source}: ${e.message}`);
        continue;
      }
    }

    if (memeData) {
      return this.sendMeme(interaction, client, memeData); // ✅ Stop here
    }

    // ❗ If no meme found from Reddit, use fallback
    console.log("⚠️ No Reddit memes found, using fallback.");
    const fallbackMemes = [
      {
        title: "When your code works on the first try",
        url: "https://i.imgur.com/dVDJiez.jpg",
        author: "NovaBot",
      },
      {
        title: "Me debugging at 3 AM",
        url: "https://i.imgur.com/L5GInIF.jpg",
        author: "NovaBot",
      },
      {
        title: "Discord bots be like",
        url: "https://i.imgur.com/xvjQj7B.jpg",
        author: "NovaBot",
      },
    ];

    const randomMeme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
    return this.sendMeme(interaction, client, randomMeme, true);
  },

  async sendMeme(interaction, client, memeData, isFallback = false) {
    const memeEmbed = new EmbedBuilder()
      .setColor(client.colors?.warning || 0xf9a825)
      .setTitle(`😂 ${memeData.title}`)
      .setImage(memeData.url || memeData.image)
      .addFields(
        {
          name: "👤 Posted by",
          value: `u/${memeData.author}`,
          inline: true,
        },
        {
          name: "⬆️ Upvotes",
          value: `${memeData.ups || "N/A"}`,
          inline: true,
        },
        {
          name: "💬 Comments",
          value: `${memeData.num_comments || "N/A"}`,
          inline: true,
        }
      )
      .setFooter({
        text: `${
          isFallback ? "Curated by NovaBot" : "Fresh from Reddit"
        } • Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (!isFallback && memeData.permalink) {
      memeEmbed.setURL(`https://reddit.com${memeData.permalink}`);
    }

    await interaction.editReply({ embeds: [memeEmbed] });
  },
};