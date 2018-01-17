#!/bin/bash
echo "Installing binance-balance-notifier into /usr/bin/bbnotifier/"
INSTALL_DIR=/usr/bin/bbnotifier

# create install directory
if [ ! -d "$INSTALL_DIR" ]; then
    sudo mkdir /usr/bin/bbnotifier
fi

# create config dir and copy logo image
if [ ! -d "$HOME/.bbnotifier" ]; then
    mkdir $HOME/.bbnotifier
fi
cp binance.png $HOME/.bbnotifier/binance.png

# copy over all files
sudo cp index.js $INSTALL_DIR/index.js
sudo cp package.json $INSTALL_DIR/package.json
sudo touch /usr/bin/binance-balance-notifier
sudo bash -c 'echo "/usr/bin/node /usr/bin/bbnotifier/index.js \"$@\"" > /usr/bin/binance-balance-notifier'
sudo chmod +x /usr/bin/binance-balance-notifier
sudo cp binance-balance-notifier.service /etc/systemd/system/binance-balance-notifier@$USER.service

# go to install dir and install npm packages
cd $INSTALL_DIR
sudo /usr/bin/npm install >/dev/null 2>&1

# start daemon
echo "Installing daemon..."
sudo systemctl daemon-reload
sudo systemctl enable binance-balance-notifier@$USER.service
sudo systemctl start binance-balance-notifier@$USER
echo "Installed and started binance-balance-notifier.service"

# create config
read -p "Enter your Binance API key " API
read -p "Enter your Binance API secret " SECRET
echo "{\"notify_interval\":\"hourly\",\"optional_daily_notify_hour\":12,\"binance_api_key\":\"${API}\",\"binance_api_secret\":\"${SECRET}\",
\"notification_detail\": \"basic\"}" > $HOME/.bbnotifier/bbn-config.json
echo "Wrote config file in ~/.bbnotifier/bbn-config.json"

# test
echo "Firing test notification"
/usr/bin/node /usr/bin/bbnotifier/index.js --cur
echo "Install successful!"
