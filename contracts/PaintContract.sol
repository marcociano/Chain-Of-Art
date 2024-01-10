// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/*All'interno di questo smart contract sono inseriti i seguenti design pattern:
 * n°1 Checks-Effects-Interactions Pattern -> stabilisce la sequenza delle operazioni secondo l'ordine check(attuare controlli per verificare le condizioni necessarie), effects (applicazione), interactions(gestite le interazioni).
 * n°2 Owner Pattern -> Garantisce che solo il proprietario esegua operazioni "critiche".
 * n°3 Emergency Stop -> Sospende temporaneamente l'esecuzione in caso di emergenza.
 * n°4 Reentrancy Guard Pattern -> Protegge dagli attacchi di reentrancy.
 * n°5 Time-Dependent Restrictions Pattern -> Consente di applicare restrizioni basate sul tempo.
 */


contract PaintContract {
    address public owner;

    // Design pattern n°3: Emergency Stop Pattern
    //bool public stopped = false;

    // Design pattern n°5: Time-Dependent Restrictions
    //unit256 public contractStartTime;

    // Design pattern n°4: Reentrancy Guard
    //bool private locked = false;

    struct Purchase {
        address buyer;
        bool isPurchased;
    }

    uint256 public paintPurchasesCount;
    mapping(uint256 => Purchase) public paintPurchases;
    mapping(uint256 => uint256) public paintPrices;

    event PaintPurchased(address indexed buyer, uint256 indexed paintId);

    constructor() {
        owner = msg.sender;
        paintPurchasesCount = 0;
        //Inizializzazione del Time-Dependent Restrictions Pattern
        //contractStartTime = block.timestamp + 1 days; 
    }

    // Design Pattern n°2: Owner Pattern
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /* //Modificatore per Emergency Stop Pattern
    modifier stopInEmergency() {
        require(!stopped, "Contract is stopped");
        _;
    }*/

    /*//Modificatore per Reentrancy Guard Pattern
    modifier noReentrancy() {
        require(!locked, "No reentrancy allowed");
        locked = true;
        _;
        locked = false;
    }*/

    /* Modificatore per Time-Dependent Restriction Pattern
    modifier timeRestricted() {
        require(block.timestamp >= contractStartTime, "Function not yet available");
        _;
    }*/

    /* //Funzione per attivare/disattivare l'Emergency Stop
    function toggleContractActive() external onlyOwner {
        stopped = !stopped;
    }*/

    // Applicazione dei pattern Owner (pattern n°2), Emergency Stop (n°3) e Time-Dependent Restrictions (n°5)
    function setPaintPrice(uint256 paintId) external onlyOwner payable {
    require(msg.value > 0, "No Ether sent");
    paintPrices[paintId] = msg.value;
}

    // Applicazione dei pattern Checks-Effects-Interactions, Reentrancy Guard e Emergency Stop rispettivamente pattern n°1, n°4, n°3
  function purchasePaint(uint256 paintId) external payable {
    // Checks
    require(!paintPurchases[paintId].isPurchased, "Paint already purchased");
    require(msg.value >= paintPrices[paintId], "Not enough Ether sent");

    // Calcola la quantità di Ether effettivamente pagata per il quadro
    uint256 actualPrice = paintPrices[paintId];
    require(msg.value >= actualPrice, "Not enough Ether sent");

    // Aggiorna lo stato del quadro (Effect)
    paintPurchases[paintId] = Purchase(msg.sender, true);
    paintPurchasesCount++;

    // Effettua la transazione utilizzando l'actualPrice (Interactions)
    (bool success, ) = owner.call{value: actualPrice}("");
    require(success, "Transaction failed");

    emit PaintPurchased(msg.sender, paintId);
}

    // Funzione per ottenere gli acquisti di un acquirente
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
