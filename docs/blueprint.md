# **App Name**: DriveWhizz

## Core Features:

- WhatsApp Command Listener: Receive WhatsApp messages via Twilio Sandbox (or WhatsApp Cloud API) and route commands.
- Command Parser: Parse commands like LIST, DELETE, MOVE, and SUMMARY from WhatsApp messages.
- Google Drive Integration: Authenticate with Google Drive via OAuth2 to access user's files and folders.
- List Files: List files within a specified Google Drive folder.
- Delete File: Delete a specific file from Google Drive after confirmation.
- Move File: Move a specific file from one folder to another in Google Drive.
- Summarize File: Tool: Summarize content of PDF, DOCX, or TXT files using OpenAI to produce a bullet point digest. This LLM will make reasoning on how to choose the most relevant bits of information in the file to use in its output.

## Style Guidelines:

- Primary color: A soft blue (#77B5FE) to evoke a sense of trust and efficiency, as this app concerns document handling.
- Background color: Very light desaturated blue (#F0F8FF). Provides a clean, non-intrusive backdrop that highlights content.
- Accent color: A muted violet (#B084CC), used for secondary actions or highlights; chosen for its analog relationship to blue while providing enough contrast.
- Body and headline font: 'Inter' (sans-serif) for a modern, machined, objective, neutral look.
- Use minimalist, clear icons to represent file actions and status within the WhatsApp interface (e.g., file types, confirmation status). Avoid overloading icons with unnecessary detail.
- Design a clean and simple layout to facilitate quick access to features via WhatsApp, presenting the Google Drive actions and results in a straightforward manner.
- Implement subtle loading animations to indicate processing states. Focus on quick, unobtrusive feedback to ensure the user is informed without significant delay.