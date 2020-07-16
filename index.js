const AWS = require("aws-sdk");
const fetch = require("node-fetch");

require("dotenv").config();

AWS.config.region = process.env.AWS_REGION || "us-east-1";

function asyncSleep(milis) {
  return new Promise((resolve) => {
    setTimeout(resolve, milis);
  });
}

const NOTIFY_INTERVAL = process.env.NOTIFY_INTERVAL || 1000 * 60 * 60 * 4; // Notifiy health status every four hours
const POLL_INTERVAL = process.env.POLL_INTERVAL || 1000 * 60 * 5; // Check every 5 minutes

async function sendMessage(message) {
  const sns = new AWS.SNS({ apiVersion: "2010-03-31" });

  for (const number of process.env.PHONE_NUMBERS.split(",")) {
    var params = {
      Message: message,
      PhoneNumber: number,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    };

    await sns.publish(params).promise();
  }
}

async function main() {
  let lastNotifyTime = Date.now() - NOTIFY_INTERVAL;

  while (true) {
    const response = await fetch(
      "https://constellation-api.argolims.net/api/v1/patient/portalreport",
      {
        method: "post",
        body: JSON.stringify({
          dob: process.env.DOB,
          firstname: process.env.FIRST_NAME,
          lang: "en",
          lastname: process.env.LAST_NAME,
          requisitionNumber: process.env.REQ_NUMBER,
        }),
        headers: {
          "content-type": "application/json",
          origin: "https://wv.getmycovidresult.com",
        },
      }
    );
    const json = await response.json();

    console.log(new Date().toString(), json);

    if (json.token === null && Date.now() - lastNotifyTime > NOTIFY_INTERVAL) {
      lastNotifyTime = Date.now() - 0.5 * POLL_INTERVAL;
      sendMessage("Covid checker running");
    } else if (json.token !== null) {
      sendMessage("Covid report ready");
    }

    await asyncSleep(POLL_INTERVAL);
  }
}

main();
