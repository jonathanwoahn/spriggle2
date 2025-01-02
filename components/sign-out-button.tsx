'use client';
import { Button } from "@mui/material";
import { signOutAction } from "@/app/actions";

export default function SignOutButton() {

  return (
    <Button onClick={() => signOutAction()}>Sign Out</Button>
  );
}