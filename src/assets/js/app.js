// Oggetto principale per inizializzare e interagire con la blockchain e gli smart contract
App = {

    web3Provider: null,
    contracts: {},

    // Inizializza l'applicazione configurando il provider Web3
    init: async function () {
        return await App.initWeb3();
    },

    // Configura il provider Web3 a seconda dell'ambiente
    initWeb3: async function () {
        // Se window.ethereum è disponibile (browser dapp moderni), lo usa come provider
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Richiede l'accesso all'account
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                // L'utente ha negato l'accesso all'account
                console.error("Accesso all'account negato dall'utente")
            }
        }
        // Browser dapp tradizionali (legacy)
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // Se non viene rilevata nessuna istanza web3 iniettata, ricorre a Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    // Carica il JSON del contratto e configura il contratto con il provider
    initContract: function () {
        $.getJSON('PaintContract.json', function (data) {
            // Una volta recuperati i dati JSON, vengono assegnati alla variabile
            var PaintArtifact = data;
            App.contracts.PaintContract = TruffleContract(PaintArtifact);

            // Imposta il provider per il nostro contratto
            App.contracts.PaintContract.setProvider(App.web3Provider);

            loadPaint();
            loadExecutedPaint();
        });

        return App.bindEvents();
    },

    // Associa gli eventi ai pulsanti
    bindEvents: function () {
        // Associa l'evento di clic a tutti i pulsanti 'Acquista'
        $(document).on('click', '[id^=pulsante_acq_]', App.handlePurchase);

        // Associa l'evento di clic al pulsante 'Effettua l'acquisto'
        $(document).on('click', '.btn.btn-light.font-weight-bold', App.completePurchase);
    },

    // Funzione per gestire l'acquisto quando si clicca su 'Acquista'
    handlePurchase: function (event) {
        event.preventDefault();
        // TO DO (logica per l'acquisto del quadro)
        // ...
    },

    // Funzione per gestire l'azione quando si clicca su 'Effettua l'acquisto'
    completePurchase: function (event) {
        event.preventDefault();
        // TO DO (logica per completare l'acquisto e visualizzare i quadri acquistati)
        // ...
    },

    

};
