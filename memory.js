const sessions = {}

export function getMemory(session){

  if(!sessions[session]) sessions[session] = []

  return sessions[session]

}

export function saveMemory(session,question,answer){

  sessions[session].push({
    role:"user",
    content:question
  })

  sessions[session].push({
    role:"assistant",
    content:answer
  })

}
