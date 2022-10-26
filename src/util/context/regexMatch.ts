import { Message } from 'discord.js';

const regex = '(?<!<)https?:\\/\\/(?:(?:canary|ptb)\\.)?discord(?:app)?\\.com\\/channels\\/(@me|\\d+)\\/(\\d+)\\/(\\d+)(?!>)';

export default function regexMatch(message: Message) {
   if (message.content.match(regex)) {
      return message.content.match(regex);
   }
}
