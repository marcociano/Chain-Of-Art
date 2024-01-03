App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
       $.getJSON('../paints.json', function(data){
        var paintsRow = $('#paintsRow');
        var paintsTemplate = $('#paints-template');

        for(i=0; i< data.length; i++) {
            paintsTemplate.find('.paint-name').text(data[i].nome);
            paintsTemplate.find('paint-image').attr('src', data[i].immagine);
            paintsTemplate.find('.artist-name').text(data[i].artista);
            paintsTemplate.find('.paint-price').text(data[i].prezzo);
            paintsTemplate.find('.purchase').attr('data-id', data[i].id);

            paintsRow.append(paintsTemplate.html());
        }
       });
        return await App.initWeb3();
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

            loadPaint();
        });

        return App.bindEvents();
    },



    bindEvents: function () {
        $(document).on('click', '.purchase', App.handlePurchase);
    },

    // Handle petition signing
    handlePurchase: function (event) {
        event.preventDefault();

        var paintId = parseInt($(event.target).data('id'));

        var paintInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.PaintContract.deployed().then(function (instance) {
                PaintContract = instance;

                // Execute sign as a transaction by sending account
                return paintInstance.purchasePainting(paintId, { from: account });
            }).then(function (result) {
                alert("Quadro acquistato");
                 window.location.reload();
            }).catch(function (err) {
                if (err.message.includes("Hai già acquistato questo quadro!")) {
                    alert("Hai gia' acquistato questo quadro, acquistane un altro");
                } else {
                    alert("Errore: Quadro non acquistato");
                    console.log(err.message);
                }
            });
        });
    },

};




$(function () {
    $(window).load(function () {
        App.init();
    });
});

// Load all peints
function loadPaint() {
    let paintInstance;
    var paintsRow = $('#paintsRow');
    var paintsTemplate = $('#paints-template');

    web3.eth.getAccounts(function (error, accounts) {
        if (error) {
            console.log(error);
        }

        App.contracts.PaintContract.deployed().then(function (instance) {
            paintInstance = instance;

            var account = accounts[0];

            return paintInstance.counterPaints();
        }).then(function (counterpaints) {
            console.log(counterpaints);

            for (var i = 1; i <= counterpaints; i++) {
                paintInstance.paint(i).then(function (paint) {
                    var id = paint[0];
                    var nome = paint[1];
                    var immagine = paint[2];
                    var artista = paint[3];
                    var prezzo = paint[4];
                
                    paintsTemplate.find('.paint-name').text(nome);
                    paintsTemplate.find('.paint-image').attr('src', immagine);
                    paintsTemplate.find('.artist-name').text(artista);
                    paintsTemplate.find('.paint-price').text(prezzo);

                    if (active) {
                        paintsTemplate.find('.purchase').show();
                        paintsTemplate.find('.btn-success').hide();
                        paintsTemplate.find('.purchase').attr('data-id', id);
                    } else {
                        paintsTemplate.find('.purchase').hide();
                        paintsTemplate.find('.btn-success').show();
                    }

                    paintsRow.append(paintsTemplate.html());
                });
            }
        }).catch(function (err) {
            console.log(err.message);
            console.log('Errore');
        });
    });
}
/*
// Load signed petitions for the current account
function loadSignedPetitions() {
    let petitionInstance;
    var petitionSigned = $("#petitionSigned");
    var tablepetitionsigend = $("#tablepetitionsigend");
    var emptyImage = $("#emptyImage");

    web3.eth.getAccounts(function (error, accounts) {
        if (error) {
            console.log(error);
        }

        App.contracts.PetitionContract.deployed().then(async function (instance) {
            petitionInstance = instance;

            var account = accounts[0];

            // Execute getSignedPetitionIds
            const signedPetitionIds = await petitionInstance.getSignedPetitionIds(account);

            if (signedPetitionIds.length === 0) {
                // Se signedPetitionIds è vuoto, nascondi la tabella e mostra l'immagine
                petitionSigned.hide();
                tablepetitionsigend.hide();
                emptyImage.show();
                return;
            }
            // Iterate through signed petition IDs
            for (var i = 0; i < signedPetitionIds.length; i++) {
                // Execute getPetitionDetails for each signed petition
                const petitionId = signedPetitionIds[i].toNumber();
                const petitionDetails = await petitionInstance.getPetitionDetails(petitionId);

                var id = petitionDetails[0];
                var title = petitionDetails[1];
                var organizer = petitionDetails[2];
                var image = petitionDetails[3];
                var targetSignatures = petitionDetails[5];
                var numSignatures = petitionDetails[6];
                var active = petitionDetails[7];

                var status = active ? "ATTIVA" : "COMPLETATA";

                var petitionTemplate = "<tr><th>" + id + "</th><td><img src='" + image + "' alt='" + title + "' style='width: 300px; height: 200px;'></td><td>" + title + "</td><td>" + organizer + "</td><td>" + targetSignatures + "</td><td>" + numSignatures + "</td><td>" + status + "</td></tr>";

                petitionSigned.append(petitionTemplate);

            }
        }).catch(function (err) {
            console.log(err.message);
            console.log('Errore');
        });
    });
}
*/

