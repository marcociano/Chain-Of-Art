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
    uint public counterPaints;
    struct Paint {
        uint id;
        string title;
        string img;
        string artist;
        uint price;
        bool status;
    }

    mapping (uint => Paint) public paints;
    mapping (address => uint[]) public purchasedPaints;
  

    event purchasedPaint(address indexed buyer, uint indexed paintId);

    constructor() {
       counterPaints = 0;
        //Inizializzazione del Time-Dependent Restrictions Pattern
        //contractStartTime = block.timestamp + 1 days; 
    }



    function createPaint(
        uint id,
        string memory title,
        string memory img,
        string memory artist,
        uint price 
    ) public {
        require(paints[id].id == 0, "Quadro con lo stesso ID gia' esistente");

        paints[id] = Paint(
            id,
            title,
            img,
            artist,
            price,
            true
        );
        counterPaints++;
    }

    function getPaintDetails(uint paintId) public view returns (
        uint id,
        string memory title,
        string memory img,
        string memory artist,
        uint price,
        bool status 
    ){
        Paint storage paint = paints[paintId];
        return (
            paint.id,
            paint.title,
            paint.img,
            paint.artist,
            paint.price,
            paint.status
        );
    }

    function buyPaint(uint paintId) public payable {
        Paint storage paint = paints[paintId];
        require(paint.status, "Il quadro non e' disponibile");

        require(!purchasedSatus(msg.sender, paintId), "Hai gia' comprato questo quadro");

        purchasedPaints[msg.sender].push(paintId);

        emit purchasedPaint(msg.sender, paintId);
    }

    function purchasedSatus(address buyer, uint paintId) internal view returns (bool) {
        uint[] storage purchasedIds = purchasedPaints[buyer];
        for (uint i = 0; i< purchasedIds.length; i++){
            if (purchasedIds[i] == paintId) {
                return true;
            }
        }
        return false;
    }

    function getAllPaintd() public view returns (Paint[] memory){
        Paint[] memory result = new Paint[](counterPaints);
        for(uint i = 0; i< counterPaints; i++){
            result[i] = paints[i];
        }
        return result;
    }

    function getPurchasedPaintIds(address buyer) public view returns (uint[] memory){
        uint[] memory purchasedIds = purchasedPaints[buyer];
        return purchasedIds;
    }

    function getPurchasedPaints(address buyer) public view returns (Paint[] memory){
        uint[] memory purchasedIds = purchasedPaints[buyer];
        Paint[] memory purchasedPaintsArray = new Paint[](purchasedIds.length);

        for(uint i= 0; i< purchasedIds.length; i++){
            purchasedPaintsArray[i] = paints[purchasedIds[i]];
        }
        return purchasedPaintsArray;
    }      
    
}
