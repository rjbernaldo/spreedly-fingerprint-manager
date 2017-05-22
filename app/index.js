const fetch = require('node-fetch');
const querystring = require('querystring');

const spreedlyUrl = process.env.SPREEDLY_URL;
const spreedlyAuth = process.env.SPREEDLY_AUTH;
const spreedlyTestToken = process.env.SPREEDLY_TEST_TOKEN;

retrieveData(spreedlyUrl, spreedlyTestToken)
  .then((results) => {
    console.log('end', results.length);
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
