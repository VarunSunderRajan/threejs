import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai'; // Ensure this matches the way the OpenAI package should be imported
import fetch from 'node-fetch';
dotenv.config(); // Load environment variables

const app = express();
const router = express.Router();

// Ensure express can handle JSON request bodies
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Ensure the API key is correctly set in your .env file
});

// Basic GET route
router.get('/', (req, res) => {
    res.status(200).json({message: "Hello from DALL.E ROUTES"})
});

// POST route to generate images
router.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        if (typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ message: 'Invalid prompt' });
        }

        // Call OpenAI API for image generation
        const imageResponse = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024'
        });

        const imageUrl = imageResponse.data[0]?.url;
        if (imageUrl) {
            const response = await fetch(imageUrl);
            const imageArrayBuffer = await response.arrayBuffer();
            const imageBase64 = Buffer.from(imageArrayBuffer).toString('base64');
            res.status(200).json({ photo: imageBase64 });
        } else {
            res.status(404).json({ message: 'No image data found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

app.use('/api/dalle', router); // Mount the router on a path

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
export default router;