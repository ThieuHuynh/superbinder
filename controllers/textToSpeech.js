const { ElevenLabsClient } = require("elevenlabs");

/**
 * Create ElevenLabs client only if API key is available
 * @returns {ElevenLabsClient|null}
 */
const createClient = () => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return null;
  }
  try {
    return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
  } catch (error) {
    console.error('Failed to create ElevenLabs client:', error.message);
    return null;
  }
};

const voices = async (req, res) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(200).json({
        message: 'ElevenLabs API key not configured',
        voices: [],
      });
    }

    const client = createClient();
    if (!client) {
      return res.status(200).json({
        message: 'ElevenLabs client unavailable',
        voices: [],
      });
    }

    const voiceSearch = await client.voices.search({
      include_total_count: true,
    });

    res.status(200).json({
      message: 'Voices Loaded Successfully',
      voices: voiceSearch.voices.map((voice) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        labels: voice.labels,
      })),
    });
  } catch (error) {
    console.error('ElevenLabs voices error:', error.message);
    // Return empty voices instead of crashing
    res.status(200).json({
      message: 'Failed to load voices',
      voices: [],
      error: error.message,
    });
  }
};

const generateAudio = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { text, path: voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(503).json({ message: "ElevenLabs API key not configured" });
    }

    const client = createClient();
    if (!client) {
      return res.status(503).json({ message: "ElevenLabs client unavailable" });
    }

    const stream = await client.textToSpeech.convertAsStream(
      voiceId || "JBFqnCBsd6RMkjVDRZzb",
      {
        output_format: "mp3_44100_128",
        text,
        model_id: "eleven_flash_v2_5", //eleven_multilingual_v2
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Stream Error:', err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });

    stream.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error('Text-to-Speech Error:', error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Error generating audio",
        error: error.message,
      });
    }
  }
};

module.exports = { voices, generateAudio };