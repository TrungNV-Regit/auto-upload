import FTPClient from './FTPClient.js';
import FileHander from "./FileHander.js"
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
function askQuestion(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    const owner = await askQuestion('Enter owner: ')
    const repoName = await askQuestion('Enter repoName: ')
    const pullNumber = await askQuestion('Enter pull_number: ')
    const fileHander = new FileHander(owner, repoName)
    await fileHander.downloadFilesFromPR(pullNumber)
    const client = new FTPClient()
    const permissions = 755
    await client.upload(repoName, '/htdocs/mof', permissions)
    rl.close()
}
main()
