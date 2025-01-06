# TODO (prioritized)

## MVP
- [X] add ability for admin to modify the settings (set OpenAI API Key, Cashmere API Key)
- [X] modify server to use Cashmere API key from the database on API calls
- [ ] add ability for admin to view all cashmere collections and omnibooks their API key has access to in admin
- [ ] install Omnibook library, integrate with cashmere service for retrieving data
- [ ] build entire omnibook --> audio conversion flow. Select omnibook(s) in table-->generate audio
- [ ] add user roles (regular user, admin)
- [ ] make admin menu icon only show up for admin users
- [X] protect the admin routes to ensure only admins can access them (implemented lazy solution, set it to only accept single first user as admin for now)
- [ ] add ability for admin to trigger audio transcription jobs
- [ ] connect FE interface to play generated audio files
- [ ] track consumption of audio content, handle reporting back to cashmere

## Nice to Haves
- [ ] add ability for admin to give other users admin user role
- [ ] add ability for admin to create new tags
- [ ] add ability for admin to tag omnibooks
- [ ] add ability for admin to display "collections" of omnibooks based on their tags
- [ ] add ability to view transcription status for an omnibook
- [ ] add ability for admin to view site activity (which audio blocks have been consumed, which customer, etc. so we can ensure matches with cashmere reporting)
- [ ] add ability to display tagged collections on the homepage
- [ ] update all forms to submit when you hit "enter"
- [ ] update "reset password" page to use MUI components
- [ ] add social sign in (i.e. Google Auth)
- [ ] modify hero section to change once a user is logged in



# Developer Thoughts...
Jan 4, 2025
I'm thinking through how to handle the audiobook conversion process. I think I want to handle this similarly to how I did it before, where every block generates its own audio file (eventually paving the way to have multiple voices). Then, the backend is able to stich the audio files together based on its knowledge of the omnibook section, as the filenames will be the same as the bookblock uuid.

This feels like it should provide an entry way to make it easier to report which blocks are being used. Ideally I think I'd like to stitch the blocks together in realtime, and deliver it back to the audio stream—but I don't know if that's possible. The reason I like this is it provides realtime consumption data back to Cashmere, and doesn't "overcompensate" for data usage for the client. Ideally they should only be tracked for what they actually use. The main problem that pops out in my mind is it seems like scanning will be difficult to handle with this method. I just don't know enough yet...

I think what we'll need to do is create a parent job to translate the omnibook, and then create a ton of child jobs for each of the book blocks. Each book block becomes its own job. I think we'll need to create a CRON job with vercel that pings supabase for open jobs, and then submits those jobs to openai. if successful, it should update the job in supabase

Jan 5, 2025
i've been thinking more about this. I think what I'm going to do is implement a routine that handles both reporting and licensing in the same call. The application reports back the API which blocks it has used, and then in the same call, the API response with information about whether the application has permission to do what it says it can do. the big thing here is, the application can bundle a bunch of book block requests together, and it can operate optimistically, meaning it doens't have to wait for a response from the server before it can move forward. but if the response it gets from the server is negative, then the application needs to handle it and cancel the operation.

Also, as far as the tts process goes, i'm going to set up a "poor man's" MQ system using cron jobs and a supabase jobs table.