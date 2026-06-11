"use client";
import { useEffect } from "react";

export default function CallOffRecordsRedirect() {
  useEffect(() => {
    window.location.href = "https://supervisor.xing.wtf/calloffs";
  }, []);
  return null;
}
