export async function recordAudio(onStop) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)

  let chunks = []

  recorder.ondataavailable = e => chunks.push(e.data)

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" })
    onStop(blob)
  }

  recorder.start()

  return recorder
}
