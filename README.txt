Chain of Art - dApp
Prerequisiti
Prima di iniziare, assicurati di avere installato i seguenti strumenti:

Node.js e NPM: Puoi scaricare Node.js da <a src=https://nodejs.org/en>qui</a>.
Truffle: Trovi ulteriori informazioni e l'installazione su GitHub.
Ganache: Scarica l'applicazione GUI da qui.
Metamask: Installa l'estensione per il tuo browser da qui.
Passo 1: Clonare il Progetto
Per iniziare, clona il repository del progetto eseguendo il seguente comando:

git clone https://github.com/marcociano/Chain-Of-Art.git

Passo 2: Installare le Dipendenze

Dopo aver clonato il progetto, spostati nella directory del progetto e esegui il seguente comando per installare le dipendenze:

cd Chain-Of-Art
npm install

Passo 3: Avviare Ganache

Apri Ganache, l'applicazione GUI che hai precedentemente scaricato. Questo passo avvierà la tua blockchain locale.

Passo 4: Compilare e Distribuire il Contratto Intelligente

Per compilare e distribuire il contratto intelligente, esegui il seguente comando:

truffle migrate --reset

Ricorda di ripetere questo passo ogni volta che riavvii Ganache.

Passo 5: Configurare Metamask

Per configurare Metamask, segui questi passaggi:

Sblocca il tuo portafoglio Metamask.
Connettiti alla blockchain locale fornita da Ganache.
Importa un account da Ganache.

Passo 6: Avviare l'Applicazione Frontend

Infine, per avviare l'applicazione frontend, esegui il seguente comando:
shell
Copy code
npm run dev
Dopodiché, visita http://localhost:3000 nel tuo browser per utilizzare l'applicazione.
