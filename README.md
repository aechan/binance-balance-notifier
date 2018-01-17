# binance-balance-notifier
Notifies you of the balance in your Binance account at hourly or daily intervals.
Uses node-notifier to send you desktop notifications on most platforms (Gnome, macOS and Windows are known to work for sure)
## Installation/Usage
Simply run `install.sh` and you will be prompted for root access because the script installs as a Systemd service.
Then you will be good to go and the service will be running and will automatically start at boot.
On other systems like Windows or macOS you will have to manually figure out how to run the script at startup.
## Configuration
After the first run, a config file will be written to `~/.bbnotifier/bbn-config.json`
It will look similar to this:
````js
{
    notify_interval: 'hourly',
    optional_daily_notify_hour: 12,
    binance_api_key: '',
    binance_api_secret: '',
    notification_detail: 'basic'
}
````

Config options:

| Variable      | Default       | Options  |
| ------------- |:-------------:| -------- |
| notify_interval | `'hourly'` | `'hourly' or 'daily'` |
| optional_daily_notify_hour (only used if `notify_interval` set to `daily`) | `12` | Any integer between 1 and 24 |
| binance_api_key | `''`  | Your Binance API key from [here](https://www.binance.com/userCenter/createApi.html) |
| binance_api_secret | `''`  | Your Binance API secret from [here](https://www.binance.com/userCenter/createApi.html) |
| notification_detail | `'basic'`  | `'basic' or 'detailed'` (basic shows total USD value of your account, detailed shows breakdown of all assets in your account) |
