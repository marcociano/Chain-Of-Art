// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contratto per la gestione di una collezione di quadri digitali
contract PaintContract {
    uint public counterPaints;

    // Struttura di un singolo quadro
    struct Paint {
        uint id;
        string title;
        string img;
        string artist;
        string price;
        bool isSold;
    }

    // Mappatura degli ID dei quadri con i loro dettagli
    mapping (uint => Paint) public paints;

    // Mappatura degli indirizzi degli acquirenti con gli ID dei quadri acquistati
    mapping (address => uint[]) public purchasedPaints;

    // Evento emesso quando un quadro viene acquistato
    event purchasedPaint(address indexed buyer, uint indexed paintId);

    // Costruttore del contratto
    constructor() {
        counterPaints = 0;
        loadPaints();
    }

    function loadPaints() public {
        createPaint(0,"Distese Stellate", "img/ai1.jpeg", "Alessandro Vibrante", "0.33");
        createPaint(1,"Sinfonia di Spirali Cosmiche", "img/img_ia_1.png", "Marco Tessitore", "0.43");
        createPaint(2,"Il giorno", "img/ai2.jpeg", "Vittorio Formale", "0.26");
        createPaint(3,"Equilibrio Astratto", "img/ai3.jpeg", "Silvio Baratta", "0.47");
        createPaint(4,"L'Eden", "img/ai4.jpeg", "Gioele Patternato", "0.22");
        createPaint(5,"Alba dorata nel paese", "img/img_ia_2.png", "Leonardo Luminoso", "0.14");
        createPaint(6,"Tempesta Solare sulle Cime Eterne", "img/img_ia_3.png", "Flavio Sogno", "0.15");
        createPaint(7,"Allegria del Villaggio", "img/ai5.jpeg", "Bruno Elementare", "0.47");
        createPaint(8,"Liberta'", "img/ai6.jpeg", "Angelo Romano", "0.47");
        createPaint(9,"Fioritura del Sentimento", "img/ai7.jpeg", "Francesco Prete", "0.41");  
        createPaint(10,"Il volo", "img/ai8.jpeg", "Luca Cecchino", "0.37");
    }

    // Funzione per creare un nuovo quadro nella collezione
    function createPaint(
        uint id,
        string memory title,
        string memory img,
        string memory artist,
        string memory price 
    ) public {
        require(paints[id].id == 0, "Quadro con lo stesso ID gia' esistente");

        paints[id] = Paint(
            id,
            title,
            img,
            artist,
            price,
            false
        );
        counterPaints++;
    }

    // Funzione per ottenere i dettagli di un quadro dato il suo ID
    function getPaintDetails(uint paintId) public view returns (
        uint id,
        string memory title,
        string memory img,
        string memory artist,
        string memory price,
        bool isSold 
    ){
        Paint storage paint = paints[paintId];
        return (
            paint.id,
            paint.title,
            paint.img,
            paint.artist,
            paint.price,
            paint.isSold
        );
    }

    // Funzione per acquistare un quadro
    function buyPaint(uint paintId) public payable {
        Paint storage paint = paints[paintId];

        // Verifica se il quadro è disponibile
        require(!paint.isSold, "Il quadro non e' disponibile");

        // Verifica se l'utente ha già acquistato questo quadro
        require(!purchasedStatus(msg.sender, paintId), "Hai gia' comprato questo quadro");

        // Aggiungi l'ID del quadro agli acquisti dell'utente
        purchasedPaints[msg.sender].push(paintId);

        // Emetti l'evento per registrare l'acquisto
        emit purchasedPaint(msg.sender, paintId);
    }

    // Funzione di supporto per verificare se un utente ha già acquistato un quadro
    function purchasedStatus(address buyer, uint paintId) internal view returns (bool) {
        uint[] storage purchasedIds = purchasedPaints[buyer];
        for (uint i = 0; i < purchasedIds.length; i++) {
            if (purchasedIds[i] == paintId) {
                return true;
            }
        }
        return false;
    }

    // Funzione per ottenere gli ID dei quadri acquistati da un utente
    function getPurchasedPaintIds(address buyer) public view returns (uint[] memory){
        uint[] memory purchasedIds = purchasedPaints[buyer];
        return purchasedIds;
    }

    // Funzione per ottenere i dettagli dei quadri acquistati da un utente
    function getPurchasedPaints(address buyer) public view returns (Paint[] memory){
        uint[] memory purchasedIds = purchasedPaints[buyer];
        Paint[] memory purchasedPaintsArray = new Paint[](purchasedIds.length);

        for(uint i= 0; i< purchasedIds.length; i++){
            purchasedPaintsArray[i] = paints[purchasedIds[i]];
        }
        return purchasedPaintsArray;
    }      
}
