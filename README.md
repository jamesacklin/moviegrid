# MovieGrid

An [Immaculate Grid](http://immaculategrid.com)-style game where the player matches actors with pairs of directors they've worked with. Completed as a fun side-project for my wife's co-worker over Labor Day weekend 2023.

[Preview](https://moviegrid-six.vercel.app)

To play the game, use the auto-complete typeahead / dropdown fields to select actors that have worked with directors identified in corresponding the column and row labels. You have 9 guesses to fill out the grid. Wrong answers will cost you a guess, correct answers will not. When you run out of guesses or achieve a perfect score, the game will tell you your score and present an emoji grid (for social media sharing etc).

Uses [Next.js](https://nextjs.org/) with [Airtable](https://airtable.com) for storing the list of actors (and their associated directors).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
