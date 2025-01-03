// About Us

import { Box, Typography } from "@mui/material";

// What is Spriggle ?

//   Spriggle is more than an audiobook platform—it’s a blueprint for the future of publishing in the AI era.By combining cutting - edge technology with a deep respect for intellectual property, we’ve created a way for publishers to harness the power of AI responsibly while delivering incredible value to families.

// Spriggle uses Cashmere, our groundbreaking API, to license book content in a way that ensures publishers maintain full control over how their intellectual property is used.From there, Spriggle transforms that content into high - quality, AI - generated audiobooks that families can access at a fraction of the cost of traditional audiobooks.

// Why Spriggle ?

//   Spriggle was built to solve a critical challenge in publishing: How can publishers embrace AI while staying true to their principles of Consent, Compensation, and Credit ?

//     Here’s how we make it possible:
// 1.	Consent: Publishers retain full control over how their content is used, with licensing managed transparently through Cashmere.
// 	2.	Compensation: Every listen generates revenue for publishers and authors, ensuring fair payment for their work.
// 	3.	Credit: AI - generated audiobooks give proper acknowledgment to the original creators.

// At the same time, Spriggle offers a game - changing benefit for families: affordable, high - quality audiobooks for children.By leveraging AI, we eliminate many of the costs associated with traditional audiobook production, making stories more accessible than ever.

// How Spriggle Works
// 1.	Powered by Cashmere
// Cashmere licenses book IP and tracks usage so publishers can confidently work with AI while maintaining full control of their content.
// 	2.	AI Narration
// Using publisher - provided tools like OpenAI, Spriggle generates engaging, natural - sounding audiobooks from licensed text.
// 	3.	Affordable Access
// Families gain access to incredible stories at a fraction of the cost of traditional audiobooks, opening doors to more learning and imagination.
// 	4.	Transparent Reporting
// Every interaction is tracked and reported back to Cashmere, ensuring publishers know exactly how their content is being used.

// The Bigger Picture

// Spriggle isn’t just for us—it’s for you.We’ve built this platform as an open - source project to empower publishers to launch their own versions of Spriggle.By doing so, publishers can:
// 	•	Offer affordable audiobooks to their own audiences.
// 	•	Maintain full control over their content and revenue.
// 	•	Experiment with AI - powered innovation in a way that’s fully transparent and respectful of their rights.

//   We’re building Spriggle to prove that AI doesn’t have to be a threat to publishing—it can be the key to unlocking new opportunities for growth and connection.

// Join the Movement

// Spriggle is our way of showing what’s possible when publishers and technology work together.By solving for the “3 C’s” and providing an affordable option for families, we’re creating a win - win for everyone.

// Learn More About Cashmere | Explore Spriggle on GitHub

// Let me know if you’d like further tweaks!

export default function AboutUsPage() {

  const content: any[] = [
    {
      variant: 'h2',
      text: 'What is Spriggle?',
    },
    {
      variant: 'body1',
      component: 'p',
      text: `Spriggle is more than an audiobook platform—it’s a blueprint for the future of publishing in the AI era.By combining cutting - edge technology with a deep respect for intellectual property, we’ve created a way for publishers to harness the power of AI responsibly while delivering incredible value to families.`
    },
    {
      variant: 'body1',
      text: `Spriggle uses Cashmere, our groundbreaking API, to license book content in a way that ensures publishers maintain full control over how their intellectual property is used. From there, Spriggle transforms that content into high-quality, AI-generated audiobooks that families can access at a fraction of the cost of traditional audiobooks.`,
    },
    {
      variant: 'h3',
      text: `Why Spriggle?`,
    },
  ];
  
  
  return (
    <Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '720px', margin: 'auto', padding: 2}}>
        {content.map((item, idx) => (
          <Typography key={idx} variant={item.variant} component={item.component ? item.component : item.type}>
            {item.text}
          </Typography>
        ))}

      </Box>
    </Box>
  );
}