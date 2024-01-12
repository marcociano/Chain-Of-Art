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

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
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

            return App.setPaintPrices();
        });

        return App.bindEvents();
    },

    setPaintPrices: function () {
        try {
          App.contracts.PaintContract.deployed().then(function (paintInstance) {
            var data = $.getJSON('paints.json');
            for (var i = 0; i < data.length; i++) {
              var price = data[i].prezzo;
              paintInstance.setPaintPrice(data[i].id, web3.utils.toWei(price.toString(), 'ether'), { from: account });
            }
          });
        } catch (err) {
          console.log(err.message);
        }
      },



    bindEvents: function () {
        $(document).on('click', '.btn-purchase', App.handlePurchase);
    },

    markPurchased: function () {
        var paintInstance;
        App.contracts.PaintContract.deployed().then(function (instance) {
          paintInstance = instance;
      
          return paintInstance.getBuyers();
        }).then(function (buyers) {
          for (var i = 0; i < buyers.length; i++) {
            if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
              $('.card_box').eq(i).find('button').text('Acquistato').attr('disabled', true);
            }
          }
        }).catch(function (err) {
          console.log(err.message);
        });
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
      
            return paintInstance.paintPrices.call(paintId);
          }).then(function (paintPrice) {
            return paintInstance.buyPainting(paintId, { from: account, value: paintPrice});
          }).then(function (result) {
            alert("Quadro Acquistato");
      
            // Aggiorna la tabella con i dettagli del quadro acquistato
            App.updatePurchasedTable(paintId);
            window.location.reload();
          }).catch(function (err) {
            console.error(err.message);
          });
        });
      },
      

    updatePurchasedTable: function (paintId) {
        var paintInstance;
        App.contracts.PaintContract.deployed().then(function(instance){
            paintInstance = instance;
    
            // Ottieni le informazioni del quadro appena acquistato
            return paintInstance.getPaintDetails(paintId);
        }).then(function(result){
            var buyer = result[0];
            var price = result[1];
            var isPurchased = result[2];
    
            // Aggiorna la tabella con le informazioni del quadro appena acquistato
            var purchasedTable = $('#paintPurchased');
            var newRow = '<tr><th scope="row">' + paintId +
                '</th><td><img src="' + $('.card_box').eq(paintId).find('.paint-image').attr('src') +
                '" class="img-fluid w-50"></td><td>' + $('.card_box').eq(paintId).find('.paint-title').text() +
                '</td><td>' + price +
                '</td><td>' + $('.card_box').eq(paintId).find('.artist-name').text() +
                '</td><td>' + (isPurchased ? 'Acquistato' : 'Non acquistato') +
                '</td></tr>';
    
            purchasedTable.append(newRow);
        }).catch(function(err){
            console.log(err.message);
        });
    },
};


$(function () {
    $(window).load(function () {
        App.init();
    });
});