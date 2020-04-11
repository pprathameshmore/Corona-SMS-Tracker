const express = require('express');
const twilio = require('twilio');
const axios = require('axios');

const router = express.Router();

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const API_KEY = process.env.API_KEY;

/* const client = new twilio(ACCOUNT_ID, API_KEY); */


async function getCovidData() {
  const covidINdata = await axios.get('https://api.covid19api.com/live/country/india/status/confirmed');

  const latestData = covidINdata.data;

  const recentData = latestData[latestData.length - 1];

  return recentData;
}

/* GET home page. */
router.get('/', async (req, res, next) => {

  const latestData = await getCovidData();

  res.render('index', { isSuccess: false, latestData: latestData });
});

router.post('/', async (req, res, next) => {
  try {
    const { mobile } = req.body;

    const recentData = await getCovidData();


    const messageBody = `Currently, ${recentData.Country} has a total of ${recentData.Confirmed} confirmed cases, ${recentData.Deaths} deaths and the good news is ${recentData.Recovered} recovered. Still ${recentData.Active} active cases. \nStay at home, stay safe!  :) \nPrathamesh`

    if (mobile) {


      axios.get(`https://www.sms4india.com/api/v1/sendCampaign?apikey=DNT9E1OVNNGRJK9VEENEAL38AJJ69MDS&secret=UISF28FW4B2KPA67&usetype=stage&senderid=9657227905&phone=${mobile}&message=${messageBody}`)
        .then(sms => {

          return res.status(200).render('index', { isSuccess: true, latestData: recentData });

        }).catch(error => {
          return res.status(200).render('index', { isSuccess: false, latestData: recentData });
        });

      /*   client.api.messages.create({
          body: messageBody,
          to: '+91' + mobile,
          from: +12569789527
        }).then(data => {
          console.log('SMS Sent' + data);
          return res.status(200).render('index', { isSuccess: true, latestData: recentData });
        }).catch(error => {
          console.log(error);
          return res.status(200).render('index', { isSuccess: false, latestData: recentData });
        }); */
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
