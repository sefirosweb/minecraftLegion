import path from 'path'
import { exec } from "child_process"
import { autoRestart, environment } from "@/config";

export const startBot = (botName: string, password?: string) => {
    const command = environment === 'stage' ? `npm run ts ${botName} ${password ?? ''}` : `node ${path.join(__dirname, 'start_bot.js')} ${botName} ${password ?? ''}`

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log(`Bot broken: ${botName}`);
            console.log(`Error: ${err}`);

            if (autoRestart) {
                setTimeout(() => {
                    startBot(botName, password);
                }, 1000);
            }
            return;
        }

        if (stdout) {
            console.log(`Stdout: ${stdout}`);
        }

        if (stderr) {
            console.log(`Stderr: ${stderr}`);
        }
    })
}