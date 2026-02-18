#!/bin/bash
pkill -f "node index.js"
sleep 2
cd /home/discordbot && /usr/bin/node index.js >> /home/discordbot/bot.log 2>&1 &
