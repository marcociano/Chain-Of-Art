// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract PaintContract {
    uint public counterPaints;
    address public owner;
    uint256 public nextPaintingId;
    mapping(uint256 => uint256) public paintingIdToPrice;
    mapping(uint256 => address) public paintingIdToOwner;

    event PaintingPurchased(address indexed buyer, uint256 paintingId, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        counterPaints=0;
        owner = msg.sender;
    }

    function mintPainting(uint256 price) external onlyOwner {
        uint256 paintingId = nextPaintingId;
        paintingIdToOwner[paintingId] = owner;
        paintingIdToPrice[paintingId] = price;
        nextPaintingId++;
        emit PaintingPurchased(owner, paintingId, price);
    }

    function purchasePainting(uint256 paintingId) external payable {
        require(paintingIdToOwner[paintingId] != address(0), "Painting ID does not exist");
        require(msg.value == paintingIdToPrice[paintingId], "Incorrect payment amount");

        address payable seller = payable(paintingIdToOwner[paintingId]);
        seller.transfer(msg.value);

        paintingIdToOwner[paintingId] = msg.sender;
        emit PaintingPurchased(msg.sender, paintingId, msg.value);
    }
}
