// Write your answer here
let fs = require('fs');
let parse = require('csv-parse');

let axios = require('axios');

let tokenObjects = [];
let depositStr = "DEPOSIT";
let withdrawStr = "WITHDRAWAL";

let cryptoCompareKey = "14f9bcb3bf8df3a22009b7a5596ca745f3e9f343b0d7565dacfdfbc25e3fe400";

let parser = parse({
    columns: true
}, (err, records) => {
    // console.log(records);

    records.map(record => {
        let index = -1;
        for (let i = 0; i < tokenObjects.length; i++) {
            if (tokenObjects[i].token == record.token) {
                index = i;
            }
        }

        if (index > -1) {
            if (record.transaction_type == depositStr) {
                tokenObjects[index].amount += parseFloat(record.amount);
            } else if (record.transaction_type == withdrawStr) {
                tokenObjects[index].amount -= parseFloat(record.amount);
            }
        } else {
            let tempObj = {
                token: record.token,
                amount: parseFloat(record.amount),
                usdtAmount: 0
            };
            tokenObjects.push(tempObj);
        }
    });

    getUSDTPrice();
});

async function getUSDTPrice() {
    let fsymsTokenStr = "";
    let tsymsTokenStr = "USD";

    tokenObjects.map(obj => {
        if (fsymsTokenStr != "") {
            fsymsTokenStr += ",";
        }

        fsymsTokenStr += obj.token;
    });

    let url = "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" +
        fsymsTokenStr +
        "&tsyms=" +
        tsymsTokenStr +
        "&api_key=" +
        cryptoCompareKey;
    await axios.get(url).then(res => {
        let objArray = Object.values(res.data);
        for (let i = 0; i < tokenObjects.length; i++) {
            tokenObjects[i].usdtAmount = tokenObjects[i].amount * parseFloat(objArray[i].USD);
        }
    });

    console.log(tokenObjects);
};


fs.createReadStream(__dirname + '/data/transactions.csv').pipe(parser);