import { FormMessage, Message } from "@/components/form-message";
import SignInForm from "./sign-in-form";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <SignInForm message={searchParams} />
  );
}
