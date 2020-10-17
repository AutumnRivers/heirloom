<center>
    <h1>Heirloom</h1>
</center>

---

Heirloom gives a GUI to [Legendary], an open-source alternative to the Epic Games Launcher.

Similar to Legendary, Heirloom is named after [the tiers of item rarity in MMORPGs](https://wow.gamepedia.com/Quality).

It's, admittedly, not the best. It does a lot of hacky things and will probably break on you. But for those who are put-off by Legendary's command line interface, you can use this!

---

* [Installing](#installing)
    * [Using an existing install of Legendary](#using-an-existing-install-of-legendary)
* [Developing Locally](#developing-locally)
* [Possible Questions](#possible-questions)
* [Uncompressed Files](#uncompressed-files)

---

## Installing
For now, Heirloom has binaries for *only* Windows 64-bit. [You're free to download the source code and try compiling it yourself](#developing-locally), but I'm only testing on Win64 for now.

You can find binaries in the "Releases" tab of this GitHub repo.

### Using an existing install of [Legendary]

Heirloom will install Legendary to your machine and even add it to your PATH for you! But, wait, what if you already installed Legendary in the past?

If you've added Legendary to your PATH, then you're already done. If you haven't... well, get on that.

https://helpdeskgeek.com/windows-10/add-windows-path-environment-variable/

---

## Developing Locally

**Requirements:**
* Latest *stable* release of NodeJS
    * This may work on older versions, but I've only tested with the latest stable.
* Latest *stable* release of NPM or Yarn
    * [Yarn](https://yarnpkg.com/) is preferred.
* An existing install of [Legendary]
* Administrative privelages
* A brain would be nice
* A computer as well
* Hey, maybe throw internet connectivity in there

1. Clone the Git repo to your system: `url goes here`
2. Go to the folder: `cd ./Heirloom`
3. Run [yarn](https://yarnpkg.com/): `yarn`
    * NPM can also be used, but not recommended: `npm install`
4. Run the application: `yarn start` / `npm start`
5. Build the application: `yarn run build64` / `npm run build64`
6. ???
7. Profit!

---

## Possible Questions

**Q: Why am I being asked for admin privelages when installing (game)?**

A: Some games require prerequisites to be installed. You know, things like DirectX. You can't install these without elevated privelages, so yeah, that's why you're being asked.


**Q: Can I add games to my library from here?**

A: No. You have to go to the [Epic Games website](https://www.epicgames.com/) in order to add games to your library. You can install them from Heirloom, though!


**Q: Can I import from Epic Games Launcher?**

A: Not with Heirloom. [Legendary] has this functionality, but as I refuse to install EGL, Heirloom does not.


**Q: Can I use this on Mac?**

A: No. Legendary doesn't support Mac. You might get Heirloom to run, but it'll be utterly useless.


**Q: Can I launch VR games from this?**

A: Heirloom has a workaround for this. Legendary can't detect if a game has VR capability, but at the end of the day, it's usually just adding the `-vr` flag to the executable path.

You can manually mark games in Heirloom as `VR Compatible`. This will open a new option when launching a game.


**Q: Does this work with multiplayer?**

A: Yes! But you can't manage your Epic Games friends from Heirloom. You can't view them either. But hey, nothing is stopping you from playing Rocket League.


**Q: Do I need an account?**

A: Yes, but you shouldn't have to worry about Epic tracking you or anything. You can even launch games offline.

---

## Uncompressed Files

Heirloom's github repo comes with uncompressed image / audio files. For image files, you can open them in PNG and ICO with any image viewing software. They also come in Photoshop RAW (.raw) and Photoshop PSD (.psd). Each image was made with Photoshop CC 2020.

Audio files come uncompressed in FLAC and MP3 320kbps formats. I don't have the source files. Audio files are used for notifications and other effects. They are not in the initial release.

[Legendary]: https://github.com/derrod/legendary