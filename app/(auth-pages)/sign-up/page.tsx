import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import SignUpForm from "./sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sign Up'
};

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("success" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return <SignUpForm message={searchParams} />

  // return (
  //   <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
  //     <Box>
  //       <Box>
  //         <Typography variant="h4">Sign up</Typography>
  //         <Typography variant="body1">
  //           Already have an account?{" "}
  //           <Link href="/sign-in">
  //             Sign in
  //           </Link>
  //         </Typography>

  //       </Box>
  //       <Card sx={{width: '100%', marginTop: 2}}>
  //         <Box
  //           component="form"
  //           sx={{padding: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
  //           <TextField
  //             variant="standard"
  //             label="Email"
  //             placeholder="you@example.com" 
  //           />
  //           <TextField
  //             variant="standard"
  //             label="Password"
  //             placeholder="Your password"
  //             type="password"
  //           />
  //         </Box>
  //         <CardActions sx={{display: 'flex', justifyContent: 'center'}}>
  //           <Button variant="contained" onClick={() => signUpAction}>Sign Up</Button>

  //         </CardActions>
  //       </Card>

  //     </Box>
  //   </Box>
    
    
  //   // <>
  //   //   <form className="flex flex-col min-w-64 max-w-64 mx-auto">
  //   //     <h1 className="text-2xl font-medium">Sign up</h1>
  //   //     <p className="text-sm text text-foreground">
  //   //       Already have an account?{" "}
  //   //       <Link className="text-primary font-medium underline" href="/sign-in">
  //   //         Sign in
  //   //       </Link>
  //   //     </p>
  //   //     <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
  //   //       <Label htmlFor="email">Email</Label>
  //   //       <Input name="email" placeholder="you@example.com" required />
  //   //       <Label htmlFor="password">Password</Label>
  //   //       <Input
  //   //         type="password"
  //   //         name="password"
  //   //         placeholder="Your password"
  //   //         minLength={6}
  //   //         required
  //   //       />
  //   //       <SubmitButton formAction={signUpAction} pendingText="Signing up...">
  //   //         Sign up
  //   //       </SubmitButton>
  //   //       <FormMessage message={searchParams} />
  //   //     </div>
  //   //   </form>
  //   //   <SmtpMessage />
  //   // </>
  // );
}
