const PaintContract = artifacts.require('PaintContract');
const truffleAssert = require('truffle-assertions');

contract('PaintContract', (accounts) => {
    let paintContract;

    before(async () => {
        paintContract = await PaintContract.new();
    });

    it('should create a new paint', async () => {
        const paintId = 1;
        const title = 'Test Paint';
        const img = 'test.jpg';
        const artist = 'Test Artist';
        const price = 1;

        await paintContract.createPaint(paintId, title, img, artist, price);

        const paintDetails = await paintContract.getPaintDetails(paintId);

        assert.equal(paintDetails.title, title, 'Title not set correctly');
        assert.equal(paintDetails.img, img, 'Image not set correctly');
        assert.equal(paintDetails.artist, artist, 'Artist not set correctly');
        assert.equal(paintDetails.price, price, 'Price not set correctly');
        assert.equal(paintDetails.status, true, 'Status not set correctly');
    });

    it('should allow buying a paint', async () => {
        const paintId = 1;
        const buyer = accounts[1];

        await paintContract.buyPaint(paintId, { from: buyer, value: web3.utils.toWei('1', 'ether') });

        const purchasedIds = await paintContract.getPurchasedPaintIds(buyer);

        assert.include(purchasedIds, paintId, 'Paint not purchased successfully');

        const paintDetails = await paintContract.getPaintDetails(paintId);

        assert.equal(paintDetails.status, false, 'Paint status not updated after purchase');
    });

    it('should prevent buying the same paint twice', async () => {
        const paintId = 1;
        const buyer = accounts[1];

        await truffleAssert.reverts(
            paintContract.buyPaint(paintId, { from: buyer, value: web3.utils.toWei('1', 'ether') }),
            'Hai gia\' comprato questo quadro'
        );
    });

});
