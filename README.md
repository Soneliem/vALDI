<p align="center">
  <a href="https://github.com/Soneliem/vALDI">
    <img src="assets/logo.png" alt="Logo" width="90" height="90">
  </a>
</p>
<h3 align="center">vALDI - a Valorant store checker</h3>
<h1 align="center"><a href="https://valdi.sonel.dev">valdi.sonel.dev </a></h1>

  <p align="center">
    A cross-platform web and mobile app to view your valorant store</p>
    <p align="center">
    <a href="https://discord.gg/X7CYCeZSRK">
      <img alt="Discord" src="https://img.shields.io/discord/881790284613185546?color=blue&label=discord&logo=discord">
    </a>
    <img alt="Website" src="https://img.shields.io/website?url=https%3A%2F%2Fvaldi.sonel.dev&logo=vue.js">
    <img alt="Vercel" src="https://therealsujitk-vercel-badge.vercel.app/?app=valdi-soneliem&logo=true">
    <img alt="CodeQL" src="https://github.com/Soneliem/vALDI/actions/workflows/codeql.yml/badge.svg">
    <img alt="Play Store" src="https://img.shields.io/endpoint?url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Ddev.sonel.valdi%26l%3DAndroid%26m%3D%24version&logo=google-play">
  <br />

![Screenshot](assets/main.png)

## About The Project

A simple cross-platform web and mobile app to view your Valorant store. Created by Soneliem.

Name derived from my favourite grocery store that overworks and understaffs its workers.

### Download

|Android|Android (APK)|Web|
|:-----:|:-----------:|:---:|
|<a href="https://play.google.com/store/apps/details?id=dev.sonel.valdi&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" width="200px"/></a>|<a href="https://github.com/Soneliem/vALDI/releases"><img src="assets/github.png" width="75px"/></a>|<a href="https://valdi.sonel.dev"><img src="assets/logo.png" width="75px"/></a>|

### Current Features

<div class="table2"></div>

|View Store|Fun Reveal Mechanic*|Wishlist|
|:---:|:---:|:---:|
|![store](assets/main.png)|![reveal](assets/reveal.png)|![wishlist](assets/wishlist.png)|

<div class="table3"></div>

|Daily Store Notifications|View Bundles|Mobile App|
|:---:|:---:|:---:|
|![daily](assets/daily.png)|![bundle](assets/bundle.png)|![app](assets/mobile.png)|

#### Other features

- [x] MFA Support
- [x] Published to Play Store

#### Planned Features

- [ ] Night Market
- [ ] Multi Account Support

*Fun is subjective

## FAQ

### Are my credentials stored on servers?

By default your access tokens (NOT username and password) are stored on your own device's browser. If the wishlist feature or daily notifications are enabled, your access tokens are stored on the server. This is to allow for the wishlist feature and daily notifications to work. You can disable these features at any time to remove your access tokens from the server.

## Tech Stack

**Client:** Ionic + Vite + Vue + Typescript >
Deployed on web with [Vercel](https://vercel.com)

**Server:** NodeJS + Express 5 > Deployed on [Qoddi](https://qoddi.com/)

Thank you to [Qoddi](https://qoddi.com/) for providing free hosting this project

## Why?

Making a store checker is a rite of passage for any Valorant App Dev. I am simply following the tradition. I also wanted to learn more about Ionic and the Android app deployment, so this was a good opportunity to do so. Is there are any questionable design decisions in my code of stack, this is why, I am simply experimenting.

## Run Locally

Clone the project

```bash
  git clone https://github.com/Soneliem/vALDI.git
```

Install dependencies

```bash
  yarn
```

This repo is a Yarn workspace (monorepo), so you can also run the server and client separately if you need to

```bash
  yarn run backend
  yarn run frontend
```

## Contributing

Contributions are always welcome! Please use the `development` branch for PRs

## Contact

**Official Website:** [valdi.sonel.dev](https://valdi.sonel.dev)  
**Discord:** Soneliem#4194  
**Project Link:** [https://github.com/Soneliem/vALDI](https://github.com/Soneliem/vALDI)  
**Discord Server:**  
[![Discord Banner 2](https://discordapp.com/api/guilds/881790284613185546/widget.png?style=banner2)](https://discord.gg/X7CYCeZSRK)  

## Acknowledgements

- [valorant.ts](https://github.com/KTNG-3/valorant-api) for the API wrapper
- [Valorant-API](https://valorant-api.com/) for the static assets API

## DISCLAIMER

THIS PROJECT IS NOT ASSOCIATED OR ENDORSED BY RIOT GAMES. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
By using this application, you agree that you, the individual, are knowingly accessing all information required to be displayed.

Google Play and the Google Play logo are trademarks of Google LLC.

## Privacy Policy

Privacy Policy available [here](https://valdi.sonel.dev/privacy)
