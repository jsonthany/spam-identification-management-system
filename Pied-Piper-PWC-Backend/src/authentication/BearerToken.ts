import passportHttpBearer from 'passport-http-bearer';

const HttpBearerStrategy = new passportHttpBearer.Strategy((token, done) => {
  if (token === process.env['API_KEY']) {
    done(null, true);
  } else {
    done(null, false);
  }
});

export default HttpBearerStrategy;
