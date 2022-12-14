const data = require('./teste.json');
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');

const login = {
    email: '',
    senha: ''
};

async function scrap({ page, data: { id } }) {
    console.log('Acessando pagina..')

    await page.goto('');
    console.log('Efetuando login...')

    const idInputEmail = await page.evaluate(() => {
        let container = document.querySelector('#__next > div > main > div > div > div > div > article > div.Container-sc-ka34zl-0.sc-x843fz-4.bkoBTS.cKusRt')
        let idEmailInputElement = container.children[0].children[0].children[1].children[0].id;
        return idEmailInputElement;
    })

    const idInputPass = await page.evaluate(() => {
        let container = document.querySelector('#__next > div > main > div > div > div > div > article > div.Container-sc-ka34zl-0.sc-x843fz-4.bkoBTS.cKusRt')
        let idPassInputElement = container.children[0].children[2].children[1].children[0].id;
        return idPassInputElement;
    })

    await page.type(`#${idInputEmail}`, login.email);
    await page.type(`#${idInputPass}`, login.senha);

    await page.click('#__next > div > main > div > div > div > div > article > div.Container-sc-ka34zl-0.sc-x843fz-4.bkoBTS.cKusRt > form > button');
    await page.waitForNavigation();

    await page.goto(``);

    let pessoa = await page.evaluate(() => {
        let nome = document.querySelector("#__next > div > div.BaseResumeContainer__Background-sc-1k73ln1-0.gDtBBJ > div > div.Row__StyledRow-sc-tx22b8-0.glhBdg.BaseResumeContainer__NoMarginRow-sc-1k73ln1-2.dYpoAg > div > div:nth-child(1) > div > div.Col-sc-o5r7t1-0.ResumeHeader__Container-sc-7jngfz-1.dNVyPR.jcupLF > h1 > b")
        let telefone = document.querySelector("#__next > div > div.BaseResumeContainer__Background-sc-1k73ln1-0.gDtBBJ > div > div.Row__StyledRow-sc-tx22b8-0.glhBdg.BaseResumeContainer__NoMarginRow-sc-1k73ln1-2.dYpoAg > div > div:nth-child(2) > div:nth-child(1) > p:nth-child(1)")

        return {
            nome: nome ? nome.textContent : "Confidencial",
            telefone: telefone ? telefone.textContent : "Confidencial"
        }
    })

    // /**Save CV in txt */
    fs.appendFile(``, JSON.stringify(pessoa), 'utf8', (err) => {
        if (err) {
            console.log('Some error occured - file either not saved or corrupted file saved.');
        } else {
            console.log('');
        }
    });

    console.log('Salvo pessoa id => ', id);
}

async function main() {

    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10,
    });

    await cluster.task(scrap);

    for (const id of data) {
        await cluster.queue({ id });
    }

    await cluster.idle();
    await cluster.close();
}

main();