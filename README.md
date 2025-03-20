# NoteFlow

This is a **Next.js** project designed to help students efficiently manage and share course notes. The platform enables users to organize notes by course, collaborate in private study groups, and access study material in a structured manner.

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- **User Authentication**: Secure login and authentication using Firebase.
- **Course Selection**: Users can select their study program and view relevant courses.
- **Private Groups**: Create and manage private study groups for collaborative note-taking.
- **Dark Mode Support**: Toggle between light and dark mode for a personalized experience.
- **Real-time Updates**: Course and user roles are updated dynamically using Firestore.

## Project Structure

```
noteflow/
├── components/        # UI components
├── pages/             # Next.js pages
│   ├── index.tsx      # Home page
│   ├── private.tsx    # Private courses page
│   ├── profile.tsx    # User profile page
├── lib/               # Firebase configuration and API calls
├── styles/            # Global styles
├── public/            # Static assets
└── README.md          # Project documentation
```

## Firebase Setup

To enable Firebase features, create a `.env.local` file and configure your credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Firebase Documentation](https://firebase.google.com/docs) - explore Firebase services and integrations.
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about styling with Tailwind CSS.

## Deploying

The easiest way to deploy this Next.js app is with [Vercel](https://vercel.com/):

[Deploy on Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Contribution

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m "Feature description"`).
4. Push to your branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, contact brage.aas.jetne@gmail.com
