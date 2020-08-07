'use strict'

const { Client, Intents } = require('discord.js')
const fetch = require('node-fetch').default

const client = new Client({
  ws: {
    intents: Intents.NON_PRIVILEGED
  }
})

client.on('message', message => {
  const HIGHLIGHTED_URL_PATTERN = /http(?:s):\/\/github\.com\/(?<owner>.*)\/(?<repo>.*)\/blob\/(?<branch>.*?)\/(?<path>.*)#L(?<firstLine>[0-9]+)-?L?(?<lastLine>[0-9]+)?/gu
  let result

  if (message.author.bot || message.system) return

  while ((result = HIGHLIGHTED_URL_PATTERN.exec(message.content)) !== null) {
    const {
      owner,
      repo,
      branch,
      path,
      firstLine,
      lastLine
    } = result.groups

    fetch(`https://gh-highlighted-line.vercel.app/api/${owner}/${repo}/${branch}/${encodeURIComponent(path)}/${firstLine}/${lastLine ?? ''}`)
      .then(response => response.json())
      .then(response => message.reply(response.code.join('\n'), { code: response.extension ?? 'livecodeserver', split: true }))
      .catch(console.error)
  }
})

client.login()
  .catch(console.error)
