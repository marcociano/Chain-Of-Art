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
    // Previene il comportamento di default del browser all'evento (es. invio di un form)
    event.preventDefault();
    
    // Recupera l'ID del prodotto dall'elemento che ha scatenato l'evento (es. un bottone)
    var paintId = parseInt($(event.target).data('id'));

    // Variabile per memorizzare l'istanza del contratto
    var paintInstance;

    // Ottiene gli account Ethereum disponibili nel browser dell'utente
    web3.eth.getAccounts(function (error, accounts){
        // Se c'è un errore, lo stampa nella console
        if(error){
            console.log(error);
        }

        // Utilizza il primo account disponibile
        var account = accounts[0];

        // Ottiene l'istanza del contratto PaintContract già distribuito
        App.contracts.PaintContract.deployed().then(function (instance){

            // Memorizza l'istanza del contratto
            paintInstance = instance;

            // Chiama la funzione completePurchase del contratto, passando l'ID del prodotto e l'account mittente
            return paintInstance.completePurchase(paintId, { from: account });
        }).then(function (result){
            // Mostra un messaggio di successo e ricarica la pagina se l'acquisto è completato
            alert("Acquisto effettuato");
            window.location.reload();
        }).catch(function(err){
            // Gestisce gli errori durante l'acquisto
            if (err.message.includes("Hai già completato l'acquisto")){
                // Se l'acquisto è già stato completato, mostra un messaggio specifico
                alert("Acquisto non effettuato perché già completato");
            }else{
                // Altrimenti, mostra un messaggio di errore generico
                alert("Acquisto non effettuato");
                console.log(err.message);
            }
        });
    });
},


    // Funzione per gestire l'azione quando si clicca su 'Effettua l'acquisto'
    completePurchase: function (event) {
        event.preventDefault();
        
        //Le mie variabili sono nome, cognome, fondazione, nome quadro, prezzo
        var nome = nameInput.value;
        var cognome = surnameInput.value;
        var organizzazione = foundationInput.value;
        var nomeQ = nQuadroInput.value;
        var costo = priceInput.value;

        //Verifico se qualche campo è vuoto
        if(nome === '' || cognome === '' || organizzazione === '' || nomeQ === '' || costo === ''){
            alert('Attenzione, compila tutti i campi.')
            return;
        }

        web3.eth.getAccounts(function (error, accounts) {

            if(error){
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.PaintContract.deployed().then(function (instance) {
                    paintInstance = instance;

                    return paintInstance.counterPaint();

            }).then(function counterPaint(){
                console.log(counterPaint);

                var paintId = parseInt(counterPaint) + 1;
                console.log(paintId);

                return paintInstance.createPaint(paintId,nome,cognome,organizzazione,nomeQ,costo, { from: account });
            }).then(function (result){

                alert("Acquisto effettuato con successo");

                //Resetto ora i campi

                nameInput.value = '';
                surnameInput.value = '';
                foundationInput.value = '';
                nQuadroInput.value = '';
                priceInput.value = '';

                    window.location.reload();                
            }).catch(function (err) {
                alert("Acquisto non andato a buon fine");
                console.log(err.message);
            });
    });

}

};

// Inizializza l'app al caricamento della finestra
$(function () {
    $(window).load(function () {
        App.init();
    });
});

// Carica e visualizza i quadri disponibili
function loadPaint(){
    let paintInstance;
    var paintRow = $('#paintRow');
    var paintTemplate = $('#paintTemplate'); // Template HTML per ogni quadro

    web3.eth.getAccounts(function (error, accounts){
        if(error){
            console.log(error);
        }

        App.contracts.PaintContract.deployed().then(function (instance){
            paintInstance = instance;

            var account = accounts[0];

            return paintInstance.counterPaint();
        }).then(function (counterPaint){
            // Itera attraverso tutti i quadri e li visualizza
            for (var i = 1; i <= counterPaint; i++ ){

                paintInstance.paint(i).then(function(paint){
                    // Estrazione dei dettagli del quadro
                    var id = paint[0];
                    var nome = paint[1];
                    var cognome = paint[2];
                    var organizzazione = paint[3];
                    var nomeQ = paint[4];
                    var costo = paint[5];

                    // Aggiorna il template con i dettagli del quadro
                    paintTemplate.find('.name').text(nome);
                    paintTemplate.find('.surname').text(cognome);
                    paintTemplate.find('.foundation').text(organizzazione);
                    paintTemplate.find('.nQuadro').text(nomeQ);
                    paintTemplate.find('.price').text(costo);

                    if (active){
                        paintTemplate.find('.btn btn-light font-weight-bold').show();
                        // TO DO
                    }else{
                        // TO DO
                    }
                    
                    paintRow.append(paintTemplate.html()); // Aggiunge il quadro alla pagina
                });
            }
        }).catch(function (err) {
            console.log(err.message);
            console.log('Errore');
        });
    });
}

// Carica e visualizza i quadri acquistati dall'utente
function loadSignedPaint(){
    let paintInstance;
    var paintSigned = $("#paintSigned");
    var templatepaintsigned = $("#tablepaintsigned");

    web3.eth.getAccounts(function (error, accounts){
        if(error){
            console.log(error);
        }

        App.contracts.PaintContract.deployed().then(async function (instance){
            paintInstance=instance;

            var account = accounts[0];

            const signedpaintIds= await paintInstance.loadSignedPaintIds(account);

            // Nascondi la sezione se non ci sono quadri acquistati
            if(signedpaintIds.length === 0){
                paintSigned.hide();
                templatepaintsigned.hide();
                return;
            }

            // Itera attraverso i quadri acquistati e li visualizza
            for(var i = 0; i < signedpaintIds.length; i++){
                const paintId = signedpaintIds[i].toNumber();
                const paintDetails = await paintInstance.getPaintDetails(paintId);

                var id = paintDetails[0];
                var nome = paintDetails[1];
                var cognome = paintDetails[2];
                var organizzazione = paintDetails[3];
                var nomeQ = paintDetails[4];
                var costo = paintDetails[5];

                var status = active ? "Attivo" : "Completato";

                // TO DO: logica per visualizzare i dettagli del quadro acquistato

                paintSigned.append(paintTemplate); // Aggiunge i dettagli alla pagina
            }
        }).catch(function (err) {
            console.log(err.message);
            console.log('Errore');
        });
    });
}
