// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaintContract {
    address public owner;

    struct Purchase {
        address buyer;
        bool isPurchased;
    }

    uint256 public paintPurchasesCount;
    mapping(uint256 => Purchase) public paintPurchases;
    mapping(uint256 => uint256) public paintPrices;

    event PaintPurchased(address indexed buyer, uint256 indexed paintId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        paintPurchasesCount = 0;
    }

    function setPaintPrice(uint256 paintId) external onlyOwner payable {
    require(msg.value > 0, "No Ether sent");
    paintPrices[paintId] = msg.value;
}


  function purchasePaint(uint256 paintId) external payable {
    require(!paintPurchases[paintId].isPurchased, "Paint already purchased");
    require(msg.value >= paintPrices[paintId], "Not enough Ether sent");

    // Calcola la quantità di Ether effettivamente pagata per il quadro
    uint256 actualPrice = paintPrices[paintId];
    require(msg.value >= actualPrice, "Not enough Ether sent");

    // Effettua la transazione utilizzando l'actualPrice
    (bool success, ) = owner.call{value: actualPrice}("");
    require(success, "Transaction failed");

    // Aggiorna lo stato del quadro
    paintPurchases[paintId] = Purchase(msg.sender, true);
    paintPurchasesCount++;

    emit PaintPurchased(msg.sender, paintId);
}


    function getAcquisitionsByBuyer(address buyer) external view returns (uint256[] memory) {
        uint256 count = 0;

        // Conta il numero di quadri acquistati dall'acquirente specificato
        for (uint256 i = 0; i < paintPurchasesCount; i++) {
            if (paintPurchases[i].buyer == buyer && paintPurchases[i].isPurchased) {
                count++;
            }
        }

        // Crea un array contenente gli ID dei quadri acquistati
        uint256[] memory result = new uint256[](count);
        count = 0;
        for (uint256 i = 0; i < paintPurchasesCount; i++) {
            if (paintPurchases[i].buyer == buyer && paintPurchases[i].isPurchased) {
                result[count] = i;
                count++;
            }
        }

        return result;
    }
   
}
