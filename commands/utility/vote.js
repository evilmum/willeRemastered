const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Create votes and evaluate them by peoples reactions.')
        .addStringOption(option => option.setName('question').setDescription('What you want to vote for.').setRequired(true))
        .addStringOption(option => option.setName('option_1').setDescription('First Option'))
        .addStringOption(option => option.setName('option_2').setDescription('Second Option'))
        .addStringOption(option => option.setName('option_3').setDescription('Third Option'))
        .addStringOption(option => option.setName('option_4').setDescription('Fourth Option'))
        .addStringOption(option => option.setName('option_5').setDescription('Fifth Option'))
        .addStringOption(option => option.setName('option_6').setDescription('Sixth Option'))
        .addStringOption(option => option.setName('option_7').setDescription('Seventh Option'))
        .addStringOption(option => option.setName('option_8').setDescription('Eighth Option'))
        .addStringOption(option => option.setName('option_9').setDescription('Ninth Option'))
        .addStringOption(option => option.setName('option_10').setDescription('Tenth Option'))
        .addNumberOption(option =>
            option.setName('timer')
                .setDescription('Time in minutes until the vote closes.')
                .setMinValue(1)
                .setMaxValue(1440)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const options = [];

        let reply = '**A vote was started!**';
        let timer = interaction.options.getNumber('timer');
        let reactions = ['👍', '👎'];
        let remainingTime = {
            hours: 0,
            minutes: 0,
            value: '00:00'
        }

        for (let cx = 0; cx < 10; cx++) {
            const option = interaction.options.getString(`option_${cx + 1}`);
            if (option) options.push(option);
        }

        if (!timer) timer = 1440;

        remainingTime.minutes = timer % 60;
        remainingTime.hours = (timer - remainingTime.minutes) / 60;
        remainingTime.value = `${remainingTime.hours < 10 ? '0' : ''}${remainingTime.hours.toString()}h ${remainingTime.minutes < 10 ? '0' : ''}${remainingTime.minutes.toString()}min`

        reply += ` | *Time: ${remainingTime.value}*\n----------`;
        reply += `\n${question}\n`;

        reactions = [];

        for (let i = 0; i < options.length; i++) {
            reply += `\n${numbers[i]} : ${options[i]}\n`;
            reactions.push(numbers[i]);
        }

        reply += '----------';

        await interaction.reply(reply).catch(error => console.error(error));

        const vote = await interaction.fetchReply();

        reactions.push('🔒');

        for (let j = 0; j < reactions.length; j++) {
            await vote.react(reactions[j]).catch(error => console.error(error));
        }

        const filter = (reaction, user) => {
            return user.id !== vote.author.id;
        };

        const collector = vote.createReactionCollector({
            filter: filter,
            time: timer > 0 ? timer * 60000 : 86400000
        });

        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name === '🔒') {
                if (user.id === interaction.user.id) {
                    collector.stop('Canceled by Author');
                } else {
                    reaction.users.remove(user).catch(error => console.error(error));
                }
            }
        });

        collector.on('create', reaction => {
            reaction.remove().catch(error => console.error(error));
        })

        collector.on('end', collected => {
            let edit = '**The vote was completed!**\n----------';
            let reaction;
            let collectedReaction;
            let reactionCount;
            let highestCount = 0;
            let result = [];

            reactions.pop();

            for (let k = 0; k < reactions.length; k++) {
                reaction = reactions[k];
                collectedReaction = collected.get(reaction);
                reactionCount = collectedReaction ? collectedReaction.count - 1 : 0;

                result.push({
                    reaction: reaction,
                    reactionCount: reactionCount
                });

                if (reactionCount > highestCount) {
                    highestCount = reactionCount;
                }
            }

            if (options.length === 1) {
                if (result[0].reactionCount > result[1].reactionCount) {
                    edit += '\n✅ | ';
                } else {
                    edit += '\n❎ | ';
                }

                edit += `${options[0]}\n`;
            } else {
                for (let l = 0; l < result.length; l++) {
                    if (result[l].reactionCount === highestCount && highestCount !== 0) {
                        edit += '\n✅ | ';
                    } else {
                        edit += '\n❎ | ';
                    }
                    edit += `${numbers[l]} : ${options[l]}\n`;
                }
            }

            edit += '----------\n';


            for (let m = 0; m < result.length; m++) {
                edit += `${result[m].reaction} : ${result[m].reactionCount}`

                if (m < result.length - 1) {
                    edit += ' | ';
                }
            }

            vote.reactions.removeAll().catch(error => console.error(error));
            vote.edit(edit).catch(error => console.error(error));
        });
    }
};