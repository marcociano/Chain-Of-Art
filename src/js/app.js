App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        $.getJSON('paints.json', function (data) {
            console.log(data)
            var paintsRow = $('#paintsRow');
            var paintsTemplate = $('#paintsTemplate');

            for (i = 0; i < data.length; i++) {
                var newCard = paintsTemplate.find('.card_box').clone();
                newCard.find('.paint-title').text(data[i].nome);
                newCard.find('.paint-image').attr('src', data[i].immagine);
                newCard.find('.artist-name').text(data[i].artista);
                newCard.find('.paint-price').text(data[i].prezzo);
                newCard.find('.btn-purchase').attr('data-id', data[i].id);

                paintsRow.append(newCard);
            }
        });
        return App.initWeb3();
        
    },

    listenForEvents: function () {
        App.contracts.PaintContract.deployed().then(function (instance) {
            instance.PaintPurchased({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function (error, event) {
                console.log("evento catturato", event);
                // Aggiorna la tabella degli acquisti qui
                App.updatePurchasedTable(event.args.paintId, event.args.buyer);
            });
        }).catch(function (err) {
            console.error(err);
        });
    },

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.request({ method: "eth_requestAccounts" });;
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        
        return App.initContract();
    },

    initContract: function () {
        $.getJSON('PaintContract.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var paintArtifact = data;
            App.contracts.PaintContract = TruffleContract(paintArtifact);

            // Set the provider for our contract
            App.contracts.PaintContract.setProvider(App.web3Provider);
           
            // Ascolta gli eventi dopo l'inizializzazione del contratto
            App.listenForEvents();

            return App.markPurchased();
        });

        return App.bindEvents();
    },

    setPaintPrices: async function (paintInstance) {
        try {
            // Carica i dati in modo asincrono
            var data = await $.getJSON('paints.json');
    
            for (var i = 0; i < data.length; i++) {
                var price = data[i].prezzo;
    
                // Verifica che il prezzo sia maggiore di zero e sia un numero valido
                if (price <= 0 || isNaN(price)) {
                    console.error("Prezzo non valido per il quadro con ID:", i);
                    continue; // Salta questo quadro e continua con il successivo
                }
    
                var priceInWei = web3.utils.toWei(price.toString(), 'ether');
                await paintInstance.setPaintPrice(i, priceInWei, { from: account });
            }
        } catch (err) {
            console.error("Errore nel caricamento dei dati o nella conversione: ", err.message);
        }
    },
    

    bindEvents: function () {
        $(document).on('click', '.btn-purchase', App.handlePurchase);
    },

    // Handle paint purchase
    markPurchased: function () {
        try {
            var paintInstance = App.contracts.PaintContract.deployed();
            var buyer = paintInstance.getPaints.call();
    
            // Verifica che l'array buyer non sia vuoto
            if (buyer && buyer.length > 0) {
                for (var i = 0; i < buyer.length; i++) {
                    if (buyer[i] !== '0x0000000000000000000000000000000000000000') {
                        $('.card_box').eq(i).find('button').text('Acquista').attr('disabled', true);
                        App.updatePurchasedTable(i);
                    }
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    },
    
    updatePurchasedTable: function (paintId) {
        try {
            var paintInstance = App.contracts.PaintContract.deployed();
            var paint = paintInstance.getPaint(paintId);
    
            // Aggiorna la tabella con le informazioni del quadro acquistato
            var purchasedTable = $('#paintPurchased');
            var newRow = '<tr><th scope="row">' + paintId +
                '</th><td><img src="' + $('.card_box').eq(paintId).find('.paint-image').attr('src') +
                '" class="img-fluid w-50"></td><td>' + paint.title +
                '</td><td>' + paint.price +
                '</td><td>' + paint.artist +
                '</td><td>Acquistato</td></tr>';
    
            purchasedTable.append(newRow);
        } catch (err) {
            console.log(err.message);
        }
    },
    

    handlePurchase: function (event) {
        event.preventDefault();
    
        var paintId = parseInt($(event.target).data('id'));
    
        var paintInstance;
    
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.error(error);
            }
    
            var account = accounts[0];
            App.contracts.PaintContract.deployed().then(function (instance) {
                paintInstance = instance;
    
                // Recupera il prezzo del quadro
                return paintInstance.paintPrices.call(paintId);
            }).then(function (paintPrice) {
                // Esegui la funzione di acquisto con il prezzo corretto
                return paintInstance.purchasePaint(paintId, { from: account, value: paintPrice });
            }).then(function (result) {
                alert("Quadro Acquistato");
                window.location.reload();
            }).catch(function (err) {
                console.error(err.message);
            });
        });
    }


      
};


$(function () {
    $(window).load(function () {
        App.init();
    });
});
