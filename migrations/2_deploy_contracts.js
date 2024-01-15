var PaintContract = artifacts.require("PaintContract.sol");

module.exports = function(deployer) {
  deployer.deploy(PaintContract);

};