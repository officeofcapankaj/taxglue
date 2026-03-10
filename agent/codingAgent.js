import fs from "fs"
import simpleGit from "simple-git"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const git = simpleGit()

async function runAgent(){

// read repository files
const files = fs.readdirSync("../modules")

let codebase = ""

files.forEach(file=>{
  const content = fs.readFileSync(`../modules/${file}`,"utf8")
  codebase += `\n\nFILE:${file}\n${content}`
})

// ask AI for improvement
const response = await openai.chat.completions.create({
model:"gpt-4o-mini",
messages:[
{
role:"system",
content:"You are a coding agent improving accounting software."
},
{
role:"user",
content:`Improve the following codebase and add accounting validation:\n${codebase}`
}
]
})

console.log(response.choices[0].message.content)

}

runAgent()
