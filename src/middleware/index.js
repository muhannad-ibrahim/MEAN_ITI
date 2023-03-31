const wrapperHandler = (promise) => promise
    .then((data) => ([undefined, data]))
    .catch((err) => ([err, undefined]));

module.exports = wrapperHandler;
