// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaintContract {
    address public owner;
    mapping(uint256 => address) public paintOwners;
    mapping(uint256 => bool) public paintPurchased;
    //Mapping per convertire i prezzi
    mapping(uint256 => uint256) public paintPrices;

    event PaintPurchased(address indexed buyer, uint256 indexed paintId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    //Imposta il prezzo
    function setPaintPrice(uint256 paintId, uint256 price) external onlyOwner {
        paintPrices[paintId] = price;
    }

    function purchasePaint(uint256 paintId) external payable {
        require(!paintPurchased[paintId], "Paint already purchased");
        require(msg.value >= paintPrices[paintId], "Not enough Ether sent");

        paintOwners[paintId] = msg.sender;
        paintPurchased[paintId] = true;

        emit PaintPurchased(msg.sender, paintId);
    }

    function getPaint(uint256 paintId) external view returns (address) {
        return paintOwners[paintId];
    }

    function setOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
