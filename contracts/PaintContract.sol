// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaintContract {
    address public owner;
    mapping(uint256 => address) public paintOwners;
    mapping(uint256 => uint256) public paintPrices;
    mapping(uint256 => bool) public paintPurchased;
    uint256 public totalPaintings;

    event PaintPurchased(uint256 indexed paintId, address indexed buyer, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyIfNotPurchased(uint256 paintId) {
        require(!paintPurchased[paintId], "This paint has already been purchased");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addPainting(uint256 price) external onlyOwner {
        totalPaintings++;
        paintPrices[totalPaintings] = price;
    }

    function buyPainting(uint256 paintId) external payable onlyIfNotPurchased(paintId) {
        require(msg.value == paintPrices[paintId], "Incorrect payment amount");

        paintOwners[paintId] = msg.sender;
        paintPurchased[paintId] = true;

        emit PaintPurchased(paintId, msg.sender, msg.value);
    }

    function getBuyers() external view returns (address[] memory, uint256[] memory, bool[] memory) {
        address[] memory buyers = new address[](totalPaintings);
        uint256[] memory prices = new uint256[](totalPaintings);
        bool[] memory purchasedStatus = new bool[](totalPaintings);

        for (uint256 i = 1; i <= totalPaintings; i++) {
            buyers[i - 1] = paintOwners[i];
            prices[i - 1] = paintPrices[i];
            purchasedStatus[i - 1] = paintPurchased[i];
        }

        return (buyers, prices, purchasedStatus);
    }
}
