<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ToCuDrDg-dTrtk6cdOU7tP9Y-0krT7WN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Locally create a file named `.env.local` in the project root and add your Gemini key:

```
GEMINI_API_KEY=your_real_gemini_api_key_here
```

3. Run the app locally for development:
   `npm run dev`

4. To build and preview the production bundle locally:
   ```
   npm run build
   npm run preview
   ```

5. Deploy on Netlify:
   - Create a new site and connect your repo (or drag & drop the `dist` folder).
   - Set in Netlify UI: Build command = `npm run build`, Publish directory = `dist`.
   - In Netlify Site settings → Build & deploy → Environment, add `GEMINI_API_KEY` with your key.

Notes:
- The application calls Gemini through secure Netlify Functions (`netlify/functions/*`), so the API key never reaches the browser.
- Do NOT commit `.env.local` — it is included in `.gitignore`.
