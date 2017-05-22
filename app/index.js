const fetch = require('node-fetch');
const querystring = require('querystring');
const json2csv = require('json2csv');
const fs = require('fs');
const fields = [
  'token',
  'created_at',
  'updated_at',
  'email',
  'data',
  'storage_state',
  'test',
  'last_four_digits',
  'first_six_digits',
  'card_type',
  'first_name',
  'last_name',
  'month',
  'year',
  'address1',
  'address2',
  'city',
  'state',
  'zip',
  'country',
  'phone_number',
  'company',
  'full_name',
  'eligible_for_card_updater',
  'shipping_address1',
  'shipping_address2',
  'shipping_city',
  'shipping_state',
  'shipping_zip',
  'shipping_country',
  'shipping_phone_number',
  'payment_method_type',
  'errors',
  'fingerprint',
  'verification_value',
  'number',
];

const spreedlyUrl = process.env.SPREEDLY_URL;
const spreedlyAuth = process.env.SPREEDLY_AUTH;
const spreedlyTestToken = process.env.SPREEDLY_TEST_TOKEN;

retrieveData(spreedlyUrl, spreedlyTestToken)
  .then((results) => {
    console.log(`Done! ${results.length}`);
  });

function retrieveData(url, sinceToken) {
  return new Promise((resolve) => {
    let qs = { count: 100 };

    if (sinceToken) {
      qs = Object.assign({}, qs, { since_token: sinceToken });
    }

    const finalUrl = `${url}?${querystring.stringify(qs)}`;

    fetch(finalUrl, { headers: { Authorization: `Basic ${spreedlyAuth}` } })
      .then(checkStatus)
      .then(getJSON)
      .then((json) => {
        const paymentMethods = json.payment_methods;

        if (paymentMethods.length === 0) return resolve(paymentMethods);

        const csv = json2csv({ 
          data: paymentMethods,
          fields,
        });

        fs.appendFile('file.csv', csv, (err) => {
          if (err) console.error(err);
        });

        console.log(paymentMethods[paymentMethods.length - 1].token); // TODO: remove

        return retrieveData(url, paymentMethods[paymentMethods.length - 1].token)
          .then(results => resolve(paymentMethods.concat(results)));
      });
  });
}

function checkStatus(response) {
  if (response.status === 200) {
    return Promise.resolve(response);
  }

  return Promise.reject(new Error(response.statusText));
}

function getJSON(response) {
  return response.json();
}
