'use client';

import { Button } from "@mui/material";

export default function ProcessJobsButton() {

  const processJobs = async () => {
    console.log('begin processing jobs');
    const res = await fetch(`http://localhost:3000/api/cron`, {
      method: 'GET',
    });

    // const data = await res.json();
    
    // console.log(data);
  }
  
  return (
    <Button onClick={() => processJobs()}>Process Jobs</Button>
  );
}