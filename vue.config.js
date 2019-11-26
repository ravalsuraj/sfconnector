//Important: Set the env to either development or production to use the appropriate config
/****************************************/
const env = "development"; // 'development' or 'production'
/*******************************************/

const development = {
    publicPath: 'https://104.211.95.34:9443/softphone',
    devServer: {
        //open: process.platform === 'darwin',
        publicPath: '/softphone/',
        port: 9092, // CHANGE YOUR PORT HERE!
        https: true,
        disableHostCheck: true,
       
        public: '104.211.95.34:9443',
        proxy: 'https://104.211.95.34:9443/softphone'
    },
};

const production = {
    publicPath: 'https://cticonnector.oberoirealty.com/softphone',
    devServer: {
        open: process.platform === 'darwin',
        port: 8082, // CHANGE YOUR PORT HERE!
        https: true,
        disableHostCheck: true,
        proxy: 'https://cticonnector.oberoirealty.com/softphone'
    },
}

const config = {
    development,
    production
};

module.exports = config[env];