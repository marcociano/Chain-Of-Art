const PaintContract = artifacts.require("PaintContract");
contract('PaintContract', (accounts) => {
    let paintContract;

    before(async () => {
        paintContract = await PaintContract.new({from: accounts[0]});
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
        assert.equal(paintDetails.status, true, 'Status not set correctly');
    });

    it('should allow buying a paint', async () => {
        const paintId = 11;
        const buyer = accounts[1];
    
        await paintContract.createPaint(paintId, "Test Paint", "Test Image", "Test Artist", "0.18");
    
        await paintContract.buyPaint(paintId, { from: buyer, value: web3.toWei('0.18', 'ether') });
    
        const purchasedPaints = await paintContract.getPurchasedPaints(buyer);
    
        assert.equal(purchasedPaints.length, 1, 'Paint not purchased successfully');
    
        const purchasedPaint = purchasedPaints[0];
    
        assert.equal(purchasedPaint.id, paintId, 'Paint Id is incorrect');
    });
    

    it('should prevent buying the same paint twice', async () => {
        const paintId = 11;

        await paintContract.createPaint(paintId, "Test Paint", "Test Image", "Test Artist", "0.18");

        try {
          await paintContract.createPaint(paintId, "Duplicate Paint", "Duplicate Image",  "Duplicate Artist", "0.18");
          assert.fail("Should have thrown an error");
        } catch (error) {
          assert(error.message.includes("Quadro con lo stesso ID gia' esistente"), "Wrong error message");
        }
      });
    
    });
    
