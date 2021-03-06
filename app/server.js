/* some basic code and inspiration taken from https://github.com/dartmouth-cs52/slackattack
and https://github.com/howdyai/botkit/blob/master/readme-slack.md#slack-specific-events
thank you! */

import botkit from 'botkit';

// yelp setup
const Yelp = require('yelp');
const yelp = new Yelp({
  consumer_key: '-_1KpAEOaNwru8fE66TbcQ',
  consumer_secret: 'bFkWcgL0_03XeMdBPmd4_suW5Ck',
  token: 'wEHDFLc4Mw9OUYgG9CoA1NH2Q4hLyjN_',
  token_secret: 'uuUPP1-W01p0igV0NngEBNMd8qU',
});

// write to console that bot is starting
console.log('starting bot');

// botkit controller
const controller = botkit.slackbot({
  debug: false,
});

// initialize slackbot
const slackbot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN,
  // this grabs the slack token we exported earlier
}).startRTM(err => {
  // start the real time message client
  if (err) { throw new Error(err); }
});

// prepare webhook
// for now we won't use this but feel free to look up slack webhooks
controller.setupWebserver(process.env.PORT || 3001, (err, webserver) => {
  controller.createWebhookEndpoints(webserver, slackbot, () => {
    if (err) { throw new Error(err); }
  });
});

// response for food
controller.hears(['hungry'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  yelp.search({ term: 'food', location: '03755' })
      .then((data) => {
        bot.reply(message, 'Here are some options!');
        data.businesses.forEach(business => {
          bot.reply(message, {
            'attachments': [
              {
                'title': business.name,
                'image_url': business.image_url,
                'text': business.snippet_text,
                'color': '#7CD197',
              },
            ],
          });
        });
      });
});

// response to hello
controller.hears(['hello', 'hi', 'hey', 'howdy'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (res) {
      bot.reply(message, `Hello, ${res.user.profile.first_name}!`);
    } else {
      bot.reply(message, 'Hello there!');
    }
  });
});
controller.hears(['help'], ['direct_message'], (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    bot.reply(message, 'Tell me you\'re hungry and I\'ll tell you where to eat!');
  });
});

controller.hears(['hello world'], 'message_received', (bot, message) => {
  // start a conversation to handle this response.
  bot.startConversation(message, (err, convo) => {
    convo.say('Hello!');
    convo.say('Have a nice day!');
  });
});

// reply to a direct mention - @bot hello
controller.on('direct_mention', (bot, message) => {
  // reply to _message_ by using the _bot_ object
  bot.reply(message, 'Thanks for mentioning me!');
});

// reply to a direct message
controller.on('direct_message', (bot, message) => {
  // reply to _message_ by using the _bot_ object
  bot.reply(message, 'What are you talking about? Tell me you\'re hungry and I\'ll tell you where to eat!');
});

// response to outgoing webhook
controller.on('outgoing_webhook', (bot, message) => {
  bot.replyPublic(message, 'Good morning!');
  bot.reply(message, 'Good morning!');
});
