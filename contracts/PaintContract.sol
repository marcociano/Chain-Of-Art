// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contratto per gestire l'acquisto di quadri
contract AcquistoQuadri {
    address public proprietario; // Indirizzo del proprietario del contratto
    uint256 public prossimoIDQuadro; // Contatore per l'ID del prossimo quadro

    // Struttura dati per rappresentare un quadro
    struct Quadro {
        uint256 id;       // ID unico per il quadro
        string nome;      // Nome del quadro
        string autore;    // Nome dell'autore del quadro
        uint256 prezzo;   // Prezzo del quadro
        bool disponibile; // Disponibilità del quadro per l'acquisto
    }

    // Mapping per collegare un ID di quadro alla sua struttura
    mapping(uint256 => Quadro) public quadri;

    // Mapping per tenere traccia dei quadri acquistati da ciascun utente
    mapping(address => uint256[]) public quadriAcquistati;

    // Evento emesso quando un quadro viene acquistato
    event AcquistoQuadro(address acquirente, uint256 idQuadro, string nomeQuadro, uint256 prezzo);

    // Costruttore per impostare il proprietario e inizializzare l'ID del quadro
    constructor() {
        proprietario = msg.sender; // Imposta il mittente del messaggio come proprietario
        prossimoIDQuadro = 1;      // Inizia il conteggio degli ID da 1
    }

    // Modifier per permettere solo al proprietario di eseguire certe funzioni
    modifier soloProprietario() {
        require(msg.sender == proprietario, "Solo il proprietario puo' chiamare questa funzione");
        _;
    }

    // Funzione per aggiungere un nuovo quadro al contratto
    function aggiungiQuadro(string memory nome, string memory autore, uint256 prezzo) external soloProprietario {
        // Controlla che non esista già un quadro con lo stesso ID
        require(bytes(quadri[prossimoIDQuadro].nome).length == 0, "Un quadro con questo ID esiste gia'");

        // Crea un nuovo quadro e aggiorna il contatore ID
        quadri[prossimoIDQuadro] = Quadro(prossimoIDQuadro, nome, autore, prezzo, true);
        prossimoIDQuadro++;
    }

    // Funzione per acquistare un quadro
    function acquistaQuadro(uint256 idQuadro) external payable {
        Quadro storage quadro = quadri[idQuadro];

        // Controlli per assicurare che il quadro esista, sia disponibile e che il pagamento sia sufficiente
        require(bytes(quadro.nome).length > 0, "Il quadro non esiste");
        require(quadro.disponibile, "Il quadro non e' disponibile");
        require(msg.value >= quadro.prezzo, "Importo inviato non sufficiente per acquistare il quadro");

        /*// Controlla se l'utente ha già acquistato questo quadro
        for (uint256 i = 0; i < quadriAcquistati[msg.sender].length; i++) {
            require(quadriAcquistati[msg.sender][i] != idQuadro, "Hai già acquistato questo quadro");
        } */
        
        // Gestione di eventuali fondi inviati in eccesso
        uint256 rimborso = msg.value - quadro.prezzo;
        if (rimborso > 0) {
            payable(msg.sender).transfer(rimborso);
        }

        // Trasferimento dei fondi al proprietario e aggiornamento dello stato del quadro
        proprietario.transfer(quadro.prezzo);
        quadro.disponibile = false;
        quadriAcquistati[msg.sender].push(idQuadro);

        // Emissione dell'evento di acquisto
        emit AcquistoQuadro(msg.sender, idQuadro, quadro.nome, quadro.prezzo);
    }

    // Funzione per ottenere la lista dei quadri acquistati da un utente
    function getQuadriAcquistati() external view returns (uint256[] memory) {
        return quadriAcquistati[msg.sender];
    }

    /*
    //Funzione per visualizzare i dettagli dei quadri
    function getDettagliQuadro(uint256 idQuadro) public view returns (Quadro memory) {
    require(quadri[idQuadro].id != 0, "Il quadro non esiste");
    return quadri[idQuadro];
    }

    //Funzione per elencare i quadri
    function getAllQuadri() public view returns (Quadro[] memory) {
        Quadro[] memory tuttiQuadri = new Quadro[](prossimoIDQuadro - 1);
        for (uint256 i = 1; i < prossimoIDQuadro; i++) {
            tuttiQuadri[i - 1] = quadri[i];
        }
    return tuttiQuadri;
    }

    //
    */
}
