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
        await window.ethereum.request({ method: "eth_requestAccounts" });
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
      updatePurchasedTable();
    });

    return App.bindEvents();
  },


  bindEvents: function () {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
  },


  handlePurchase: function (event) {
    event.preventDefault();
    console.log("Handle Purchase Called");
    var paintId = parseInt($(event.target).data('id'));
    var paintInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.error(error);
      }

      var account = accounts[0];
      App.contracts.PaintContract.deployed().then(function (instance) {
        paintInstance = instance;

        var gasLimit = 200000;
        // Retrive paint'sprice from DOM
        var paintPrice = parseFloat($(event.target).closest('.card_box').find('.paint-price').text());

        // Convert the price in Wei (1 ether = 10^18 wei)
        var priceInWei = web3.toWei(paintPrice.toString(), 'ether');

        console.log("Attempting to buy paint with ID: ", paintId);

        return paintInstance.buyPaint(paintId, { from: account, value: priceInWei, gas: gasLimit });
      }).then(function (result) {
        console.log("Transaction successful:", result);
        alert("Quadro Acquistato");
        window.location.reload();
      }).catch(function (err) {
        if (err.message.includes("Hai gia' comprato questo quadro")) {
          alert("Transazione Fallita: Hai gia' acquistato questo quadro");
        } else {
          alert("Transazione Fallita");
          console.log(err.message);
        }
      });
    });
  }
}


$(function() {
    $(window).load(function () {
      App.init();
    });
  });


  function updatePurchasedTable() {
  let paintInstance;
  var paintPurchased = $("#paintPurchased");
  var paintPurchasedTable = $("#paintPurchasedTable");
  var emptyImage = $("#emptyImage");

  web3.eth.getAccounts(function (error, accounts) {
    if (error) {
      console.log(error);
    }

    App.contracts.PaintContract.deployed().then(async function (instance) {
      paintInstance = instance;

      var account = accounts[0];

      const purchasedPaintIds = await paintInstance.getPurchasedPaintIds(account);

      if (purchasedPaintIds.length === 0) {
        paintPurchased.hide();
        paintPurchasedTable.hide();
        emptyImage.show();
        return;
      }

      for (var i = 0; i < purchasedPaintIds.length; i++) {
        const paintId = purchasedPaintIds[i].toNumber();
        const paintDetails = await paintInstance.getPaintDetails(paintId);

        var id = paintDetails[0];
        var title = paintDetails[1];
        var img = paintDetails[2];
        var artist = paintDetails[3];
        var price = paintDetails[4];
        var isSold = paintDetails[5];

        var status = isSold ? "ACQUISTATO" : "DISPONIBILE";

        var paintsTemplate = "<tr><th style='color: #DBB962'>" + id + "</th><td><img src='" + img + "' alt='" + title + "' style='width: 300px; height: 300px; '></td><td style='color: #DBB962'>" + title + "</td><td style='color: #DBB962'>" + artist + "</td><td style='color: #DBB962'>" + price + " ETH" + "</td><td style='color: #DBB962'>" + status;

        paintPurchased.append(paintsTemplate);
      }
    }).catch(function (err) {
      console.log(err.message);
      console.log('Errore')
    });
  });
}