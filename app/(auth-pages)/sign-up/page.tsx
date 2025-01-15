import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import SignUpForm from "./sign-up-form";

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
}
