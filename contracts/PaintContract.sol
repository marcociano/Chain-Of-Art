pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AcquistoQuadri {
    address public proprietario;
    uint256 public prossimoIDQuadro;

    struct Quadro {
        uint256 id;
        string nome;
        string autore;
        uint256 prezzo;
        bool disponibile;
    }

    mapping(uint256 => Quadro) public quadri;
    mapping(address => uint256[]) public quadriAcquistati;

    event AcquistoQuadro(address acquirente, uint256 idQuadro, string nomeQuadro, uint256 prezzo);

    constructor() {
        proprietario = msg.sender;
        prossimoIDQuadro = 1;
    }

    modifier soloProprietario() {
        require(msg.sender == proprietario, "Solo il proprietario puo' chiamare questa funzione");
        _;
    }

    function aggiungiQuadro(string memory nome, string memory autore, uint256 prezzo) external soloProprietario {
        /*Verifico che non esiste già un quadro con lo stesso id*/
        require(bytes(quadri[prossimoIDQuadro].nome).length == 0, "Un quadro con questo ID esiste gia'");

        quadri[prossimoIDQuadro] = Quadro(prossimoIDQuadro, nome, autore, prezzo, true);
        prossimoIDQuadro++;
    }

    function acquistaQuadro(uint256 idQuadro) external payable {
        Quadro storage quadro = quadri[idQuadro];
        
        // Gestione dell'esistenza del quadro
        require(bytes(quadro.nome).length > 0, "Il quadro non esiste");

        require(quadro.disponibile, "Il quadro non e' disponibile");
        require(msg.value >= quadro.prezzo, "Importo inviato non sufficiente per acquistare il quadro");

        //Gestione fondi in eccesso
        uint256 rimborso = msg.value - quadro.prezzo;
        if (rimborso > 0) {
            payable(msg.sender).transfer(rimborso);
        }

        // Trasferisci i fondi al proprietario
        proprietario.transfer(quadro.prezzo);

        // Aggiorna lo stato del quadro e dell'acquirente
        quadro.disponibile = false;
        quadriAcquistati[msg.sender].push(idQuadro);

        // Emetti l'evento di acquisto
        emit AcquistoQuadro(msg.sender, idQuadro, quadro.nome, quadro.prezzo);
    }

    function getQuadriAcquistati() external view returns (uint256[] memory) {
        return quadriAcquistati[msg.sender];
    }
}

