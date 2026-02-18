#!/bin/bash
pkill -f "node index.js"
sleep 2
cd /home/discordbot
node index.js >> /home/pi/bot/bot.log 2>&1 &