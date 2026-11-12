<div align="center">

# 📚 VAISH Bot Slash Command Documentation

Welcome to the official command reference for **VAISH**, the open-source Discord bot!  
This document outlines all available slash commands, organized by category.

---

## 💰 Economy Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/bal [user]` | Check your wallet and bank balance. | `/bal` |
| `/buy <item>` | Buy a role or 30-day command access from the shop. | `/buy item:Command Access (30 days)` |
| `/coinflip <opponent> <bet> <choice>` | Challenge another player to match your coin bet. | `/coinflip @user 100 heads` |
| `/collect` | Collect income from your purchased roles. | `/collect` |
| `/deposit <amount \| all>` | Deposit coins into the bank. | `/deposit all` |
| `/diceroll <bet> <number>` | Roll a die and bet on a number. | `/diceroll 50 4` |
| `/economy-setup [options]` | Configure economy settings (Admin Only). | `/economy-setup` |
| `/give <recipient> <amount>` | Give coins to another user. | `/give @user 100` |
| `/leaderboard` | Shows top 10 richest users. | `/leaderboard` |
| `/shop` | Display roles and the command access pass available for purchase. | `/shop` |
| `/shop-admin <subcommand> [options]` | Manage the role shop (Admin Only). | `/shop-admin add PremiumRole` |
| `/steal <victim>` | Attempt to steal coins (risky). | `/steal @user` |
| `/withdraw <amount \| all>` | Withdraw coins into your wallet. | `/withdraw 200` |
| `/work` | Work to earn coins. | `/work` |

The **Command Access (30 days)** pass costs **10,000 coins** and unlocks regular bot slash commands for 30 days. `/shop`, `/buy`, `/work`, `/bal`, `/wallet`, `/help`, and administrator commands remain available without a pass. Buying another pass extends the current expiry by 30 days. Users can earn coins with `/work` or ask an administrator to add coins with `/add-coins`.

---

## 🎉 Fun Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/8ball <question>` | Ask the magic 8-ball a question. | `/8ball Will I win?` |
| `/avatar [user]` | Display a user's avatar. | `/avatar @user` |
| `/meme [subreddit]` | Get a random meme. | `/meme` |
| `/poll <question> <options>` | Create an emoji poll. | `/poll "Best fruit?" apples, bananas, oranges` |
| `/reminder <time> <message>` | Set a reminder. | `/reminder 1h Take a break` |
| `/roll <dice>` | Roll dice (e.g., 2d20). | `/roll 2d6` |
| `/secret` | Discover an easter egg. | `/secret` |

---

## ⚙️ General Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/banner` | Display server banner. | `/banner` |
| `/birthday <subcommand>` | Manage birthdays. | `/birthday set 1990-01-01` |
| `/botstats` | Bot performance statistics. | `/botstats` |
| `/calculate <expression>` | Perform arithmetic. | `/calculate 5 + 7` |
| `/dm <message>` | Send yourself a DM. | `/dm Remember the meeting!` |
| `/feedback` | Submit feedback. | `/feedback This bot is awesome!` |
| `/help` | List bot commands. | `/help` |
| `/joindate [user]` | When did a user join? | `/joindate @user` |
| `/ping` | Bot and API latency. | `/ping` |
| `/resetnick` | Reset your nickname. | `/resetnick` |
| `/reverse <text>` | Reverse a message. | `/reverse hello` |
| `/serverinfo` | Display server info. | `/serverinfo` |
| `/setnick <nickname>` | Change your nickname. | `/setnick Hero` |
| `/spoiler <text>` | Hide text as spoiler. | `/spoiler Darth Vader is Luke's father` |
| `/uptime` | Bot uptime info. | `/uptime` |
| `/userinfo [user]` | Detailed user info. | `/userinfo @user` |

---

## 🛡️ Moderation Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/ban <user> [reason]` | Ban a user. | `/ban @user spamming` |
| `/kick <user> [reason]` | Kick a user. | `/kick @user offensive language` |
| `/purge <amount> [user]` | Bulk delete messages. | `/purge 50` |
| `/ticket <title> <description>` | Create a support ticket. | `/ticket "Bug Report" "Feature not working"` |
| `/ticketdashboard <subcommand>` | Manage tickets (Mods Only). | `/ticketdashboard list` |

---

## 📈 XP & Leveling Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/daily` | Claim daily reward. | `/daily` |
| `/points <subcommand>` | Manage/view points. | `/points view` |
| `/profile [user]` | View profile and stats. | `/profile @user` |
| `/roles <subcommand>` | View or claim role rewards. | `/roles claim` |
| `/xpconfig <subcommand>` | XP/leveling config (Admin Only). | `/xpconfig set multiplier 2x` |

---

## 🤖 Other Commands

| Command | Description | Usage |
|--------|-------------|-------|
| `/aiassistant ask <question>` | Ask the AI anything. | `/aiassistant ask What's the weather?` |
| `/antiraid <subcommand>` | Manage anti-raid system. | `/antiraid enable` |
| `/truthordare <subcommand>` | Play Truth or Dare. | `/truthordare start` |

</div>