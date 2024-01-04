// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaintContract {
    struct Paint {
        uint256 id;
        string name;
        string image;
        string artist;
        uint256 price;
        bool isAvailable;
    }

    mapping(uint256 => Paint) public paints;
    uint256 public paintsCount;

    event PaintPurchased(uint256 indexed paintId, address indexed buyer);

    constructor() {
        addPaint("Distese stellate", "img/ai1.jpeg", "Alessandro Vibrante", 33527633954871);
        // Aggiungi altri quadri se necessario
    }

    function addPaint(
        string memory name,
        string memory image,
        string memory artist,
        uint256 price
    ) public {
        paintsCount++;
        paints[paintsCount] = Paint(paintsCount, name, image, artist, price, true);
    }

    function purchasePaint(uint256 paintId) public payable {
        Paint storage paint = paints[paintId];

        require(paint.isAvailable, "This painting is not available");
        require(msg.value == paint.price, "Incorrect payment amount");

        paint.isAvailable = false;
        emit PaintPurchased(paintId, msg.sender);
    }
}
