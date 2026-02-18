#!/bin/bash
BOT_DIR="/home/discordbot"
LOG="$BOT_DIR/update.log"

echo "=== Update started: $(date) ===" | tee -a $LOG

# Pull latest changes
cd $BOT_DIR
git pull origin main | tee -a $LOG

# Install any new dependencies
npm install | tee -a $LOG

# Delete old commands, deploy new ones
echo "Deleting old commands..." | tee -a $LOG
node delete-commands.js | tee -a $LOG

echo "Deploying new commands..." | tee -a $LOG
node deploy-commands.js | tee -a $LOG

# Restart the bot
echo "Restarting bot..." | tee -a $LOG
bash $BOT_DIR/services/restart-bot.sh | tee -a $LOG

echo "=== Update complete: $(date) ===" | tee -a $LOG