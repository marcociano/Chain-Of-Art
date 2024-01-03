var PaintContract = artifacts.require("PaintContract");

module.exports = function(deployer) {
  deployer.deploy(PaintContract);

};