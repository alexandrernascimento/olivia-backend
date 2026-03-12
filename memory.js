const sessions = {}

export function getMemory(session) {
  if (!sessions[session]) {
    sessions[session] = []
  }

  return sessions[session]
}

export function saveMemory(session, user, assistant) {
  if (!sessions[session]) {
    sessions[session] = []
  }

  sessions[session].push({
    role: "user",
    content: user
  })

  sessions[session].push({
    role: "assistant",
    content: assistant
  })

  const maxMessages = 12

  while (sessions[session].length > maxMessages) {
    sessions[session].shift()
  }
}
