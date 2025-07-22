// Import socket.io client
const io = require("socket.io-client")

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search)
const email = urlParams.get("email")
const callingId = urlParams.get("callingId")

// Check if we have the required parameters
if (!email || !callingId) {
  alert("Missing required parameters. Redirecting to home page.")
  window.location.href = "/"
}

// DOM elements
const mainVideo = document.getElementById("mainVideo")
const localVideo = document.getElementById("localVideo")
const videosList = document.getElementById("videosList")
const chatMessages = document.getElementById("chatMessages")
const messageInput = document.getElementById("messageInput")
const sendMessageBtn = document.getElementById("sendMessage")
const toggleAudioBtn = document.getElementById("toggleAudio")
const toggleVideoBtn = document.getElementById("toggleVideo")
const toggleScreenShareBtn = document.getElementById("toggleScreenShare")
const toggleRecordingBtn = document.getElementById("toggleRecording")
const toggleFullscreenBtn = document.getElementById("toggleFullscreen")
const endCallBtn = document.getElementById("endCall")
const videosTab = document.getElementById("videosTab")
const chatTab = document.getElementById("chatTab")
const videoContainer = document.getElementById("videosList")
const chatContainer = document.getElementById("chatContainer")
const participantsList = document.getElementById("participantsList")
const participantCount = document.getElementById("participantCount")

// State variables
let localStream = null
let screenStream = null
let isAudioMuted = false
let isVideoOff = false
let isScreenSharing = false
let isRecording = false
let isFullScreen = false
let focusedUser = "local"
let mediaRecorder = null
let recordedChunks = []
const peerConnections = {}
const remoteStreams = {}
let socket = null
let participants = []
let isAdmin = false

// Check if this is the admin
const adminEmail = "admin@fitetse.com" // This would come from environment variables in a real app
isAdmin = email === adminEmail

// Initialize the meeting
async function initializeMeeting() {
  try {
    // Connect to socket server
    socket = io(window.location.origin)

    // Initialize media devices
    await initializeMedia()

    // Set up socket event listeners
    setupSocketListeners()

    // Set up UI event listeners
    setupUIListeners()

    // Update UI
    updateParticipantCount()
  } catch (error) {
    console.error("Error initializing meeting:", error)
    alert("Failed to initialize meeting. Please check your camera and microphone permissions.")
  }
}

// Initialize media devices
async function initializeMedia() {
  try {
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    // Set local video
    localVideo.srcObject = localStream
    mainVideo.srcObject = localStream

    return localStream
  } catch (error) {
    console.error("Error accessing media devices:", error)
    throw error
  }
}

// Set up socket event listeners
function setupSocketListeners() {
  // Connection established
  socket.on("connect", () => {
    console.log("Connected to socket server with ID:", socket.id)

    // Join the room
    socket.emit("join-room", {
      roomId: callingId,
      userId: socket.id,
      email: email,
    })
  })

  // New user connected
  socket.on("user-connected", (userData) => {
    console.log("User connected:", userData)

    // Add to participants list
    addParticipant(userData)

    // Create peer connection for the new user
    createPeerConnection(userData.userId, userData.email)

    // Send offer to the new user
    if (localStream) {
      createOffer(userData.userId)
    }
  })

  // User disconnected
  socket.on("user-disconnected", (userId) => {
    console.log("User disconnected:", userId)

    // Remove peer connection
    if (peerConnections[userId]) {
      peerConnections[userId].close()
      delete peerConnections[userId]
    }

    // Remove remote stream
    if (remoteStreams[userId]) {
      delete remoteStreams[userId]
    }

    // Remove video element
    const videoElement = document.getElementById(`video-${userId}`)
    if (videoElement) {
      videoElement.parentNode.remove()
    }

    // Remove from participants list
    removeParticipant(userId)

    // Reset focused user if needed
    if (focusedUser === userId) {
      focusedUser = "local"
      mainVideo.srcObject = localStream
    }

    // Update UI
    updateParticipantCount()
  })

  // Received an offer
  socket.on("offer", async ({ offer, userId }) => {
    console.log("Received offer from:", userId)

    // Create peer connection if it doesn't exist
    if (!peerConnections[userId]) {
      createPeerConnection(userId)
    }

    // Set remote description
    await peerConnections[userId].setRemoteDescription(new RTCSessionDescription(offer))

    // Create answer
    const answer = await peerConnections[userId].createAnswer()
    await peerConnections[userId].setLocalDescription(answer)

    // Send answer back
    socket.emit("answer", {
      answer,
      to: userId,
    })
  })

  // Received an answer
  socket.on("answer", async ({ answer, userId }) => {
    console.log("Received answer from:", userId)

    // Set remote description
    if (peerConnections[userId]) {
      await peerConnections[userId].setRemoteDescription(new RTCSessionDescription(answer))
    }
  })

  // Received ICE candidate
  socket.on("ice-candidate", async ({ candidate, userId }) => {
    console.log("Received ICE candidate from:", userId)

    // Add ICE candidate
    if (peerConnections[userId]) {
      await peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate))
    }
  })

  // Received chat message
  socket.on("chat-message", (message) => {
    addChatMessage(message, false)
  })

  // Received participants list
  socket.on("participants-list", (list) => {
    participants = list
    updateParticipantsList()
    updateParticipantCount()
  })
}

// Set up UI event listeners
function setupUIListeners() {
  // Toggle audio
  toggleAudioBtn.addEventListener("click", toggleAudio)

  // Toggle video
  toggleVideoBtn.addEventListener("click", toggleVideo)

  // Toggle screen sharing
  toggleScreenShareBtn.addEventListener("click", toggleScreenSharing)

  // Toggle recording
  toggleRecordingBtn.addEventListener("click", toggleRecording)

  // Toggle fullscreen
  toggleFullscreenBtn.addEventListener("click", toggleFullScreen)

  // End call
  endCallBtn.addEventListener("click", endCall)

  // Send message
  sendMessageBtn.addEventListener("click", sendMessage)
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  })

  // Switch tabs
  videosTab.addEventListener("click", () => {
    videosTab.classList.add("active")
    chatTab.classList.remove("active")
    videoContainer.style.display = "block"
    chatContainer.style.display = "none"
  })

  chatTab.addEventListener("click", () => {
    chatTab.classList.add("active")
    videosTab.classList.remove("active")
    videoContainer.style.display = "none"
    chatContainer.style.display = "flex"
  })

  // Focus local video
  document.getElementById("localVideoContainer").addEventListener("click", () => {
    focusOnLocal()
  })
}

// Create peer connection
function createPeerConnection(userId, userEmail) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  })

  // Add local tracks to peer connection
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })
  }

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        candidate: event.candidate,
        to: userId,
      })
    }
  }

  // Handle remote tracks
  pc.ontrack = (event) => {
    const stream = event.streams[0]

    // Store remote stream
    remoteStreams[userId] = {
      stream,
      email: userEmail,
    }

    // Create video element for remote stream
    createVideoElement(userId, stream, userEmail)

    // Set as main video if no focused user
    if (focusedUser === "local" && mainVideo.srcObject === localStream) {
      focusedUser = userId
      mainVideo.srcObject = stream

      // Update active state
      document.getElementById("localVideoContainer").classList.remove("active")
      document.getElementById(`video-${userId}`).parentNode.classList.add("active")
    }
  }

  peerConnections[userId] = pc
  return pc
}

// Create and send offer
async function createOffer(userId) {
  try {
    const pc = peerConnections[userId]
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    socket.emit("offer", {
      offer,
      to: userId,
    })
  } catch (error) {
    console.error("Error creating offer:", error)
  }
}

// Create video element for remote stream
function createVideoElement(userId, stream, userEmail) {
  // Create container
  const videoContainer = document.createElement("div")
  videoContainer.className = "video-item"
  videoContainer.id = `container-${userId}`

  // Create video element
  const videoElement = document.createElement("video")
  videoElement.id = `video-${userId}`
  videoElement.autoplay = true
  videoElement.playsInline = true
  videoElement.srcObject = stream

  // Create user label
  const userLabel = document.createElement("div")
  userLabel.className = "user-label"
  userLabel.textContent = userEmail || userId

  // Create watermark
  const watermark = document.createElement("div")
  watermark.className = "watermark"
  watermark.textContent = "FITETSE"

  // Add elements to container
  videoContainer.appendChild(videoElement)
  videoContainer.appendChild(userLabel)
  videoContainer.appendChild(watermark)

  // Add click event to focus this video
  videoContainer.addEventListener("click", () => {
    focusOnUser(userId)
  })

  // Add to videos list
  videosList.appendChild(videoContainer)
}

// Focus on a user's video
function focusOnUser(userId) {
  // Update focused user
  focusedUser = userId

  // Update main video
  mainVideo.srcObject = remoteStreams[userId].stream

  // Update active state
  document.querySelectorAll(".video-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.getElementById(`container-${userId}`).classList.add("active")
}

// Focus on local video
function focusOnLocal() {
  // Update focused user
  focusedUser = "local"

  // Update main video
  mainVideo.srcObject = localStream

  // Update active state
  document.querySelectorAll(".video-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.getElementById("localVideoContainer").classList.add("active")
}

// Toggle audio
function toggleAudio() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isAudioMuted = !audioTrack.enabled

      // Update UI
      toggleAudioBtn.innerHTML = isAudioMuted
        ? '<i class="fas fa-microphone-slash"></i>'
        : '<i class="fas fa-microphone"></i>'

      toggleAudioBtn.classList.toggle("active", isAudioMuted)
    }
  }
}

// Toggle video
function toggleVideo() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isVideoOff = !videoTrack.enabled

      // Update UI
      toggleVideoBtn.innerHTML = isVideoOff ? '<i class="fas fa-video-slash"></i>' : '<i class="fas fa-video"></i>'

      toggleVideoBtn.classList.toggle("active", isVideoOff)
    }
  }
}

// Toggle screen sharing
async function toggleScreenSharing() {
  try {
    if (isScreenSharing) {
      // Stop screen sharing and revert to camera
      await stopScreenSharing()
    } else {
      // Start screen sharing
      await startScreenSharing()
    }
  } catch (error) {
    console.error("Error toggling screen sharing:", error)
  }
}

// Start screen sharing
async function startScreenSharing() {
  try {
    // Get screen stream
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    })

    // Keep audio from camera
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        screenStream.addTrack(audioTrack)
      }
    }

    // Stop camera video track
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => track.stop())
    }

    // Update local stream
    localStream = screenStream

    // Update video elements
    localVideo.srcObject = screenStream
    if (focusedUser === "local") {
      mainVideo.srcObject = screenStream
    }

    // Update all peer connections with screen sharing stream
    Object.keys(peerConnections).forEach((userId) => {
      const pc = peerConnections[userId]
      const senders = pc.getSenders()

      const videoTrack = screenStream.getVideoTracks()[0]
      const videoSender = senders.find((sender) => sender.track && sender.track.kind === "video")

      if (videoSender && videoTrack) {
        videoSender.replaceTrack(videoTrack)
      }
    })

    // Handle screen sharing ended by user
    screenStream.getVideoTracks()[0].onended = () => {
      stopScreenSharing()
    }

    // Update state and UI
    isScreenSharing = true
    toggleScreenShareBtn.classList.add("active")
  } catch (error) {
    console.error("Error starting screen sharing:", error)
    throw error
  }
}

// Stop screen sharing
async function stopScreenSharing() {
  try {
    // Stop screen sharing tracks
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }

    // Reinitialize camera
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    // Update video elements
    localVideo.srcObject = localStream
    if (focusedUser === "local") {
      mainVideo.srcObject = localStream
    }

    // Update all peer connections with camera stream
    Object.keys(peerConnections).forEach((userId) => {
      const pc = peerConnections[userId]
      const senders = pc.getSenders()

      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track && s.track.kind === track.kind)
        if (sender) {
          sender.replaceTrack(track)
        }
      })
    })

    // Update state and UI
    isScreenSharing = false
    toggleScreenShareBtn.classList.remove("active")
  } catch (error) {
    console.error("Error stopping screen sharing:", error)
    throw error
  }
}

// Toggle recording
function toggleRecording() {
  if (isRecording) {
    stopRecording()
  } else {
    startRecording()
  }
}

// Start recording
function startRecording() {
  // Only start recording if admin or at least one other participant
  if (!isAdmin && Object.keys(remoteStreams).length === 0) {
    alert("Recording can only start when at least two participants are in the meeting.")
    return
  }

  // Get the main video stream
  const stream = mainVideo.srcObject

  if (!stream) return

  // Create media recorder
  mediaRecorder = new MediaRecorder(stream)
  recordedChunks = []

  // Handle data available event
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data)
    }
  }

  // Handle recording stopped
  mediaRecorder.onstop = () => {
    // Create blob from recorded chunks
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = `fitetse-recording-${new Date().toISOString()}.webm`
    document.body.appendChild(a)
    a.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)

    // Update state and UI
    isRecording = false
    toggleRecordingBtn.classList.remove("active")
  }

  // Start recording
  mediaRecorder.start()

  // Update state and UI
  isRecording = true
  toggleRecordingBtn.classList.add("active")
}

// Stop recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop()
  }
}

// Toggle fullscreen
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`)
    })

    // Update state and UI
    isFullScreen = true
    toggleFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>'
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()

      // Update state and UI
      isFullScreen = false
      toggleFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>'
    }
  }
}

// End call
function endCall() {
  // Stop all tracks
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop())
  }

  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop())
  }

  // Stop recording if active
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop()
  }

  // Close all peer connections
  Object.values(peerConnections).forEach((pc) => pc.close())

  // Disconnect socket
  if (socket) {
    socket.disconnect()
  }

  // Redirect to home page
  window.location.href = "/"
}

// Send chat message
function sendMessage() {
  const messageText = messageInput.value.trim()

  if (messageText === "") return

  const message = {
    text: messageText,
    sender: email,
    timestamp: new Date().toISOString(),
  }

  // Send to server
  socket.emit("chat-message", {
    message,
    roomId: callingId,
  })

  // Add to chat
  addChatMessage(message, true)

  // Clear input
  messageInput.value = ""
}

// Add chat message
function addChatMessage(message, isSent) {
  // Create message element
  const messageElement = document.createElement("div")
  messageElement.className = `message ${isSent ? "sent" : "received"}`

  // Create sender element
  const senderElement = document.createElement("div")
  senderElement.className = "sender"
  senderElement.textContent = isSent ? "You" : message.sender

  // Create text element
  const textElement = document.createElement("div")
  textElement.textContent = message.text

  // Add elements to message
  messageElement.appendChild(senderElement)
  messageElement.appendChild(textElement)

  // Add to chat
  chatMessages.appendChild(messageElement)

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Add participant
function addParticipant(userData) {
  // Add to participants array if not already there
  if (!participants.find((p) => p.userId === userData.userId)) {
    participants.push(userData)
  }

  // Update UI
  updateParticipantsList()
  updateParticipantCount()
}

// Remove participant
function removeParticipant(userId) {
  // Remove from participants array
  participants = participants.filter((p) => p.userId !== userId)

  // Update UI
  updateParticipantsList()
  updateParticipantCount()
}

// Update participants list
function updateParticipantsList() {
  // Clear existing list (except local participant)
  const elements = participantsList.querySelectorAll("li:not(#localParticipant)")
  elements.forEach((el) => el.remove())

  // Add participants
  participants.forEach((participant) => {
    const listItem = document.createElement("li")
    listItem.className = "list-group-item d-flex justify-content-between align-items-center"
    listItem.textContent = participant.email || participant.userId

    participantsList.appendChild(listItem)
  })
}

// Update participant count
function updateParticipantCount() {
  participantCount.textContent = participants.length + 1 // +1 for local participant
}

// Initialize the meeting when the page loads
window.addEventListener("load", initializeMeeting)
