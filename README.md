# Hardware Client

This client is responsible for rendering an LED display (and listening for changes) and automatically starting that render process on boot.

_Note:_ It is assumed you are running the hardware client on a Raspberry Pi 3!

# Preparation

Before we install the client software, make sure that your system is up to date...

`$ sudo apt-get update && sudo apt-get upgrade`

Go ahead and reboot your pi for good measure.

Next you'll need to install Node 6.6.0 on your pi. The Node installation process mentioned in [this guide](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/) is fairly painless. Look for "Install Node.js".

# Installation

Install Git, if needed..

`$ sudo apt-get install git`

Clone this repo on your device in your user's (using the `pi` user is just fine) home directory.

`$ git clone https://github.com/bigdots-io/hardware-client.git`

Add a json config file to the root of this cloned directory that looks like this...

```json
{
  "display": "YOUR-DISPLAY-KEY",
  "rows": 32,
  "chains": 3,
  "parallel": 1
}
```

Then run..

`$ sudo ./install.sh`

That should install a few more dependencies as well as install an upstart script that will automatically start your LED process on boot. To manually toggle your LED process now use...

`$ sudo start hardware-client`

`$ sudo stop hardware-client`

https://www.instructables.com/Disable-the-Built-in-Sound-Card-of-Raspberry-Pi/

```
curl -X POST http://192.168.4.104:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "twinkle", "macroConfig": {"color": "#ffffff"}}, {"macroName": "marquee", "macroConfig": {"speed": 25, "color": "#228B22"}}]}'

   curl -X POST http://192.168.4.104:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "twinkle", "macroConfig": {"color": "#ffffff"}}, {"macroName": "marquee", "macroConfig": {"speed": 25, "color": "#228B22"}}]}'
```

sudo node lib/esm/index.js --rows 16 --cols 32 --chain-length 3
