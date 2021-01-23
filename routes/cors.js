const cors = require("cors");

//list of other origins allowed to access server endpoints
const whitelist = ["http://localhost:3000", "https://localhost:3443"];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  console.log(req.header("Origin"));
  //check for value of origin header. -1 js for not found, therefore this is found, true
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors(); /*returns function configure to set a cors header of acao on response 
object with a wild card, allowing cors for all origins */
exports.corsWithOptions = cors(
  corsOptionsDelegate
); /* sets argument for above function
allowing cors sharing only for set whitelist origins */
