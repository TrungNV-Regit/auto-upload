import { Octokit } from "octokit"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

class FileHander {
    constructor(repoOwner, repoName) {
        dotenv.config()
        this.repoOwner = repoOwner
        this.repoName = repoName
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    }

    async downloadFilesFromPR(pullNumber) {
        try {
            const { data } = await this.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
                owner: this.repoOwner,
                repo: this.repoName,
                pull_number: pullNumber,
            })

            const rootDirectory = dirname(fileURLToPath(import.meta.url))
            fs.rmSync(path.join(rootDirectory, this.repoName), { recursive: true, force: true })

            for (const file of data) {
                const { filename, raw_url } = file

                const dir = path.join(rootDirectory, this.repoName, path.dirname(filename))
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }
                const response = await this.octokit.request(`GET ${raw_url}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                        Cookie: process.env.COOKIE,
                    },
                })
                fs.writeFileSync(path.join(dir, path.basename(filename)), response.data)
                console.log(`Downloaded: ${filename}`)
            }
        } catch (error) {
            console.error("Error downloading files:", error)
        }
    }
}

export default FileHander
