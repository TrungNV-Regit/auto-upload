import fs from "fs"
import ftp from 'basic-ftp'
import path from "path"
import dotenv from "dotenv"

class FTPClient {
    constructor() {
        dotenv.config()
        this.client = new ftp.Client()
        this.settings = {
            host: process.env.SERVER,
            port: 21,
            user: process.env.USER,
            password: process.env.PASSWORD,
            secure: true
        }
    }

    upload(sourcePath, remotePath, permissions) {
        const files = fs.readdirSync(sourcePath)
        let self = this;
        (async () => {
            try {
                await self.client.access(self.settings)
                for (const file of files) {
                    const localFilePath = path.join(sourcePath, file);
                    const remoteFilePath = path.join(remotePath, file);
                    const stat = fs.statSync(localFilePath)
                    if (stat.isDirectory()) {
                        await self.client.ensureDir(remoteFilePath)
                        await self.upload(localFilePath, remoteFilePath, permissions)
                    } else {
                        await self.client.upload(fs.createReadStream(sourcePath), remotePath)
                        await self.changePermissions(permissions.toString(), remotePath)
                        console.log(`Uploaded: ${localFilePath} to ${remoteFilePath}`)
                    }
                }
            } catch (err) {
                console.log(err)
            }
            self.client.close()
        })()
    }

    close() {
        this.client.close()
    }

    changePermissions(perms, filepath) {
        let cmd = 'SITE CHMOD ' + perms + ' ' + filepath
        return this.client.send(cmd, false)
    }
}

export default FTPClient
