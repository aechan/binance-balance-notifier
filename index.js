const binance = require('node-binance-api');
const notifier = require('node-notifier');
const fs = require('fs');
const os = require('os');
const path = require('path');
const schedule = require('node-schedule');
// config path
const config_path = path.join(os.homedir(), '.bbnotifier', 'bbn-config.json');

// config with default values
var config = {
    notify_interval: 'hourly',
    optional_daily_notify_hour: 12,
    binance_api_key: '',
    binance_api_secret: ''
};

// first check if the .bbnotifier dir exists
if(!fs.existsSync(path.join(os.homedir(), '.bbnotifier'))) {
    fs.mkdirSync(path.join(os.homedir(), '.bbnotifier'));
}
// if no config file exists then we write one with defaults
if(!fs.existsSync(config_path)) {
    fs.writeFileSync(config_path, JSON.stringify(config));
}

// parse config file from path
config = JSON.parse(fs.readFileSync(config_path,'utf8'));


if(config === null || config === undefined) {
    console.log("Error loading config file from " + config_path);
    exit(1);
}

// configure binance after we've loaded the config
binance.options({
    'APIKEY': config.binance_api_key,
    'APISECRET': config.binance_api_secret
});

// do stuff with data we get back from Binance
var balance_update = function (data) {

    var assetstr = "";
    binance.prices(function(ticker) {
        // ETH in terms of USDT which is 1/1 with USD
        const ethToUSDMultiplier = ticker.ETHUSDT;

        var USDBalance = 0;
        for (var x in data) {

            var asset = x;
            var available = data[x].available;

            if ( available == "0.00000000" ) continue;
            assetstr += asset + ": " + available + "\n";
            // if this asset was ETH we can do a direct conversion
            if(asset === "ETH") {
                USDBalance += (available * ethToUSDMultiplier);
            } else {
                for(var i in ticker) {
                    if(i===asset+"ETH") {
                        var assetToETH = Number(ticker[i]);
                        var myETH = (assetToETH * available);
                        USDBalance += (myETH * ethToUSDMultiplier);
                    }
                }
            }
        }

        assetstr += "ACCT Value: $" + USDBalance;
        console.log(assetstr);
        notifier.notify({
            'title': 'Your Binance Account',
            'message': "Current Value: $" + USDBalance.toPrecision(4),
            'icon': path.join(os.homedir(), '.bbnotifier', 'binance.png')
        });
    });
    
    
}

// build our notification
const notify = function() {
    binance.balance(function(balances) {
        balance_update(balances);
    });    
};

// build recurrence rule based on config
var rule = new schedule.RecurrenceRule();
if(config.notify_interval.toLowerCase() === 'daily' && 
    config.optional_daily_notify_hour != '') {
    rule.hour = Number(config.optional_daily_notify_hour);
} else if (config.notify_interval.toLowerCase() === 'hourly') {
    rule.minute = 38;
}


// if we have no arguments install the scheduled event
if(process.argv.length === 2) {
    var job = schedule.scheduleJob(rule, notify);
} 
// if we have the argument --cur we print out the current value immediately
else if (process.argv[2] === '--cur') {
    notify();
}