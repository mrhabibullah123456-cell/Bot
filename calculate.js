const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calculate')
    .setDescription('Performs basic arithmetic operations')
    .addNumberOption(option =>
      option.setName('a')
        .setDescription('First number')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('b')
        .setDescription('Second number')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('operation')
        .setDescription('Operation to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Subtract', value: 'sub' },
          { name: 'Multiply', value: 'mul' },
          { name: 'Divide', value: 'div' }
        )),
  async execute(interaction) {
    const a = interaction.options.getNumber('a');
    const b = interaction.options.getNumber('b');
    const op = interaction.options.getString('operation');

    let result;
    switch (op) {
      case 'add': result = a + b; break;
      case 'sub': result = a - b; break;
      case 'mul': result = a * b; break;
      case 'div':
        if (b === 0) return interaction.reply('Error: Division by zero');
        result = a / b;
        break;
    }

    await interaction.reply(`Result: ${result}`);
  }
};
