const sessions = {}

export function getMemory(session) {

 if (!sessions[session]) {

  sessions[session] = []

 }

 return sessions[session]

}

export function saveMemory(session, user, assistant) {

 sessions[session].push({
  role: "user",
  content: user
 })

 sessions[session].push({
  role: "assistant",
  content: assistant
 })

 if (sessions[session].length > 10) {

  sessions[session].shift()

 }

}
