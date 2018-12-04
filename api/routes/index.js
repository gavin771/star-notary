var express = require('express');
var router = express.Router();
const Web3 = require('web3')
const path = require('path')
const cjson = require('cjson')

// contract details
const provider = 'https://rinkeby.infura.io/v3/2f79cb18a2504e0dae4b1920a9a26875'
const contractAddress = '0xa91cd72dc35fbb258646f6a2315732f7c454024c'
const privateKey = new Buffer('', 'hex')
const defaultAccount = '0xD90cF5a9caa5F52CcbC5723ffd771eC8580f4C2B'
var contract = null;
const web3 = new Web3(provider)


// Initiate the Contract
function getContract() {
  if (contract === null) {
    var abi = cjson.load(path.resolve(__dirname, '../abi.json'));
    var c = new web3.eth.Contract(abi, contractAddress)
    contract = c.clone();
  }
  //console.log('Contract Initiated successfully!')
  return contract;
}

/* GET home page. */
router.get('/:token', async function (req, res, next) {
  try {
    const _token = parseInt(req.params.token);
    var { name, story, coord_cent, coord_dec, coord_mag } = await getContract().methods.tokenIdToStarInfo(_token).call();
    console.log(name)
    return res.status(200).json([name, story, coord_cent, coord_dec, coord_mag])
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: `Error retrieveing star: ${req.params.token}` });
  }
});

module.exports = router;
