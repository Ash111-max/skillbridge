# import sounddevice as sd
# print(sd.query_devices())
# print("Default Input Device:", sd.default.device)

# import sounddevice as sd
# from scipy.io.wavfile import write

# fs = 44100
# seconds = 5
# print("🎙️ Recording test... Speak now!")
# rec = sd.rec(int(seconds * fs), samplerate=fs, channels=1, dtype='int16', device=3)
# sd.wait()
# write("test.wav", fs, rec)
# print("✅ Saved test.wav")

# # Play back
# sd.play(rec, fs)
# sd.wait()
# print("🔊 Playback complete!")
