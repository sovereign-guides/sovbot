# Contributing

### Prerequisites
- Yarn: `npm install --global yarn`
- [Node.js](https://nodejs.org/en/) 16.9 or newer.
- A Discord [bot application](https://discord.com/developers/applications/).

## Local development

Clone the repo and install dependencies.
```bash
git clone https://github.com/zayKenyon/sovbot.git
yarn install
```
Rename `config.json.example` to `config.json` and fill in the values. `GuildId` isn't strictly necessary, but it's
useful for testing purposes.

You can use `yarn run start` to deploy commands & run the bot.

### Linting

Remember to always lint your edits/additions before making a commit to ensure everything's lined up and consistent with
the rest of the bot. I use ESLint and have a package.json script for linting JS files.

```bash
yarn run lint
```
