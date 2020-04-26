var Debate1 = artifacts.require("./Debate1.sol");
var Debate2 = artifacts.require("./Debate2.sol");

module.exports = function(deployer) {
  deployer.deploy(Debate1);
  deployer.deploy(Debate2);
};
