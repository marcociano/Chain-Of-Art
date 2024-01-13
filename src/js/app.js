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

            App.updatePurchasedTable();
        });

        return App.bindEvents();
    },


    bindEvents: function () {
        $(document).on('click', '.btn-purchase', App.handlePurchase);
    },
/*
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
   */   

      setPaintPrices: function () {
        try {
          App.contracts.PaintContract.deployed().then(function (paintInstance) {
            var data = $.getJSON('paints.json');
            for (var i = 0; i < data.length; i++) {
              var price = data[i].prezzo;
              paintInstance.setPaintPrice(data[i].id, web3.toWei(price.toString(), 'ether'), { from: account });
            }
          });
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
      
            return paintInstance.buyPaint(paintId, { from: account});
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
        let paintInstance;
        var paintPurchased = $("#paintPurchased");
        var paintPurchasedTable = $("#paintPurchasedTable");
        var emptyImage = $("#emptyImage");

        web3.eth.getAccounts(function (error, accounts){
          if (error){
            console.log(error);
          }

          App.contracts.PaintContract.deployed().then(async function (instance){
            paintInstance = instance;

            var account = accounts[0];

            const purchasedPaintIds = await paintInstance.getBuyers(account);

            if(purchasedPaintIds.length === 0){
              paintPurchased.hide();
              paintPurchasedTable.hide();
              emptyImage.hide();
              return;
            }

            for (var i=0; i< purchasedPaintIds.length; i++){
              const paintId = purchasedPaintIds[i].toNumber();
              const paintDetails = await paintInstance.getPaintDetails(paintId);

              var id = paintDetails[0];
              var title = paintDetails[1];
              var img = paintDetails[2];
              var artist= paintDetails[3];
              var price = paintDetails[4];
              var status = paintDetails[5];

              var change = status ? "DISPONIBILE" : "ACQUISTATO";

              var paintsTemplate = "<tr><th>" + id + "</th><td><img src='" + img + "' alt='" + title + "' style='width: 300px; height: 200px; '></td><td>" + title + "</td><td>" + artist + "</td><td>" + price + "</td><td>" + change + "</td><td>";

              paintPurchased.append(paintsTemplate);
            }
        }).catch(function(err){
            console.log(err.message);
            console.log('Errore')
        });
    });
  }
}


$(function () {
    $(window).load(function () {
        App.init();
    });
});