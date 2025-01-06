import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import SignInForm from "./sign-in-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sign In'
};


export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <SignInForm message={searchParams} />
  );
}
