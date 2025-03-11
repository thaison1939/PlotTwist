## Project Overview  

**PlotTwist** is a dynamic web-based quiz application built with **Next.js** and **TypeScript**, featuring a serverless backend powered by **AWS Lambda**, **Amazon S3**, and **Supabase**. It challenges users to spot the lie among three truths about celebrities, creating a fun and engaging experience. 

## ☁️ AWS Integration  

The backend is built on a serverless architecture with AWS, ensuring scalability and reliability:  

- **AWS Lambda**  
  - Acts as the API layer, handling requests via endpoints like `/api/questions` and `/api/image`.  
  - Connects to Supabase to fetch quiz data, generates and validates `sessionToken` to filtered out answered questions.

- **Amazon S3**  
  - Used for hosting celebrity images, ensuring fast and secure access.  
  - Lambda retrieves images via signed URLs. 

- **Supabase Integration**  
  - Serves as the database layer for storing quiz questions, celebrity data, and session metadata.  
  - Lambda queries Supabase to deliver dynamic content and track user progress.  