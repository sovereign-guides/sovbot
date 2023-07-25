
# SovBot

![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/sovereign-guides/sovbot/discord.js?logo=Discord&logoColor=f6f6f6&style=flat-square)
[![wakatime](https://wakatime.com/badge/github/sovereign-guides/sovbot.svg?style=flat-square)](https://wakatime.com/badge/github/sovereign-guides/sovbot)

This is the source code for [SovBot#9299](https://discord.com/users/1000927602518798487). It is completely written by me,
[@zayKenyon](https://discord.com/users/452793411401940995).

---

## Current features:

- [Member verification](src/modules/automod/events/rulesScreeningVerification.js): Greets members once they've verified!

- [Post on Patch](src/modules/automod/events/postOnPatch.js): Creates a discussion post in a Forum!

- [Publish Premium VODs](src/modules/meta/commands/post.js): Posts and tags a premium video, pushes the video's Id into an AutoMod list.

- [Prune Unverified Members](src/modules/automod/commands/prune.js): Removes members that have yet to be verified after 3 weeks of being in the server.

- [AutoMod Link Restrictions](src/modules/automod/events/watchThisLinkPerms.js): Tells ineligible users why their message did not get sent in the #watch-this channel.

---

## Contributing

If you're interested in contributing to SovBot, you should check out my
[GitHub Projects](https://github.com/sovereign-guides/sovbot/projects) page or 
[open issues](https://github.com/sovereign-guides/sovbot/issues). There's a
[contribution guide](https://github.com/sovereign-guides/sovbot/blob/main/CONTRIBUTING.md) you should read once you decide on
what you want to contribute.
