const { spawn } = require('child_process');
const createHandler = require('github-webhook-handler');

const handler = createHandler({path: '/webhook', secret: 'yan616563259'});


// 这里是监听到git push 后的回调函数
function runGitShell(cmd, args, callback) {
    const gitChild = spawn(cmd, args);
    var response = '';
    gitChild.stdout.on('data', buffer => response += buffer.toString())
    gitChild.stderr.on('end', () => callback(response));
 }

handler.on('error', err => console.log(`Error: ${err}`))

handler.on('push', e => {
    console.log(`receoved a push event, ${e.payload.repository.name}`);
    runGitShell('sh', ['./deploy.sh'], (txt) => console.log(txt));
})


module.exports = handler;