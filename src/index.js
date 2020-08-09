'use strict'

const { Client, Intents } = require('discord.js')
const fetch = require('node-fetch').default

const client = new Client({
  ws: {
    intents: Intents.NON_PRIVILEGED
  }
})

client.on('message', message => {
  if (message.author.bot || message.system) return

  const highlightedLinks = [...message.content.matchAll(/https?:\/\/github\.com\/(?<owner>.*)\/(?<repo>.*)\/blob\/(?<branch>.*?)\/(?<path>.*)#L(?<firstLine>[0-9]+)-?L?(?<lastLine>[0-9]+)?/gu)]
    .map(result => result.groups)
  
  Promise.all(highlightedLinks.map(value => fetch(`https://gh-highlighted-line.vercel.app/api/${value.owner}/${value.repo}/${value.branch}/${encodeURIComponent(value.path)}/${value.firstLine}/${value.lastLine ?? ''}`)))
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(contents => contents.filter(content => content.code.length))
    .then(contents => Promise.all(contents.map(content => message.reply(content.code.join('\n'), { code: content.extension ?? 'livecodeserver', split: true }))))
    .catch(error => message.reply(error.message, { code: 'js' }))
})

client.login()
  .catch(console.error)
