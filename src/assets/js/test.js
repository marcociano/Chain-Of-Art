const PaintContract = artifacts.require("PaintContract");

PaintContract("PaintContract", (accounts) =>{
    let paintContract;

    beforeEach(async ()=>{
        paintContract = await PaintContract.new({ from:accounts[0]});
    });

    it("deve essere creato un nuovo quadro", async()=>{
        const paintId = 23;
        const nome = "La notte";
        const autore = "Roberto Bolla";

        // Definizione del prezzo in ether e conversione in wei
        const prezzoInEther = 0.37215673689906814;
        const prezzo = web3.utils.toWei(prezzoInEther.toString(), "ether");

        const disponibile = true;

        await paintContract.createPaint(paintId, nome, autore, prezzo, disponibile);

        const result = await paintContract.getDettagliQuadro(paintId);

        assert.equal(result.id, paintId, "ID inesatto");
        assert.equal(result.nome, nome, "Nome inesatto");
        assert.equal(result.autore, autore,"Autore inesatto");
        assert.equal(result.prezzo, prezzo, "Prezzo inesatto");
        assert.equal(result.disponibile, disponibile, "Disponibilità inesatta");
    });

    it("Dovrebbe completare l'acquisto", async () =>{
        const paintId = 23;
        const signer = accounts[1];

        await paintContract.createPaint(paintId, "Test Acquisto","Test nome", "Test autore", "Test prezzo","Test disponibile");
        
        //Da continuare
    })
})