const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '607906404:AAFQIbx5VOIMencvhVgyMLd8Q1JGHbdGO28';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/get/, (msg, match) => {
	const chatId = msg.chat.id;
	const resp = match[1];

	const imgUrl = 'http://kinozal.tv/i/poster/7/6/1623676.jpg';
	bot.sendPhoto(chatId, imgUrl);
	bot.sendMessage(chatId, 'Tomb Raider: Лара Крофт / Tomb Raider / 2018 / Боевик, приключения\n' +
		'http://kinozal.tv/details.php?id=1623676');
//   bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  	const chatId = msg.chat.id;

//   const imgUrl = 'http://kinozal.tv/i/poster/7/6/1623676.jpg';
//   bot.sendPhoto(chatId, imgUrl);
//   bot.sendMessage(chatId, 'На, блядь!');
});