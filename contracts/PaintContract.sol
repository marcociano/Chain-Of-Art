// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaintContract {
    address public owner;
    mapping(uint256 => address) public paintOwners;
    mapping(uint256 => bool) public paintPurchased;

    event PaintPurchased(address indexed buyer, uint256 indexed paintId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function purchasePaint(uint256 paintId) external {
        require(!paintPurchased[paintId], "Paint already purchased");
        
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
