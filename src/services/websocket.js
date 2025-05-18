import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient = null

export function connectToWebSocket(onMessage) {
  const socket = new SockJS('http://localhost:6969/ws')
  stompClient = Stomp.over(socket)

  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/result-updates', (message) => {
      const resultDto = JSON.parse(message.body)
      onMessage(resultDto)
    })
  })
}

export function disconnectFromWebSocket() {
  if (stompClient) {
    stompClient.disconnect()
  }
}