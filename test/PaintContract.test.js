const truffleAssert = require('truffle-assertions');
const PaintContract = artifacts.require("PaintContract");
contract('PaintContract', (accounts) => {
  let paintContract;

  before(async () => {
    paintContract = await PaintContract.new({ from: accounts[0] });
  });

  it('should create a new paint', async () => {
    const paintId = 11;
    const title = 'Test Paint';
    const img = '/test.jpg';
    const artist = 'Test Artist';
    const price = '0.18';

    await paintContract.createPaint(paintId, title, img, artist, price);

    const paintDetails = await paintContract.getPaintDetails(paintId);

    assert.equal(paintDetails.id, paintId, 'ID incorrect');
    assert.equal(paintDetails.title, title, 'Title not set correctly');
    assert.equal(paintDetails.img, img, 'Image not set correctly');
    assert.equal(paintDetails.artist, artist, 'Artist not set correctly');
    assert.equal(paintDetails.price, price, 'Price not set correctly');
    assert.equal(paintDetails.isSold, false, 'isSold not set correctly');
  });

  it('should allow buying a paint', async () => {
    const paintId = 11;
    const buyer = accounts[1];

    // Acquista il quadro
    await paintContract.buyPaint(paintId, { from: buyer, value: web3.utils.toWei('0.18', 'ether') });

    // Ottieni i dettagli del quadro
    const paintDetails = await paintContract.getPaintDetails(paintId);

    // Assicurati che il quadro sia contrassegnato come venduto
    assert.equal(paintDetails.isSold, true, 'Il quadro è stato contrassegnato come venduto dopo l\' acquisto');

    // Verifica che il quadro sia presente tra quelli acquistati dall'utente
    const purchasedPaints = await paintContract.getPurchasedPaints(buyer);
    assert.equal(purchasedPaints.length, 1, 'Il quadro non è stato acquistato con successo');
    const purchasedPaint = purchasedPaints[0];
    assert.equal(purchasedPaint.id, paintId, 'ID del quadro non corretto');
  });


  it('should prevent buying the same paint twice', async () => {
    const paintId = 11;
    const buyer = accounts[1];

    // Tenta di acquistare lo stesso quadro di nuovo e cattura l'errore
    try {
      await paintContract.buyPaint(paintId, { from: buyer, value: web3.utils.toWei('0.18', 'ether') });
      assert.fail("Dovrebbe generare un errore");
    } catch (error) {
      assert(error.message.includes("Il quadro non e' disponibile"), "Messaggio di errore errato");
    }
  });

});


