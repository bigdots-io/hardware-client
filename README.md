# Hardware Client

This client is responsible for rendering an LED display (and listening for changes) and automatically starting that render process on boot.

*Note:* It is assumed you are running the hardware client on a Raspberry Pi 3!

# Preparation

Before we install the client software, make sure that your system is up to date...

`$ apt-get update && apt-get upgrade`

Go ahead and reboot your pi for good measure.

Next you'll need to install Node. The easiest way to do that is via [NVM](https://github.com/creationix/nvm). After installing NVM, you'll want to load Node 6.6.0 on your pi.

`$ nvm install 6.6.0`

# Installation

Checkout this repo on your device. Then run..

`$ sudo ./install.sh`

That should install a few more dependencies as well as install an upstart script that will automatically start your LED process on boot. To manually toggle your LED process now use...

`$ sudo start hardware-client`

`$ sudo stop hardware-client`
