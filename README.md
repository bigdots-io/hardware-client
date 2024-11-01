# Hardware Client

This client is responsible for rendering an LED display (and listening for changes) and automatically starting that render process on boot.

_Note:_ It is assumed you are running the hardware client on a Raspberry Pi 3!

```
curl -X POST http://192.168.4.135:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "twinkle", "macroConfig": {"color": "#ffffff"}}, {"macroName": "marquee", "macroConfig": {"speed": 25, "color": "#228B22"}}]}'

curl -X POST http://192.168.4.135:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "ripple"}]}'

   curl -X POST http://192.168.4.135:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "marquee", "macroConfig": {"speed": 1, "color": "#228B22", "text": "hi", "direction": "horizontal"}}]}'

curl -X POST http://192.168.4.135:3000/macros \
   -H 'Content-Type: application/json' \
   -d '{"macros":[{"macroName": "text", "macroConfig": {"font": "pixelify", "color": "#FFFFFF", "text": "small!", "fontSize": "15"}}]}'
```

sudo node lib/esm/index.js --rows 16 --cols 32 --chain-length 3

### Pi Setup

```
https://stackoverflow.com/questions/21215059/cant-use-nvm-from-root-or-sudo
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
```

```
sudo raspi-config
sudo cp bigdots.service /etc/systemd/system/bigdots.service
sudo systemctl daemon-reload
sudo systemctl start bigdots
sudo systemctl status bigdots
sudo systemctl enable bigdots
```
