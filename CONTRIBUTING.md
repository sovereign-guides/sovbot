# Contributing
We <3 corrections and improvements

---

### Prerequisites
- [Node.js](https://nodejs.org/en/) 16.9 or newer.
- Yarn: `npm install --global yarn`
- [Docker](https://docs.docker.com/)
- A Discord [bot application](https://discord.com/developers/applications/).

---

### Local development

1. Clone the repo with `git clone git@github.com:zayKenyon/sovbot.git`

2. Enter the 'src' directory and rename `config.json.example` to `config.json` and fill in the values. 

3. Run `pm2 start ecosystem.config.js` to start the bot service.

(Assuming you're in the root directory)

`📝` When updating, you can use the `bash update.sh` script.

`📝` View logs with `pm2 logs ecosystem.config.js`

---

### Linting

Remember to always lint your edits/additions before making a commit to ensure everything's lined up and consistent with
the rest of the bot. I use ESLint and have a package.json script for linting JS files.

```bash
yarn run lint
```
